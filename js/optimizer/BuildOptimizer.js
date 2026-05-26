import { GEAR, AMMO, FOOD, flatItem, itemsUpTo } from './items.js';
import { resolveStats, computeBuild } from './DamageFormula.js';

const SLOTS = ['gun', 'helmet', 'chest', 'pant', 'glove', 'boot'];
const TOP_K = 6;

// Gera todas as combinações de gear onde cada slot é no máximo `maxTier`.
// marketPrices: { gun: { common: $, uncommon: $, ... }, helmet: { ... }, ... }
// lockedOut: Set de nomes de slot bloqueados em 'none'
// rollTarget: 0 = min roll (pior/mais barato), 1 = max roll (melhor)
function* gearCombinations(maxTier, marketPrices = {}, lockedOut = new Set(), rollTarget = 0.5) {
  const options = {};
  for (const slot of SLOTS) {
    const pool = lockedOut.has(slot)
      ? [flatItem(GEAR[slot][0], 0, rollTarget)]  // force 'none'
      : itemsUpTo(slot, maxTier).map(item => {
          const prices = marketPrices[slot] ?? {};
          const buyPrice = prices[item.type] ?? 0;
          return flatItem(item, buyPrice, rollTarget);
        });
    options[slot] = pool;
  }

  for (const gun    of options.gun)
  for (const helmet of options.helmet)
  for (const chest  of options.chest)
  for (const pant   of options.pant)
  for (const glove  of options.glove)
  for (const boot   of options.boot)
    yield { gun, helmet, chest, pant, glove, boot };
}

// Executa a busca exaustiva de builds.
//
// skills      — níveis de skill do jogador { attack, precision, cChance, cDmg, armor, dodge, health, hunger }
// opts:
//   maxTier      — tier máximo de gear a considerar (default: 'mythic')
//   lockedOut    — Set<slotName> forçados em 'none'
//   rollTarget   — 0 (min roll / mais barato) … 1 (max roll / melhor); default 0.5
//   marketPrices — { slot: { tier: price } } — preços da API
//   ammoKeys     — tipos de ammo a testar (default: todos)
//   foodKeys     — tipos de food a testar (default: todos)
//   usePills     — [false, true] por padrão
//   rankBonus    — multiplicador de rank (default: 1)
//   maxDailyCost — limite de custo diário em combate; null = sem limite
//   onProgress   — callback (done, total) para barra de progresso
//
// Retorna array de até TOP_K resultados, ordenados por dmg decrescente.
export function runOptimizer(skills, opts = {}) {
  const {
    maxTier      = 'mythic',
    lockedOut    = new Set(),
    rollTarget   = 0.5,
    marketPrices = {},
    ammoKeys     = Object.keys(AMMO),
    foodKeys     = Object.keys(FOOD),
    usePills     = [false, true],
    rankBonus    = 1,
    maxDailyCost = null,
    onProgress   = null,
  } = opts;

  const top  = [];
  let   done = 0;

  const gearList = [...gearCombinations(maxTier, marketPrices, lockedOut, rollTarget)];
  const total    = gearList.length * ammoKeys.length * foodKeys.length * usePills.length;

  for (const gear of gearList) {
    const stats = resolveStats(skills, gear);

    for (const ammoKey of ammoKeys)
    for (const foodKey of foodKeys)
    for (const usePill of usePills) {
      const result = computeBuild(stats, gear, ammoKey, foodKey, { rankBonus, usePill });

      if (maxDailyCost === null || result.cost <= maxDailyCost) {
        insertTopK(top, { gear, ammoKey, foodKey, usePill, stats, ...result }, TOP_K);
      }

      if (onProgress && ++done % 5000 === 0) onProgress(done, total);
    }
  }

  if (onProgress) onProgress(total, total);
  return top;
}

function insertTopK(list, entry, k) {
  if (list.length < k) {
    list.push(entry);
    list.sort((a, b) => b.dmg - a.dmg);
  } else if (entry.dmg > list[list.length - 1].dmg) {
    list[list.length - 1] = entry;
    list.sort((a, b) => b.dmg - a.dmg);
  }
}
