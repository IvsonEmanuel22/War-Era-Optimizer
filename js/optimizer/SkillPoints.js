import {
  SKILL_NAMES, COMBAT_SKILLS,
  DOMINANT_DEFAULT, MAX_SKILL_LEVEL,
} from './constants.js';

export { MAX_SKILL_LEVEL };

export const SP_PER_PLAYER_LEVEL = 4;
export const FULL_SKILL_COST     = (MAX_SKILL_LEVEL * (MAX_SKILL_LEVEL + 1)) / 2; // 55

export const ALL_SKILLS    = SKILL_NAMES;
export { COMBAT_SKILLS };

// ─── SP math ─────────────────────────────────────────────────────────────────

export const totalSP = playerLevel => SP_PER_PLAYER_LEVEL * playerLevel;

export function costToNextLevel(current) {
  if (current >= MAX_SKILL_LEVEL) return Infinity;
  return current + 1;
}

export function costToLevel(from, to) {
  if (to <= from) return 0;
  if (to > MAX_SKILL_LEVEL) to = MAX_SKILL_LEVEL;
  return (to * (to + 1) - from * (from + 1)) / 2;
}

export function usedSP(allocation) {
  let total = 0;
  for (const lvl of Object.values(allocation)) total += (lvl * (lvl + 1)) / 2;
  return total;
}

export const remainingSP = (playerLevel, allocation) =>
  totalSP(playerLevel) - usedSP(allocation);

export const emptyAllocation = (skills = ALL_SKILLS) =>
  Object.fromEntries(skills.map(s => [s, 0]));

export function validateAllocation(playerLevel, allocation) {
  const used      = usedSP(allocation);
  const available = totalSP(playerLevel);
  const overCap   = Object.entries(allocation).some(([, lvl]) => lvl > MAX_SKILL_LEVEL || lvl < 0);
  return {
    valid:     used <= available && !overCap,
    usedSP:    used,
    totalSP:   available,
    remaining: available - used,
  };
}

// ─── Combination generator ───────────────────────────────────────────────────
// Generates every valid SP allocation for a player of `level`.
//
// minSkills / maxSkills — per-skill floor / ceiling (both default to 0 / MAX)
// dominantSkill         — combat skills can't exceed dominant; eco skills can't exceed production
// noStructuralCaps      — if true, suppress the structural caps above
// reservedSP            — SP withheld (e.g. for management/loot)
//
// Returns Array<{ attack, precision, ... }> (all 13 skill keys).
export function getCombinations(
  level,
  minSkills         = {},
  maxSkills         = {},
  dominantSkill     = DOMINANT_DEFAULT,
  noStructuralCaps  = false,
  reservedSP        = 0,
) {
  const available = level * SP_PER_PLAYER_LEVEL - reservedSP;
  const dominant  = SKILL_NAMES.includes(dominantSkill) ? dominantSkill : DOMINANT_DEFAULT;

  // Reorder: dominant skill first, then remaining in SKILL_NAMES order.
  const order = [dominant, ...SKILL_NAMES.filter(s => s !== dominant)];

  const triCost = Array.from({ length: MAX_SKILL_LEVEL + 1 }, (_, i) => (i * (i + 1)) / 2);

  const mins = order.map(s => Math.max(0, minSkills[s] ?? 0));
  const maxs = order.map(s => Math.min(MAX_SKILL_LEVEL, maxSkills[s] ?? MAX_SKILL_LEVEL));

  for (let i = 0; i < order.length; i++) {
    if (mins[i] > maxs[i]) return [];
  }

  const minSPUsed = mins.reduce((sum, m) => sum + triCost[m], 0);
  const budget    = available - minSPUsed;
  if (budget < 0) return [];

  const results = [];

  function recurse(idx, remaining, current) {
    if (idx === order.length) {
      if (remaining === 0) {
        const alloc = {};
        order.forEach((s, i) => { alloc[s] = current[i]; });
        results.push(alloc);
      }
      return;
    }

    const skill   = order[idx];
    const floor   = mins[idx];
    let   ceiling = maxs[idx];

    if (!noStructuralCaps) {
      if (COMBAT_SKILLS.has(skill) && skill !== dominant && current.length > 0) {
        ceiling = Math.min(ceiling, current[0]);  // current[0] is dominant level
      }
    }

    if (ceiling < floor) return;

    for (let lvl = floor; lvl <= ceiling; lvl++) {
      const spCost = triCost[lvl] - triCost[floor];
      if (spCost > remaining) break;
      current.push(lvl);
      recurse(idx + 1, remaining - spCost, current);
      current.pop();
    }
  }

  recurse(0, budget, []);
  return results;
}
