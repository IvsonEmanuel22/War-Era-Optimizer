import { SKILL_NAMES, COMBAT_SKILLS, MAX_SKILL_LEVEL, DEFAULT_PRESET_MAX_SKILLS } from './constants.js';
import { SP_PER_PLAYER_LEVEL } from './SkillPoints.js';
import { writeAttributes, evalBuild } from './DamageFormula.js';

// Returns true if `skill` can be lowered without cascading a structural cap violation.
// Only combat skills below the dominant are blocked from exceeding it.
function _canLower(skill, dominant, L, mins, noStructCaps) {
  if (L[skill] <= (mins[skill] ?? 0)) return false;
  if (noStructCaps) return true;
  if (skill === dominant) {
    for (const s of COMBAT_SKILLS) {
      if (s !== dominant && L[s] === L[dominant]) return false;
    }
  }
  return true;
}

// Effective ceiling for a skill given current levels and structural caps.
function _capFor(skill, dominant, maxs, L, noStructCaps) {
  const explicit = maxs[skill] ?? MAX_SKILL_LEVEL;
  if (noStructCaps) return explicit;
  if (COMBAT_SKILLS.has(skill) && skill !== dominant) return Math.min(explicit, L[dominant]);
  return explicit;
}

// Finds the best skill allocation for a fixed gear set via 3-phase greedy local search:
//
//   Phase 1 — Uniform seed: distribute SP round-robin until pool exhausted.
//   Phase 2 — Swap search: hill-climb (lower A by 1, raise B by 1) until no improvement.
//             Pool absorbs asymmetric SP residuals between swaps.
//   Phase 3 — Drain: spend any leftover pool SP on the skill with the best ΔDmg.
//
// params.spentLimit must be a resolved scalar.
// Returns a skill allocation object { attack, precision, … }.
export function optimizeSP(params, gear, food) {
  if (params.fixedSkills) return { ...params.fixedSkills };

  const totalSP  = params.lvl * SP_PER_PLAYER_LEVEL - (params.reservedSP ?? 0);
  const mins     = params.minSkills ?? {};
  const maxs     = { ...DEFAULT_PRESET_MAX_SKILLS, ...(params.maxSkills ?? {}) };
  const dominant = params.dominantSkill ?? 'attack';
  const noSC     = !!params.noStructuralCaps;

  // Initialise at skill floors.
  const L = {};
  for (const s of SKILL_NAMES) L[s] = mins[s] ?? 0;

  // Deduct SP already committed to floors.
  let pool = totalSP;
  for (const s of SKILL_NAMES) { const m = L[s]; pool -= (m * (m + 1)) / 2; }
  if (pool < 0) return L;

  const sv    = {};
  const cap   = s => _capFor(s, dominant, maxs, L, noSC);
  const score = () => {
    writeAttributes(L, gear, sv);
    const r = evalBuild(sv, gear, params, food);
    return r.spent <= params.spentLimit ? r.dmg : -Infinity;
  };

  // ─── Phase 1: Uniform seed ──────────────────────────────────────────────────
  // Round-robin over all skills; skip if cap reached or pool too small.
  // Repeats passes until a full pass allocates nothing.
  let seeded = true;
  while (seeded && pool > 0) {
    seeded = false;
    for (const s of SKILL_NAMES) {
      if (pool <= 0) break;
      const c = cap(s);
      if (L[s] >= c) continue;
      const cost = L[s] + 1;
      if (cost > pool) continue;
      L[s]++;
      pool -= cost;
      seeded = true;
    }
  }

  // ─── Phase 2: Swap search ───────────────────────────────────────────────────
  // For each origin that can be lowered: temporarily recover its SP, then try
  // raising each other skill. Accept the first swap that strictly improves score.
  // Revert if nothing improves. Repeat until a full pass finds no improvement.
  let improved = true;
  while (improved) {
    improved = false;
    for (const origin of SKILL_NAMES) {
      if (!_canLower(origin, dominant, L, mins, noSC)) continue;

      const baseline  = score();
      const recovered = L[origin]; // cost of the current level = level value
      L[origin]--;
      pool += recovered;

      let accepted = false;
      for (const dest of SKILL_NAMES) {
        if (dest === origin) continue;
        const c = cap(dest);
        if (L[dest] >= c) continue;
        const cost = L[dest] + 1;
        if (pool < cost) continue;

        L[dest]++;
        pool -= cost;

        if (score() > baseline) {
          accepted = true;
          improved = true;
          break;
        }

        L[dest]--;
        pool += cost;
      }

      if (!accepted) {
        L[origin]++;
        pool -= recovered;
      }
    }
  }

  // ─── Phase 3: Drain remaining pool ─────────────────────────────────────────
  // Spend any leftover SP on the skill that yields the highest ΔDmg per level.
  let drained = true;
  while (drained && pool > 0) {
    drained = false;
    let bestΔ    = -Infinity;
    let bestSkill = null;
    const base   = score();
    for (const s of SKILL_NAMES) {
      const c = cap(s);
      if (L[s] >= c) continue;
      const cost = L[s] + 1;
      if (cost > pool) continue;
      L[s]++;
      const Δ = score() - base;
      L[s]--;
      if (Δ > bestΔ) { bestΔ = Δ; bestSkill = s; }
    }
    if (bestSkill !== null) {
      pool -= L[bestSkill] + 1;
      L[bestSkill]++;
      drained = true;
    }
  }

  return L;
}
