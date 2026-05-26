import { API_HOSTS, PROXY, MM_TIER_TO_CODE, ALLOWED_COUNTRY_CODES } from './config.js';
import { setStatus } from './utils.js';

// ─── Concurrency limiter ──────────────────────────────────────────────────────
// Limits how many async tasks run in parallel, preventing API rate-limit hits.

function pLimit(concurrency) {
  let active = 0;
  const queue = [];
  const next = () => {
    while (active < concurrency && queue.length) {
      active++;
      const { fn, resolve, reject } = queue.shift();
      fn().then(resolve, reject).finally(() => { active--; next(); });
    }
  };
  return fn => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
}

// ─── tRPC core ────────────────────────────────────────────────────────────────

let _apiHostIdx = 0;

export async function trpc(path, input, retries = 2) {
  const query = '?input=' + encodeURIComponent(JSON.stringify(input ?? {}));
  let lastErr;

  for (let i = 0; i < API_HOSTS.length; i++) {
    const hostIdx = (_apiHostIdx + i) % API_HOSTS.length;
    const url = API_HOSTS[hostIdx] + '/trpc/' + path + query;
    let networkFailed = false;

    for (let attempt = 0; attempt <= retries; attempt++) {
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

      if (res.status === 429 && attempt < retries) {
        const retryAfter = parseFloat(res.headers.get('retry-after') || '0');
        const delay = retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1);
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

export async function fetchDirect(username) {
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

  if (users.length === 1)  return fetchByUserId(users[0].id);
  if (exactMatch)          return fetchByUserId(exactMatch.id);
  return { needsPick: true, query: username, candidates: users };
}

export async function fetchByUserId(userId) {
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

  // Fetch employer data if the player works somewhere
  let employer = null;
  if (user?.company) {
    const [company, workersData, bonus] = await Promise.all([
      trpc('company.getById',           { companyId: user.company }).catch(() => null),
      trpcAuth('worker.getWorkers',     { companyId: user.company }).catch(() => null),
      trpc('company.getProductionBonus', { companyId: user.company }).catch(() => null),
    ]);

    const selfWorker = workersData?.workers?.find(w => w.user === userId);

    if (selfWorker) {
      const region = company?.region
        ? await trpc('region.getById', { regionId: company.region }).catch(() => null)
        : null;
      const regionCountry = countries?.find(c => c._id === region?.country) ?? null;
      const incomeTax = regionCountry?.taxes?.income ?? 0;

      employer = {
        companyId:       user.company,
        companyName:     company?.name  || '(unknown)',
        countryName:     regionCountry?.name || '(unknown)',
        countryCode:     regionCountry?.code || '',
        grossWage:       selfWorker.wage     || 0,
        fidelity:        selfWorker.fidelity || 0,
        incomeTaxPct:    incomeTax,
        netWage:         (selfWorker.wage || 0) * (1 - incomeTax / 100),
        productionBonus: bonus?.total || 0,
      };
    }
  }

  const ids      = companyIds || [];
  const truncated = !!companyIds?.truncated;

  if (!ids.length)
    return { userId, user, companies: [], prices, employer, companiesTruncated: truncated };

  setStatus('Buscando detalhes de ' + ids.length + ' empresas...');

  // 3 empresas em paralelo — cada uma dispara 3 requests internos.
  // Mantém bem abaixo do rate limit de 100 req/min sem API key.
  const limit = pLimit(3);

  const companies = await Promise.all(
    ids.map(coId => limit(async () => {
      const [detail, bonus, workersData] = await Promise.all([
        trpc('company.getById',            { companyId: coId }).catch(() => null),
        trpc('company.getProductionBonus', { companyId: coId }).catch(() => null),
        trpcAuth('worker.getWorkers',      { companyId: coId }).catch(() => null),
      ]);

      const enrichedWorkers = await Promise.all(
        (workersData?.workers || []).map(async w => {
          const userLite = await trpc('user.getUserLite', { userId: w.user }).catch(() => null);
          return {
            ...w,
            username:   userLite?.username                  || w.user.slice(-6),
            level:      userLite?.leveling?.level           || 0,
            energy:     userLite?.skills?.energy?.total     || 0,
            production: userLite?.skills?.production?.total || 0,
          };
        }),
      );

      return {
        id:         coId,
        detail,
        bonus,
        workers:    enrichedWorkers,
        disabledAt: detail?.disabledAt || null,
        aeActive:   !detail?.disabledAt,
      };
    })),
  );

  return { userId, user, companies, prices, employer, companiesTruncated: truncated };
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

// ─── Gear market snapshot ─────────────────────────────────────────────────────

let _gearSnapshot        = null;
let _gearSnapshotPromise = null;
let _gearSnapshotError   = null;
let _onSnapshotChange    = null;

export function setGearSnapshotListener(fn) {
  _onSnapshotChange = fn;
}

export function getGearSnapshotState() {
  return { snapshot: _gearSnapshot, error: _gearSnapshotError };
}

export function loadGearSnapshot() {
  if (_gearSnapshot)        return Promise.resolve(_gearSnapshot);
  if (_gearSnapshotPromise) return _gearSnapshotPromise;

  const allCodes = Object.values(MM_TIER_TO_CODE).flatMap(tiers => Object.values(tiers));

  _gearSnapshotPromise = Promise.all(
    allCodes.map(code =>
      trpc('gameStat.getEquipmentAvgByCode', { itemCode: code })
        .then(avg => [code, typeof avg === 'number' ? avg : 0])
        .catch(()  => [code, 0])
    ),
  ).then(entries => {
    const items = {};
    for (const [code, price] of entries)
      items[code] = { price, buyPrice: price, priceByRoll: [] };
    const snap = {
      items,
      transactionsScanned: allCodes.length,
      generatedAt: new Date().toISOString(),
    };
    _gearSnapshot = snap;
    window._GEAR_SNAPSHOT = snap;
    _onSnapshotChange?.();
    return snap;
  }).catch(err => {
    _gearSnapshotError = err;
    _onSnapshotChange?.();
    throw err;
  });

  return _gearSnapshotPromise;
}
