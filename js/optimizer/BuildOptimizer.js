import { SKILL_NAMES, COMBAT_SKILLS, ECO_SKILLS, DOMINANT_DEFAULT, MAX_SKILL_LEVEL, DEFAULT_PRESET_MAX_SKILLS } from './constants.js';
import { buildGearAndSets, buildFood } from './items.js';
import { writeAttributes, evalBuild, getWeeklyCases } from './DamageFormula.js';
import { getCombinations } from './SkillPoints.js';

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

// Main optimizer. Finds the best (gear, skill allocation) combination.
//
// params — output of buildPresetParams
// progressCallback(gearIdx, total, bestDmgSoFar) — optional progress hook
//
// Returns { bestBuild, elapsed, gearSetsCount, gearSetsPruned, skillCombosCount, combosEvaluated,
//           effectiveMin, effectiveMax, dominantSkill }
export function runOptimizer(params, progressCallback) {
  const mp          = params.marketPrices;
  const food        = buildFood(mp)[params.foodType] ?? buildFood(mp).fish;
  const gearSets    = buildGearAndSets(mp.scrapPrice, params.gearTiers, params.rollMultiplier ?? 1,
                                       params.gearOverrides ?? null, params.forcedNoneSlots ?? null);
  const minSkills   = params.minSkills ?? {};
  const maxSkillsCap = { ...DEFAULT_PRESET_MAX_SKILLS, ...(params.maxSkills ?? {}) };

  const dominant    = SKILL_NAMES.includes(params.dominantSkill) ? params.dominantSkill : DOMINANT_DEFAULT;
  const skillCombos = params.fixedSkills
    ? [params.fixedSkills]
    : getCombinations(params.lvl, minSkills, maxSkillsCap, dominant,
                      params.noStructuralCaps, params.reservedSP);

  const t0 = Date.now();

  if (!gearSets.length || !skillCombos.length) {
    return {
      bestBuild: null, elapsed: Date.now() - t0,
      gearSetsCount: gearSets.length, gearSetsPruned: 0,
      skillCombosCount: skillCombos.length, combosEvaluated: 0,
      effectiveMin: minSkills, effectiveMax: maxSkillsCap, dominantSkill: dominant,
    };
  }

  // ─── Effective max skill map (for pruning upper-bounds) ─────────────────────
  const effMax = {};
  for (const s of SKILL_NAMES) effMax[s] = maxSkillsCap[s] ?? MAX_SKILL_LEVEL;
  const domMax = effMax[dominant];
  for (const s of COMBAT_SKILLS) if (s !== dominant) effMax[s] = Math.min(effMax[s], domMax);
  const prodMax = effMax.production;
  for (const s of ECO_SKILLS) effMax[s] = Math.min(effMax[s], prodMax);

  // ─── Gear pruning (spentLimit check with min and max skills) ────────────────
  const svTmp = {};
  const minSkillsFull = { ...effMax };
  for (const s of SKILL_NAMES) minSkillsFull[s] = minSkills[s] ?? 0;
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
      skillCombosCount: skillCombos.length, combosEvaluated: 0,
      effectiveMin: minSkills, effectiveMax: maxSkillsCap, dominantSkill: dominant,
    };
  }

  // Sort gear by upper-bound DMG descending.
  writeAttributes(maxSkillsFull, feasibleGear[0], svTmp);
  const gearWithUB = feasibleGear.map(gear => {
    writeAttributes(maxSkillsFull, gear, svTmp);
    return { gear, ubDmg: evalBuild(svTmp, gear, params, food).dmg };
  }).sort((a, b) => b.ubDmg - a.ubDmg);

  // ─── Extract hot-loop scalars ────────────────────────────────────────────────
  const ammoMults      = { light: 1.1, ammo: 1.2, heavy: 1.4 };
  const pillMult       = params.usePill ? 1.6 : 1;
  const hours          = params.hours ?? (params.usePill ? 8 : 14);
  const spentLimit     = params.spentLimit;
  const minDmgPerDollar= params.minDmgPerExtraDollar;
  const objective      = params.objective ?? 'maxDmg';
  const excludeDaily   = !!params.excludeDailyIncome;
  const excludeLoot    = !!params.excludeItemLoot;
  const rankBonus      = params.rankBonus;
  const countryBonus   = params.countryBonus;
  const battleBonus    = params.battleBonus ?? rankBonus * countryBonus;
  const bounty         = params.bounty;
  const dmgMult        = params.dmgMultiplier ?? 1;
  const ammoMult       = ammoMults[params.ammoType] ?? 1.1;
  const ammoKey        = { light: 'lightAmmoPrice', ammo: 'ammoPrice', heavy: 'heavyAmmoPrice' }[params.ammoType] ?? 'lightAmmoPrice';
  const ammoPrice      = mp[ammoKey] ?? mp.bulletPrice;
  const casePrice      = mp.casePrice;
  const redCasePrice   = mp.redCasePrice;
  const pillCost       = params.usePill ? mp.pillPrice : 0;
  const foodInc        = food.inc;
  const foodPrice      = food.price;
  const salaryDay      = excludeDaily ? 0 : params.salary * 2.4;
  const selfWorkDay    = excludeDaily ? 0 : params.ppSelfWorkBonus * params.ppSelfWorkPrice * 2.4;
  const coProfit       = excludeDaily ? 0 : params.companyProfit;
  const workersProfit  = excludeDaily ? 0 : params.workersProfit;
  const dailyFixed     = excludeDaily ? 0 : 2 * casePrice + 14;

  // Sort skill combos (dedup by combat-skill hash for maxDmg/sustainable, keep order for loot)
  const isEcoPreset = params.preset === 'sustainable' || params.preset === 'warEco';
  const comboKeys   = skillCombos.map((sk, i) => isEcoPreset ? i : (
    (((((sk.attack * 11 + sk.precision) * 11 + sk.cChance) * 11 + sk.cDmg) * 11 +
      sk.armor) * 11 + sk.dodge) * 11 + sk.health) * 11 + sk.hunger
  ));
  const sortedIdx = Uint32Array.from({ length: skillCombos.length }, (_, i) => i);
  sortedIdx.sort((a, b) => comboKeys[a] - comboKeys[b]);
  const sortedCombos = Array.from(sortedIdx, i => skillCombos[i]);
  const sortedKeys   = Int32Array.from(sortedIdx, i => comboKeys[i]);

  // Group consecutive combos with same key into "groups".
  const groupStarts = [];
  let lastKey = -1;
  for (let i = 0; i < sortedKeys.length; i++) {
    if (sortedKeys[i] !== lastKey) { groupStarts.push(i); lastKey = sortedKeys[i]; }
  }
  groupStarts.push(sortedCombos.length);
  const numGroups = groupStarts.length - 1;

  const groupDmgUB = new Float64Array(numGroups);
  const svInner    = {};

  let best     = null;
  let gearSeen = 0;
  let evaluated = 0;

  for (let gi = 0; gi < gearWithUB.length; gi++) {
    if (objective === 'maxDmg' && best && gearWithUB[gi].ubDmg < best.dmg) break;

    const gear = gearWithUB[gi].gear;
    gearSeen++;
    if (progressCallback && (gi % 20 === 0 || gi === gearWithUB.length - 1))
      progressCallback(gearSeen, gearWithUB.length, best ? best.dmg : 0);

    // Precompute per-gear constants for inner loop.
    const noGun    = gear.gun.type === 'basic' || gear.gun.type === 'none';
    const aMult    = noGun ? 1 : ammoMult;
    const gunAtk   = gear.gun.attack;
    const gunCC    = gear.gun.cChance;
    const helmCD   = gear.helmet.cDmg;
    const chstArm  = gear.chest.armor;
    const pantArm  = gear.pant.armor;
    const glvPrec  = gear.glove.precision;
    const bootDodge= gear.boot.dodge;
    const gunPrice = gear.gun.price;
    const armorPriceTotal =
      gear.chest.price + gear.pant.price + gear.helmet.price +
      gear.glove.price + gear.boot.price;

    // Compute group upper-bound DMGs with this gear.
    for (let g = 0; g < numGroups; g++) {
      const sk = sortedCombos[groupStarts[g]];
      writeAttributes(sk, gear, svInner);
      groupDmgUB[g] = evalBuild(svInner, gear, params, food).dmg;
    }
    const groupOrder = Int32Array.from({ length: numGroups }, (_, i) => i);
    groupOrder.sort((a, b) => groupDmgUB[b] - groupDmgUB[a]);

    for (let go = 0; go < numGroups; go++) {
      const g = groupOrder[go];
      if (objective === 'maxDmg' && best && groupDmgUB[g] < best.dmg) break;

      for (let ci = groupStarts[g]; ci < groupStarts[g + 1]; ci++) {
        const sk = sortedCombos[ci];

        // ── Inline stat computation for hot path ──────────────────────────────
        const armorRaw = sk.armor * 6 + chstArm + pantArm;
        const dodgeRaw = sk.dodge * 4 + bootDodge;
        const atkStat  = 100 + sk.attack * 25 + gunAtk;
        const precStat = 50  + sk.precision * 5 + glvPrec;
        const ccStat   = 10  + sk.cChance  * 5 + gunCC;
        const cdStat   = 100 + sk.cDmg     * 20 + helmCD;
        const armorPct = (armorRaw / (armorRaw + 40)) * 100;
        const dodgePct = (dodgeRaw / (dodgeRaw + 40)) * 100;
        const healthSt = 100 + sk.health * 10;
        const hungerSt = 4   + sk.hunger;

        const regenHP  = healthSt + (healthSt / 10) * hours;
        const foodAct  = Math.floor(hungerSt + (hungerSt / 10) * hours);
        const hpFood   = (foodInc / 100) * healthSt;
        const totalHP  = regenHP + foodAct * hpFood;
        const rounds   = totalHP / (((100 - dodgePct) / 100) * ((100 - armorPct) / 10));

        const precCap = precStat < 100 ? precStat : 100;
        const overPr  = precStat > 100 ? precStat - 100 : 0;
        const effAtk  = ((atkStat - gunAtk) * pillMult + gunAtk) * rankBonus * aMult + overPr * 4;
        const ccCap   = ccStat < 100 ? ccStat : 100;
        const overCC  = ccStat > 100 ? ccStat - 100 : 0;
        const totCDmg = cdStat + overCC * 4;

        const miss    = (rounds * (100 - precCap)) / 100;
        const hit     = rounds - miss;
        const crit    = (hit * ccCap) / 100;
        const normal  = hit - crit;
        const rawDmg  = miss * (effAtk / 2) + normal * effAtk + crit * ((100 + totCDmg) / 100) * effAtk;
        const dmg     = rawDmg * battleBonus * dmgMult;

        if (objective === 'maxDmg' && best && dmg < best.dmg) continue;

        const foodCost   = foodAct * foodPrice;
        const ammoCost   = noGun ? 0 : rounds * ammoPrice;
        const gunCost    = (gunPrice / 100) * rounds;
        const armorCost  = (armorPriceTotal / 100) * rounds * ((100 - dodgePct) / 100);
        const totalCost  = foodCost + ammoCost + gunCost + armorCost + pillCost;

        const lootSt     = 5  + sk.loot * 2;
        const prodSt     = 10 + sk.production * 3;
        const chests     = hit * (lootSt / 100);

        const weeklyInc  = excludeDaily ? 0 : (getWeeklyCases(dmg) * casePrice) / 7;
        const totalInc   =
          prodSt * ((3 + sk.energy) * salaryDay + (3 + sk.enter * 0.5) * selfWorkDay) +
          chests * (casePrice + redCasePrice / 100) +
          (2 + sk.companies) * coProfit +
          workersProfit + dailyFixed +
          (excludeLoot ? 0 : (dmg / 1000) * 0.15) +
          (dmg / 1000) * bounty + weeklyInc;

        const spent = totalCost - totalInc;
        evaluated++;

        if (spent > spentLimit) continue;

        let isBetter = false;
        if (!best) {
          isBetter = true;
        } else if (objective === 'minSpent') {
          isBetter = spent < best.spent;
        } else {
          const dSpent = spent - best.spent;
          const dDmg   = dmg   - best.dmg;
          isBetter =
            (dSpent <= 0 && dDmg > 0) ||
            (dSpent < 0  && dDmg === 0) ||
            (dSpent > 0  && dDmg > 0 && dDmg / dSpent >= minDmgPerDollar);
        }

        if (isBetter) best = { gear, skills: sk, spent, dmg };
      }
    }
  }

  let bestBuild = null;
  if (best) {
    bestBuild = simulateBuild(best.gear, best.skills, params);
    bestBuild.appliedSkillMin     = minSkills;
    bestBuild.appliedSkillMax     = maxSkillsCap;
    bestBuild.appliedDominantSkill = dominant;
  }

  return {
    bestBuild,
    elapsed:          Date.now() - t0,
    gearSetsCount:    gearSets.length,
    gearSetsPruned:   gearSets.length - feasibleGear.length,
    skillCombosCount: skillCombos.length,
    combosEvaluated:  evaluated,
    effectiveMin:     minSkills,
    effectiveMax:     maxSkillsCap,
    dominantSkill:    dominant,
  };
}
