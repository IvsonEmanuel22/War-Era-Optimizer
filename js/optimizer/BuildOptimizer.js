import { SKILL_NAMES, COMBAT_SKILLS, DOMINANT_DEFAULT, MAX_SKILL_LEVEL, DEFAULT_PRESET_MAX_SKILLS } from './constants.js';
import { buildGearAndSets, buildFood } from './items.js';
import { writeAttributes, evalBuild, getWeeklyCases } from './DamageFormula.js';
import { optimizeSP } from './SPOptimizer.js';

export { getWeeklyCases };

// Simulates a single build fully (gear + skills + params).
// Returns the full evalBuild result augmented with gear, skills, and skillValues.
export function simulateBuild(gear, skills, params) {
  const food       = buildFood(params.marketPrices)[params.foodType] ?? buildFood(params.marketPrices).fish;
  const skillVals  = {};
  writeAttributes(skills, gear, skillVals);
  const result     = evalBuild(skillVals, gear, params, food);
  result.gear        = gear;
  result.skills      = skills;
  result.skillValues = skillVals;
  return result;
}

// Monte Carlo variance analysis.
// Perturbs gear stats randomly by ±spread (0–1 fraction, default 0.15) over `samples` trials.
// Returns { spread, samples, dmg, spent, profit } where each stat has { mean, std, p10, p50, p90, min, max }.
export function varianceAnalysis(build, params, spread = 0.15, samples = 1000) {
  if (!build) return null;

  const food       = buildFood(params.marketPrices)[params.foodType] ?? buildFood(params.marketPrices).fish;
  const gear       = build.gear;
  const skills     = build.skills;
  const statKeys   = { gun: ['attack','cChance'], helmet: ['cDmg'], chest: ['armor'], pant: ['armor'], glove: ['precision'], boot: ['dodge'] };
  const mutableGear = {};
  for (const slot of Object.keys(gear)) mutableGear[slot] = { ...gear[slot] };

  const dmgs    = new Array(samples);
  const spents  = new Array(samples);
  const profits = new Array(samples);
  const sv      = {};

  for (let i = 0; i < samples; i++) {
    for (const slot of Object.keys(statKeys)) {
      const src = gear[slot];
      const dst = mutableGear[slot];
      for (const stat of statKeys[slot]) {
        dst[stat] = src[stat] * (1 + (Math.random() * 2 - 1) * spread);
      }
    }
    writeAttributes(skills, mutableGear, sv);
    const r    = evalBuild(sv, mutableGear, params, food);
    dmgs[i]    = r.dmg;
    spents[i]  = r.spent;
    profits[i] = r.profit;
  }

  function stats(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const n      = sorted.length;
    const mean   = arr.reduce((s, x) => s + x, 0) / n;
    const std    = Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / n);
    const pct    = p => sorted[Math.min(n - 1, Math.floor(p * n))];
    return { mean, std, p10: pct(0.1), p50: pct(0.5), p90: pct(0.9), min: sorted[0], max: sorted[n - 1] };
  }

  return { spread, samples, dmg: stats(dmgs), spent: stats(spents), profit: stats(profits) };
}

const SWEEP_FOOD_TYPES = ['none', 'bread', 'meat', 'fish'];
const SWEEP_AMMO_TYPES = ['light', 'ammo', 'heavy'];

// Runs the optimizer for a single fixed food + ammo combination.
function _runFixed(params, progressCallback) {
  const mp          = params.marketPrices;
  const food        = buildFood(mp)[params.foodType] ?? buildFood(mp).fish;
  const gearSets    = buildGearAndSets(mp.scrapPrice, params.gearTiers, params.rollMultiplier ?? 1,
                                       params.gearOverrides ?? null, params.forcedNoneSlots ?? null);
  const minSkills   = params.minSkills ?? {};
  const maxSkillsCap = { ...DEFAULT_PRESET_MAX_SKILLS, ...(params.maxSkills ?? {}) };
  // When food provides no healing, hunger skill is pure SP waste — cap and floor both go to 0.
  const effectiveMinSkills = food.inc === 0 ? { ...minSkills, hunger: 0 } : minSkills;
  if (food.inc === 0) maxSkillsCap.hunger = 0;

  const dominant = SKILL_NAMES.includes(params.dominantSkill) ? params.dominantSkill : DOMINANT_DEFAULT;

  const t0 = Date.now();

  if (!gearSets.length) {
    return {
      bestBuild: null, elapsed: Date.now() - t0,
      gearSetsCount: 0, gearSetsPruned: 0,
      gearSetsEvaluated: 0,
      effectiveMin: minSkills, effectiveMax: maxSkillsCap, dominantSkill: dominant,
    };
  }

  // ─── Effective max skill map (for UB gear sort) ──────────────────────────────
  const effMax = {};
  for (const s of SKILL_NAMES) effMax[s] = maxSkillsCap[s] ?? MAX_SKILL_LEVEL;
  const domMax = effMax[dominant];
  for (const s of COMBAT_SKILLS) if (s !== dominant) effMax[s] = Math.min(effMax[s], domMax);

  // ─── Gear feasibility prune ──────────────────────────────────────────────────
  const svTmp        = {};
  const minSkillsFull = {};
  for (const s of SKILL_NAMES) minSkillsFull[s] = effectiveMinSkills[s] ?? 0;
  const maxSkillsFull = effMax;

  const feasibleGear = [];
  for (const gear of gearSets) {
    writeAttributes(minSkillsFull, gear, svTmp);
    const spentAtMin = evalBuild(svTmp, gear, params, food).spent;
    writeAttributes(maxSkillsFull, gear, svTmp);
    const spentAtMax = evalBuild(svTmp, gear, params, food).spent;
    if (Math.min(spentAtMin, spentAtMax) <= params.spentLimit) feasibleGear.push(gear);
  }

  if (!feasibleGear.length) {
    return {
      bestBuild: null, elapsed: Date.now() - t0,
      gearSetsCount: gearSets.length, gearSetsPruned: gearSets.length,
      gearSetsEvaluated: 0,
      effectiveMin: minSkills, effectiveMax: maxSkillsCap, dominantSkill: dominant,
    };
  }

  // Sort gear by upper-bound DMG descending (using maxSkillsFull).
  const gearWithUB = feasibleGear.map(gear => {
    writeAttributes(maxSkillsFull, gear, svTmp);
    return { gear, ubDmg: evalBuild(svTmp, gear, params, food).dmg };
  }).sort((a, b) => b.ubDmg - a.ubDmg);

  const objective       = params.objective ?? 'maxDmg';
  const spentLimit      = params.spentLimit;
  const minDmgPerDollar = params.minDmgPerExtraDollar;

  const effectiveParams = { ...params, minSkills: effectiveMinSkills, maxSkills: maxSkillsCap };

  let best      = null;
  let gearSeen  = 0;
  let evaluated = 0;

  for (let gi = 0; gi < gearWithUB.length; gi++) {
    if (objective === 'maxDmg' && best && gearWithUB[gi].ubDmg < best.dmg) break;

    const gear = gearWithUB[gi].gear;
    gearSeen++;
    if (progressCallback && (gi % 20 === 0 || gi === gearWithUB.length - 1))
      progressCallback(gearSeen, gearWithUB.length, best ? best.dmg : 0);

    const sk = optimizeSP(effectiveParams, gear, food);
    writeAttributes(sk, gear, svTmp);
    const r = evalBuild(svTmp, gear, params, food);
    evaluated++;

    if (r.spent > spentLimit) continue;

    let isBetter = false;
    if (!best) {
      isBetter = true;
    } else if (objective === 'minSpent') {
      isBetter = r.spent < best.spent;
    } else {
      const dSpent = r.spent - best.spent;
      const dDmg   = r.dmg   - best.dmg;
      isBetter =
        (dSpent <= 0 && dDmg > 0) ||
        (dSpent < 0  && dDmg === 0) ||
        (dSpent > 0  && dDmg > 0 && dDmg / dSpent >= minDmgPerDollar);
    }

    if (isBetter) best = { gear, skills: sk, spent: r.spent, dmg: r.dmg };
  }

  let bestBuild = null;
  if (best) {
    bestBuild = simulateBuild(best.gear, best.skills, params);
    bestBuild.appliedSkillMin      = minSkills;
    bestBuild.appliedSkillMax      = maxSkillsCap;
    bestBuild.appliedDominantSkill = dominant;
    bestBuild.foodType             = params.foodType;
    bestBuild.ammoType             = params.ammoType;
  }

  return {
    bestBuild,
    elapsed:           Date.now() - t0,
    gearSetsCount:     gearSets.length,
    gearSetsPruned:    gearSets.length - feasibleGear.length,
    gearSetsEvaluated: evaluated,
    effectiveMin:      minSkills,
    effectiveMax:      maxSkillsCap,
    dominantSkill:     dominant,
  };
}

// Main optimizer entry point. When foodType or ammoType is 'auto', sweeps all
// combinations and returns the best result.
//
// progressCallback(gearIdx, total, bestDmgSoFar, comboInfo?) — optional progress hook
// comboInfo: { combo, totalCombos, label } — present only during a sweep
export function runOptimizer(params, progressCallback) {
  const foods = params.foodType === 'auto' ? SWEEP_FOOD_TYPES : [params.foodType ?? 'fish'];
  const ammos = params.ammoType === 'auto' ? SWEEP_AMMO_TYPES : [params.ammoType ?? 'light'];

  if (foods.length === 1 && ammos.length === 1) {
    return _runFixed({ ...params, foodType: foods[0], ammoType: ammos[0] }, progressCallback);
  }

  const combos    = foods.flatMap(f => ammos.map(a => ({ foodType: f, ammoType: a })));
  const objective = params.objective ?? 'maxDmg';
  let best        = null;

  for (let i = 0; i < combos.length; i++) {
    const { foodType, ammoType } = combos[i];
    const comboInfo = { combo: i + 1, totalCombos: combos.length, label: foodType + ' · ' + ammoType };
    const result = _runFixed(
      { ...params, foodType, ammoType },
      progressCallback ? (g, total, dmg) => progressCallback(g, total, dmg, comboInfo) : null,
    );

    if (!best || !best.bestBuild) {
      best = result;
    } else if (result.bestBuild) {
      const better = objective === 'minSpent'
        ? result.bestBuild.spent < best.bestBuild.spent
        : result.bestBuild.dmg  > best.bestBuild.dmg;
      if (better) best = result;
    }
  }

  return best;
}
