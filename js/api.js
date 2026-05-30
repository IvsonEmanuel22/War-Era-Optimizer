import { API_HOSTS, PROXY, MM_TIER_TO_CODE, ALLOWED_COUNTRY_CODES } from './config.js';
import { setStatus } from './utils.js';

// ─── Player data cache ───────────────────────────────────────────────────────

const _playerCache     = new Map();
const _PLAYER_CACHE_TTL = 5 * 60 * 1000;

export function clearPlayerCache(userId) {
  if (userId) _playerCache.delete(userId);
  else _playerCache.clear();
}

// ─── tRPC core ────────────────────────────────────────────────────────────────
// ─── Global request rate limiter ─────────────────────────────────────────────
// Staggers all outgoing requests by at least REQUEST_INTERVAL ms so the initial
// burst never triggers 429 before _rateLimitPauseUntil can kick in.
// Each call atomically reserves the next available slot, queuing naturally.

const REQUEST_INTERVAL = 300;
let   _nextSlotAt      = 0;

async function _waitForSlot() {
  const now  = Date.now();
  const slot = Math.max(now, _nextSlotAt);
  _nextSlotAt = slot + REQUEST_INTERVAL;
  if (slot > now) await new Promise(r => setTimeout(r, slot - now));
}

// ─── tRPC core ────────────────────────────────────────────────────────────────
// 429 handling: exponential backoff with up to MAX_429_RETRIES attempts.
// 1.5s → 3s → 6s → 12s → 24s covers the full 60s rate-limit window.
// _rateLimitPauseUntil is shared across all in-flight requests so that a single
// 429 pauses the entire call-site, preventing a thundering-herd retry storm.
const MAX_429_RETRIES = 5;
let _rateLimitPauseUntil = 0;

let _apiHostIdx = 0;

export async function trpc(path, input, retries = 2) {
  const query = '?input=' + encodeURIComponent(JSON.stringify(input ?? {}));
  let lastErr;

  for (let i = 0; i < API_HOSTS.length; i++) {
    const hostIdx = (_apiHostIdx + i) % API_HOSTS.length;
    const url = API_HOSTS[hostIdx] + '/trpc/' + path + query;
    let networkFailed = false;

    let retries429 = 0;
    for (let attempt = 0; attempt <= retries; attempt++) {
      await _waitForSlot();
      const pauseMs = _rateLimitPauseUntil - Date.now();
      if (pauseMs > 0) {
        await new Promise(r => setTimeout(r, pauseMs));
        await _waitForSlot(); // re-serialize after rate-limit pause — prevents thundering herd
      }

      let res;
      try {
        res = await fetch(url);
      } catch (err) {
        err.kind = 'network';
        err.url  = url;
        err.path = path;
        lastErr  = err;
        networkFailed = true;
        break;
      }

      if (res.ok) {
        _apiHostIdx = hostIdx;
        return (await res.json()).result?.data;
      }

      if (res.status >= 500) {
        const err = new Error(path + ' ' + res.status);
        err.status = res.status;
        err.path   = path;
        err.kind   = 'network';
        err.url    = url;
        lastErr    = err;
        networkFailed = true;
        break;
      }

      if (res.status === 429 && retries429 < MAX_429_RETRIES) {
        const retryAfter = parseFloat(res.headers.get('retry-after') || '0');
        const delay = retryAfter > 0 ? retryAfter * 1000 : 1500 * Math.pow(2, retries429);
        _rateLimitPauseUntil = Math.max(_rateLimitPauseUntil, Date.now() + delay);
        retries429++;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      let body = '';
      try {
        const json = await res.json();
        body = json?.error?.message
          || json?.error?.json?.message
          || (Array.isArray(json) ? json[0]?.error?.json?.message : '')
          || '';
      } catch {}

      const err = new Error(path + ' ' + res.status + (body ? ': ' + body : ''));
      err.status = res.status;
      err.path   = path;
      err.body   = body;
      throw err;
    }

    if (networkFailed) _apiHostIdx = (hostIdx + 1) % API_HOSTS.length;
  }

  throw lastErr || Object.assign(
    new Error(path + ': all WarEra API hosts unreachable'),
    { kind: 'network', path },
  );
}

// Authenticated variant — goes through the CORS proxy with POST+batch.
export async function trpcAuth(path, input, retries = 2) {
  const url  = PROXY + '/trpc/' + path + '?batch=1';
  const body = JSON.stringify({ 0: input ?? {} });

  for (let attempt = 0; attempt <= retries; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      err.kind = 'network';
      err.url  = url;
      err.path = path;
      throw err;
    }

    if (res.ok) {
      const json  = await res.json();
      const batch = Array.isArray(json) ? json[0] : json;
      if (batch?.error) {
        const err = new Error(path + ': ' + (batch.error?.message || 'tRPC error'));
        err.path = path;
        err.body = batch.error?.message || '';
        throw err;
      }
      return batch?.result?.data;
    }

    if (res.status >= 500 && attempt < retries) {
      await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
      continue;
    }

    if (res.status === 429 && attempt < retries) {
      const retryAfter = parseFloat(res.headers.get('retry-after') || '0');
      const delay = retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }

    let bodyMsg = '';
    try {
      const json   = await res.json();
      const batch  = Array.isArray(json) ? json[0] : json;
      bodyMsg = batch?.error?.message || batch?.error?.json?.message || '';
    } catch {}

    const err = new Error(path + ' ' + res.status + (bodyMsg ? ': ' + bodyMsg : ''));
    err.status = res.status;
    err.path   = path;
    err.body   = bodyMsg;
    throw err;
  }
}

// ─── Company pagination ───────────────────────────────────────────────────────

async function fetchAllCompanyIds(userId) {
  const PER_PAGE = 100;
  const ids  = [];
  const seen = new Set();
  let cursor, page = 0, broken = false;

  while (true) {
    let result;
    try {
      const params = cursor
        ? { userId, perPage: PER_PAGE, cursor }
        : { userId, perPage: PER_PAGE };
      result = await trpc('company.getCompanies', params);
    } catch (err) {
      if (err.status === 500 && /movedUpAt|Cast to date failed/i.test(err.body || err.message || '')) {
        console.warn(`company.getCompanies pagination broke at page ${page + 1}; collected ${ids.length}.`);
        ids.truncated = true;
        return ids;
      }
      throw err;
    }

    page++;
    for (const id of result?.items || []) {
      if (!seen.has(id)) { seen.add(id); ids.push(id); }
    }

    if (!result?.nextCursor || typeof result.nextCursor !== 'string') break;

    if (result.nextCursor.startsWith('undefined|') || result.nextCursor.includes('|undefined')) {
      broken = true;
      console.warn(`company.getCompanies pagination unreachable at page ${page + 1} (broken cursor); returning ${ids.length} companies.`);
      break;
    }

    cursor = result.nextCursor;
  }

  if (broken) ids.truncated = true;
  return ids;
}

// ─── Player data fetchers ─────────────────────────────────────────────────────

export async function fetchDirect(username, options = {}) {
  setStatus('Searching ' + username + '...');

  const searchResult = await trpc('search.searchAnything', { searchText: username });
  const userIds = searchResult?.userIds || [];

  if (!userIds.length)
    return { error: `No user found for "${username}". Check the spelling or try a shorter prefix.` };

  const users = (await Promise.all(
    userIds.slice(0, 5).map(async uid => {
      try {
        const u = await trpc('user.getUserLite', { userId: uid });
        return u ? { id: u._id, username: u.username } : null;
      } catch { return null; }
    }),
  )).filter(Boolean);

  if (!users.length) return { error: `No user found for "${username}"` };

  const queryLower = username.toLowerCase();
  const exactMatch = users.find(u => u.username.toLowerCase() === queryLower);

  if (users.length === 1)  return fetchByUserId(users[0].id, options);
  if (exactMatch)          return fetchByUserId(exactMatch.id, options);
  return { needsPick: true, query: username, candidates: users };
}

// ─── Session caches for repeated sub-lookups ─────────────────────────────────

const _regionCache   = new Map();               // regionId → region object (permanent per session)
const _userLiteCache = new Map();               // userId   → { data, ts }
const _USER_LITE_TTL = 10 * 60 * 1000;

async function _getRegion(regionId) {
  if (_regionCache.has(regionId)) return _regionCache.get(regionId);
  const region = await trpc('region.getById', { regionId }).catch(() => null);
  _regionCache.set(regionId, region);
  return region;
}

async function _getUserLite(userId) {
  const cached = _userLiteCache.get(userId);
  if (cached && Date.now() - cached.ts < _USER_LITE_TTL) return cached.data;
  const data = await trpc('user.getUserLite', { userId }).catch(() => null);
  _userLiteCache.set(userId, { data, ts: Date.now() });
  return data;
}

// Fetches full detail for a single company. Exported for lazy per-company loading.
export async function fetchCompanyDetail(coId, countries) {
  const detail      = await trpc('company.getById',            { companyId: coId }).catch(() => null);
  const bonus       = await trpc('company.getProductionBonus', { companyId: coId }).catch(() => null);
  const workersData = await trpcAuth('worker.getWorkers',      { companyId: coId }).catch(() => null);

  const companyRegion = detail?.region ? await _getRegion(detail.region) : null;

  const enrichedWorkers = await Promise.all(
    (workersData?.workers || []).map(async w => {
      const userLite = await _getUserLite(w.user);
      return {
        ...w,
        username:   userLite?.username                  || w.user.slice(-6),
        level:      userLite?.leveling?.level           || 0,
        energy:     userLite?.skills?.energy?.total     || 0,
        production: userLite?.skills?.production?.total || 0,
      };
    }),
  );

  const coIncomeTax = countries?.find(c => c._id === companyRegion?.country)?.taxes?.income ?? 0;
  const workersWithTax = enrichedWorkers.map(w => ({ ...w, incomeTax: coIncomeTax }));

  return {
    id:         coId,
    detail,
    bonus,
    workers:    workersWithTax,
    disabledAt: detail?.disabledAt || null,
    aeActive:   !detail?.disabledAt,
  };
}

// onCompanyProgress(partialData, loaded, total) — called after each company loads,
// allowing the UI to render progressively rather than waiting for all companies.
export async function fetchByUserId(userId, { onCompanyProgress } = {}) {
  const cached = _playerCache.get(userId);
  if (cached && Date.now() - cached.ts < _PLAYER_CACHE_TTL) {
    setStatus('Dados em cache — ' + (cached.data.user?.username || userId));
    return cached.data;
  }

  setStatus('Carregando usuário, país e preços...');

  const [user, countries, prices] = await Promise.all([
    trpc('user.getUserById',    { userId }).catch(() => null),
    trpc('country.getAllCountries').catch(() => null),
    trpc('itemTrading.getPrices', {}),
  ]);

  const country = countries?.find(c => c._id === user?.country);
  if (!country || !ALLOWED_COUNTRY_CODES.has(country.code))
    return {
      error: (user?.username || 'Player')
        + ' is from '
        + (country?.name || 'an unrecognised country')
        + ' — this tool is restricted to allied countries.',
    };

  setStatus('Carregando empresas de ' + (user?.username || 'usuário') + '...');
  const companyIds = await fetchAllCompanyIds(userId);

  let employer = null;
  if (user?.company) {
    const [company, workersData, bonus] = await Promise.all([
      trpc('company.getById',            { companyId: user.company }).catch(() => null),
      trpcAuth('worker.getWorkers',      { companyId: user.company }).catch(() => null),
      trpc('company.getProductionBonus', { companyId: user.company }).catch(() => null),
    ]);

    const selfWorker = workersData?.workers?.find(w => w.user === userId);

    if (selfWorker) {
      const region = company?.region ? await _getRegion(company.region) : null;
      const regionCountry = countries?.find(c => c._id === region?.country) ?? null;
      const incomeTax = regionCountry?.taxes?.income ?? 0;

      const gross    = selfWorker.wage     || 0;
      const fidelity = selfWorker.fidelity || 0;
      // Worker pays tax from their own wallet; fidelity affects only production, not wages.
      const netWagePerPP = gross * (1 - incomeTax / 100);

      employer = {
        companyId:       user.company,
        companyName:     company?.name  || '(unknown)',
        countryName:     regionCountry?.name || '(unknown)',
        countryCode:     regionCountry?.code || '',
        grossWage:       gross,
        netWagePerPP,
        fidelity,
        incomeTaxPct:    incomeTax,
        productionBonus: bonus?.total || 0,
      };
    }
  }

  const ids       = companyIds || [];
  const truncated = !!companyIds?.truncated;

  if (!ids.length) {
    const result = { userId, user, companies: [], prices, employer, companiesTruncated: truncated };
    _playerCache.set(userId, { data: result, ts: Date.now() });
    return result;
  }

  setStatus('Buscando detalhes de ' + ids.length + ' empresas...');

  const companies = [];
  for (let i = 0; i < ids.length; i++) {
    setStatus(`Empresa ${i + 1}/${ids.length} — ${user?.username || userId}`);
    const co = await fetchCompanyDetail(ids[i], countries);
    companies.push(co);
    onCompanyProgress?.(
      { userId, user, companies: companies.slice(), prices, employer, companiesTruncated: truncated },
      i + 1,
      ids.length,
    );
  }

  const result = { userId, user, companies, prices, employer, companiesTruncated: truncated };
  _playerCache.set(userId, { data: result, ts: Date.now() });
  return result;
}

// ─── Username autocomplete search ─────────────────────────────────────────────

export async function searchUsernames(query) {
  if (!query.trim()) return [];

  const result  = await trpc('search.searchAnything', { searchText: query });
  const userIds = result?.userIds || [];
  if (!userIds.length) return [];

  return (await Promise.all(
    userIds.slice(0, 3).map(async uid => {
      try {
        const u = await trpc('user.getUserLite', { userId: uid });
        return u ? { id: u._id, username: u.username, level: u.leveling?.level || 0 } : null;
      } catch { return null; }
    }),
  )).filter(Boolean);
}

// ─── Gear price fetcher ───────────────────────────────────────────────────────
// Fetches live average market price for each item code from gameStat.getEquipmentAvgByCode.
// Results are cached per-session with a 5-minute TTL.

const _priceCache      = new Map();
const _PRICE_CACHE_TTL = 5 * 60 * 1000;

export async function fetchGearPrices(codes) {
  const now    = Date.now();
  const result = {};
  const toFetch = [];

  for (const code of codes) {
    const cached = _priceCache.get(code);
    if (cached && now - cached.ts < _PRICE_CACHE_TTL) result[code] = cached.price;
    else toFetch.push(code);
  }

  for (const code of toFetch) {
    try {
      const avg   = await trpc('gameStat.getEquipmentAvgByCode', { itemCode: code });
      const price = typeof avg === 'number' && avg > 0 ? avg : 0;
      _priceCache.set(code, { price, ts: now });
      result[code] = price;
    } catch {
      _priceCache.set(code, { price: 0, ts: now });
      result[code] = 0;
    }
  }

  return result;
}
