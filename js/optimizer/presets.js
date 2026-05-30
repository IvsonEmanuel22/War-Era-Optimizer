import {
  SKILL_NAMES, DOMINANT_DEFAULT, MAX_SKILL_LEVEL,
  DEFAULT_MARKET_PRICES, DEFAULT_PRESET_MAX_SKILLS, PRESET_DEFS,
} from './constants.js';
import { runOptimizer } from './BuildOptimizer.js';

export { PRESET_DEFS };

// Merges preset defaults with user overrides into the full params object for runOptimizer.
//
// presetName — 'sustainable' | 'warEco' | 'loot'
// userData   — user-supplied overrides (all optional)
export function buildPresetParams(presetName, userData = {}) {
  const preset = PRESET_DEFS[presetName];
  if (!preset) throw new Error('Unknown preset: ' + presetName);

  const companyCount = userData.companyCount ?? 0;
  const companiesCap = preset.companiesMaxAdjust(companyCount);

  const minSkills = { ...(userData.minSkillsOverride ?? preset.minSkills) };
  if ((minSkills.companies ?? 0) > companiesCap) minSkills.companies = companiesCap;

  const maxSkills = {
    ...DEFAULT_PRESET_MAX_SKILLS,
    ...(userData.maxSkillsOverride ?? preset.maxSkills),
    companies: companiesCap,
  };

  const spentLimit = userData.spentLimitOverride !== undefined
    ? userData.spentLimitOverride
    : preset.spentLimit({
        entrep: userData.entrep ?? 0,
        energy: userData.energy ?? 0,
        aeNet:  userData.aeNet  ?? 0,
      });

  return {
    preset:              presetName,
    spentLimit,
    ...(userData.fixedSkills ? { fixedSkills: userData.fixedSkills } : {}),
    minDmgPerExtraDollar: 1000,
    lvl:                 userData.lvl          ?? 1,
    rankBonus:           userData.rankBonus     ?? 1.2,
    countryBonus:        userData.countryBonus  ?? 1.9,
    battleBonus:         userData.battleBonus,
    ammoType:            userData.ammoType      ?? 'light',
    bounty:              userData.bountyOverride ?? 0,
    foodType:            userData.foodTypeOverride ?? preset.foodType,
    usePill:             userData.usePillOverride  ?? preset.usePill,
    hours:               userData.hoursOverride,
    dmgMultiplier:       userData.dmgMultiplierOverride,
    excludeDailyIncome:  userData.excludeDailyIncomeOverride,
    excludeItemLoot:     userData.excludeItemLootOverride,
    objective:           userData.objectiveOverride ?? 'maxDmg',
    companyProfit:       userData.avgAePerCompany ?? 0,
    salary:              userData.employer?.netWage  ?? 0,
    // ppSelfWorkPrice agora carrega a margem real por PP da melhor empresa do jogador
    // (1 + co.bonus/100) * (sellPrice - matCost) / co.recipe.pp — não a netWage do empregador.
    // Bônus de produção já está embutido na margem, então ppSelfWorkBonus = 1.
    ppSelfWorkBonus:     1,
    ppSelfWorkPrice:     userData.bestEntrepProfitPerPP ?? 0,
    workersProfit:       userData.workersProfit ?? 0,
    minSkills,
    maxSkills,
    gearTiers:           userData.gearTiersOverride   ?? preset.gearTiers,
    forcedNoneSlots:     userData.forcedNoneSlotsOverride ?? preset.forcedNoneSlots ?? null,
    dominantSkill:       preset.dominantSkill,
    noStructuralCaps:    userData.noStructuralCapsOverride ?? preset.noStructuralCaps ?? false,
    reservedSP:          userData.reservedSPOverride ?? 0,
    marketPrices:        userData.marketPrices ?? DEFAULT_MARKET_PRICES,
    rollMultiplier:      userData.rollMultiplier ?? 1,
    gearOverrides:       userData.gearOverrides ?? null,
  };
}

export const optimize             = (presetName, userData, cb) => runOptimizer(buildPresetParams(presetName, userData), cb);
export const optimizeSustainable  = (userData, cb)             => optimize('sustainable', userData, cb);
export const optimizeWarEco       = (userData, cb)             => optimize('warEco',      userData, cb);
