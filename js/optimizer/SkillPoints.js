// Mecânica de Skill Points (SP) do WarEra.
//
// Progressão:
//   - Total de SP disponível: 4 × playerLevel
//   - Custo para subir uma skill do nível k para k+1: k+1 SP
//   - Custo acumulado para chegar ao nível N: 1+2+…+N = N×(N+1)/2
//   - Nível máximo por skill: 10 (custo total: 55 SP)
//
// Chaves de skill usadas: optimizer keys (attack, precision, cChance, cDmg,
// armor, dodge, health, hunger, loot, enter, energy, production, companies).

export const MAX_SKILL_LEVEL = 10;
export const SP_PER_PLAYER_LEVEL = 4;

// Custo acumulado para maxar uma skill = MAX_SKILL_LEVEL × (MAX_SKILL_LEVEL+1) / 2
export const FULL_SKILL_COST = (MAX_SKILL_LEVEL * (MAX_SKILL_LEVEL + 1)) / 2; // 55

// Skills agrupadas por domínio — usadas pelo otimizador para restringir o espaço.
export const COMBAT_SKILLS = ['attack', 'precision', 'cChance', 'cDmg', 'armor', 'dodge', 'health'];
export const ECO_SKILLS    = ['energy', 'production', 'enter', 'companies'];
export const OTHER_SKILLS  = ['hunger', 'loot'];
export const ALL_SKILLS    = [...COMBAT_SKILLS, ...ECO_SKILLS, ...OTHER_SKILLS];

// ─── Funções puras ────────────────────────────────────────────────────────────

// Total de SP disponível para um jogador no nível `playerLevel`.
export function totalSP(playerLevel) {
  return SP_PER_PLAYER_LEVEL * playerLevel;
}

// Custo em SP para avançar a skill do nível `current` para `current + 1`.
// Retorna Infinity se já está no máximo.
export function costToNextLevel(current) {
  if (current >= MAX_SKILL_LEVEL) return Infinity;
  return current + 1;
}

// Custo em SP para ir do nível `from` até o nível `to` (to > from).
// Equivale a (from+1) + (from+2) + … + to = to×(to+1)/2 − from×(from+1)/2.
export function costToLevel(from, to) {
  if (to <= from) return 0;
  if (to > MAX_SKILL_LEVEL) to = MAX_SKILL_LEVEL;
  return (to * (to + 1) - from * (from + 1)) / 2;
}

// SP total consumido por uma alocação { skillKey: level }.
// Custo acumulado de cada skill: N×(N+1)/2.
export function usedSP(allocation) {
  let total = 0;
  for (const level of Object.values(allocation)) {
    total += (level * (level + 1)) / 2;
  }
  return total;
}

// SP ainda disponível para distribuir.
export function remainingSP(playerLevel, allocation) {
  return totalSP(playerLevel) - usedSP(allocation);
}

// Retorna uma alocação zerada para o conjunto de skills fornecido (default: ALL_SKILLS).
export function emptyAllocation(skills = ALL_SKILLS) {
  return Object.fromEntries(skills.map(s => [s, 0]));
}

// Valida se uma alocação é consistente com o nível do jogador.
// Retorna { valid: bool, usedSP, totalSP, remaining }.
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
