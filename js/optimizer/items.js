// Catálogo estático de gear — ranges de stats por tier.
// Tiers em ordem crescente de poder: none → common → uncommon → rare → epic → legendary → mythic.
//
// Convenção de unidades:
//   attack, armor, dodge  — pontos inteiros (raw)
//   cChance, cDmg, precision — pontos percentuais (5 = 5%)
//
// buyPrice não está aqui — vem da API de mercado em runtime.
// Durabilidade: 100 usos por peça de gear.

export const TIERS = ['none', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

// Retorna um objeto de stats "flat" a partir de um item do catálogo.
// avgPrice: preço médio de mercado vindo da API.
// rollTarget: 0 = min roll (pior / mais barato), 0.5 = médio, 1 = max roll (melhor).
// buyPrice é escalado como avgPrice × (0.5 + 1.5 × rollTarget):
//   rollTarget 0   → avgPrice × 0.5
//   rollTarget 0.5 → avgPrice × 1.25
//   rollTarget 1   → avgPrice × 2.0
export function flatItem(item, avgPrice = 0, rollTarget = 0.5) {
  const result = { type: item.type, buyPrice: avgPrice * (0.5 + 1.5 * rollTarget) };
  for (const [key, val] of Object.entries(item)) {
    if (key === 'type') continue;
    result[key] = typeof val === 'object' && 'min' in val
      ? val.min + rollTarget * (val.max - val.min)
      : val;
  }
  return result;
}

// ─── Catálogo de gear ────────────────────────────────────────────────────────
// Valores percentuais (cChance, cDmg, precision) em pontos: 5 = 5%.

export const GEAR = {
  gun: [
    { type: 'none',      attack: { min:   0, max:   0 }, cChance: { min:  0, max:  0 } },
    { type: 'common',    attack: { min:  21, max:  40 }, cChance: { min:  1, max:  5 } },
    { type: 'uncommon',  attack: { min:  51, max:  60 }, cChance: { min:  6, max: 10 } },
    { type: 'rare',      attack: { min:  71, max:  90 }, cChance: { min: 11, max: 15 } },
    { type: 'epic',      attack: { min: 101, max: 130 }, cChance: { min: 16, max: 20 } },
    { type: 'legendary', attack: { min: 141, max: 170 }, cChance: { min: 26, max: 35 } },
    { type: 'mythic',    attack: { min: 221, max: 300 }, cChance: { min: 41, max: 50 } },
  ],
  helmet: [
    { type: 'none',      cDmg: { min:   0, max:   0 } },
    { type: 'common',    cDmg: { min:   1, max:  15 } },
    { type: 'uncommon',  cDmg: { min:  16, max:  30 } },
    { type: 'rare',      cDmg: { min:  31, max:  50 } },
    { type: 'epic',      cDmg: { min:  71, max:  90 } },
    { type: 'legendary', cDmg: { min:  91, max: 110 } },
    { type: 'mythic',    cDmg: { min: 121, max: 150 } },
  ],
  chest: [
    { type: 'none',      armor: { min:  0, max:  0 } },
    { type: 'common',    armor: { min:  1, max:  5 } },
    { type: 'uncommon',  armor: { min:  6, max: 10 } },
    { type: 'rare',      armor: { min: 11, max: 15 } },
    { type: 'epic',      armor: { min: 21, max: 30 } },
    { type: 'legendary', armor: { min: 36, max: 50 } },
    { type: 'mythic',    armor: { min: 56, max: 70 } },
  ],
  pant: [
    { type: 'none',      armor: { min:  0, max:  0 } },
    { type: 'common',    armor: { min:  1, max:  5 } },
    { type: 'uncommon',  armor: { min:  6, max: 10 } },
    { type: 'rare',      armor: { min: 11, max: 15 } },
    { type: 'epic',      armor: { min: 21, max: 30 } },
    { type: 'legendary', armor: { min: 36, max: 50 } },
    { type: 'mythic',    armor: { min: 56, max: 70 } },
  ],
  glove: [
    { type: 'none',      precision: { min:  0, max:  0 } },
    { type: 'common',    precision: { min:  1, max:  5 } },
    { type: 'uncommon',  precision: { min:  6, max: 10 } },
    { type: 'rare',      precision: { min: 11, max: 15 } },
    { type: 'epic',      precision: { min: 21, max: 25 } },
    { type: 'legendary', precision: { min: 31, max: 40 } },
    { type: 'mythic',    precision: { min: 51, max: 60 } },
  ],
  boot: [
    { type: 'none',      dodge: { min:  0, max:  0 } },
    { type: 'common',    dodge: { min:  1, max:  5 } },
    { type: 'uncommon',  dodge: { min:  6, max: 10 } },
    { type: 'rare',      dodge: { min: 11, max: 15 } },
    { type: 'epic',      dodge: { min: 21, max: 25 } },
    { type: 'legendary', dodge: { min: 31, max: 40 } },
    { type: 'mythic',    dodge: { min: 51, max: 60 } },
  ],
};

// ─── Consumíveis ─────────────────────────────────────────────────────────────

export const AMMO = {
  none:  { mult: 1.0, price: 0 },
  light: { mult: 1.1, price: 0.17 },
  ammo:  { mult: 1.2, price: 0.69 },
  heavy: { mult: 1.4, price: 2.49 },
};

export const FOOD = {
  none:  { inc: 0,  price: 0 },
  bread: { inc: 10, price: 1.82 },
  meat:  { inc: 15, price: 3.45 },
  fish:  { inc: 20, price: 6.74 },
};

// Pill: +60% attack na porção de skill por 8h, −60% nas 16h seguintes.
export const PILL = { boost: 1.6, hours: 8, price: 32 };

// ─── Helpers de tier ─────────────────────────────────────────────────────────

const TIER_IDX = Object.fromEntries(TIERS.map((t, i) => [t, i]));

// Índice numérico do tier (maior = melhor). −1 se desconhecido.
export const tierIndex = t => TIER_IDX[t] ?? -1;

// Retorna todos os items de um slot até (e incluindo) maxTier.
export const itemsUpTo = (slot, maxTier) =>
  GEAR[slot].filter(item => tierIndex(item.type) <= tierIndex(maxTier));
