export const SKILL_NAMES = [
  'attack', 'precision', 'cChance', 'cDmg',
  'armor', 'dodge', 'health', 'hunger',
  'loot', 'companies', 'production', 'energy', 'enter',
];

export const COMBAT_SKILLS = new Set([
  'attack', 'precision', 'cChance', 'cDmg', 'armor', 'dodge', 'health', 'hunger',
]);

export const ECO_SKILLS = new Set(['energy', 'enter']);

export const DOMINANT_DEFAULT  = 'attack';
export const MAX_SKILL_LEVEL   = 10;

export const GEAR_TIER_ORDER = ['none', 'basic', 'green', 'blue', 'purple', 'gold'];

export const GEAR_STAT_KEYS = {
  gun:    ['attack', 'cChance'],
  helmet: ['cDmg'],
  chest:  ['armor'],
  pant:   ['armor'],
  glove:  ['precision'],
  boot:   ['dodge'],
};

export const DEFAULT_MARKET_PRICES = {
  scrapPrice:     0.213,
  casePrice:      3.44,
  redCasePrice:   28.16,
  bulletPrice:    0.17,
  lightAmmoPrice: 0.17,
  ammoPrice:      0.69,
  heavyAmmoPrice: 2.49,
  pillPrice:      32,
  breadPrice:     1.82,
  meatPrice:      3.45,
  fishPrice:      6.74,
};

export const DEFAULT_PRESET_MAX_SKILLS = {
  attack:     8,
  precision:  8,
  cChance:    8,
  cDmg:       8,
  armor:      6,
  dodge:      7,
  health:     6,
  hunger:     6,
  loot:       6,
  enter:      0,
  energy:     1,
  production: 1,
  companies:  5,
};

export const PRESET_DEFS = {
  sustainable: {
    label: 'Sustainable Build',
    foodType: 'meat',
    usePill: true,
    gearTiers: { basic: false, green: true, blue: true, purple: true, gold: true },
    minSkills: {
      attack: 2, precision: 2, cChance: 1, cDmg: 1, armor: 1,
      dodge: 2, health: 1, hunger: 1, loot: 2, enter: 0, energy: 0,
      production: 0, companies: 4,
    },
    maxSkills: {},
    spentLimit: () => -15,
    companiesMaxAdjust: count => Math.max(0, count - 2),
    dominantSkill: 'attack',
  },
  warEco: {
    label: 'War-Eco Build',
    foodType: 'bread',
    usePill: true,
    gearTiers: { basic: true, green: true, blue: true, purple: false, gold: false },
    minSkills: {
      attack: 1, precision: 1, cChance: 0, cDmg: 0, armor: 0,
      dodge: 0, health: 0, hunger: 0, loot: 2, enter: 0, energy: 0,
      production: 0, companies: 4,
    },
    maxSkills: {},
    spentLimit: ({ entrep, energy, aeNet }) => -Math.abs(entrep + energy + aeNet) * 0.8,
    companiesMaxAdjust: count => Math.max(0, count - 2),
    dominantSkill: 'attack',
  },
  loot: {
    label: 'Loot Build',
    foodType: 'bread',
    usePill: false,
    gearTiers: { none: true, basic: true, green: true, blue: true, purple: false, gold: false },
    forcedNoneSlots: ['gun', 'helmet'],
    minSkills: {
      attack: 0, precision: 4, cChance: 0, cDmg: 0, armor: 0,
      dodge: 0, health: 0, hunger: 0, loot: 4, enter: 0, energy: 0,
      production: 0, companies: 0,
    },
    maxSkills: {
      attack: 0, precision: 8, cChance: 0, cDmg: 0, armor: 8,
      dodge: 8, health: 8, hunger: 8, loot: 10, enter: 8, energy: 8,
      production: 8,
    },
    spentLimit: () => 1000000000,
    companiesMaxAdjust: count => Math.max(0, count - 2),
    dominantSkill: 'precision',
  },
};
