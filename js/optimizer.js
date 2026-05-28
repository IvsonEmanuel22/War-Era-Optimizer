import {
  SKILL_NAMES, GEAR_TIER_ORDER, DOMINANT_DEFAULT, MAX_SKILL_LEVEL,
  DEFAULT_MARKET_PRICES, DEFAULT_PRESET_MAX_SKILLS, GEAR_STAT_KEYS,
} from './optimizer/constants.js';
import { buildScrapReturn, buildFood, buildGearAndSets } from './optimizer/items.js';
import { writeAttributes, countAttributes, evalBuild } from './optimizer/DamageFormula.js';
import { getCombinations } from './optimizer/SkillPoints.js';
import { runOptimizer, simulateBuild, varianceAnalysis, getWeeklyCases } from './optimizer/BuildOptimizer.js';
import { PRESET_DEFS, buildPresetParams, optimize, optimizeSustainable, optimizeWarEco } from './optimizer/presets.js';

export const OPT = {
  SKILL_NAMES,
  GEAR_TIER_ORDER,
  DOMINANT_DEFAULT,
  MAX_LVL:                  MAX_SKILL_LEVEL,
  DEFAULT_MARKET_PRICES,
  PRESET_DEFS,
  DEFAULT_PRESET_MAX_SKILLS,
  buildScrapReturn,
  buildFood,
  buildGearAndSets,
  writeAttributes,
  countAttributes,
  evalBuild,
  simulateBuild,
  getWeeklyCases,
  getCombinations,
  buildPresetParams,
  runOptimizer,
  optimize,
  optimizeSustainable,
  optimizeWarEco,
  varianceAnalysis,
  GEAR_STAT_KEYS,
};

window.OPT = OPT;
