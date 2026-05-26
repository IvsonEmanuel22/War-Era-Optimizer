import { AMMO, FOOD, PILL } from './items.js';

// ─── Skill-to-stat conversion constants ──────────────────────────────────────
// Sourced from the game's internal combat engine.
// armor/dodge use a diminishing-returns formula: raw/(raw + 40) × 100.
const DURABILITY         = 100;  // uses per gear piece
const BASE_ATTACK        = 100;
const BASE_PRECISION     = 50;
const BASE_C_CHANCE      = 10;
const BASE_C_DMG         = 100;
const BASE_HEALTH        = 100;
const BASE_HUNGER        = 4;
const ATTACK_PER_SKILL   = 25;
const PREC_PER_SKILL     = 5;
const CC_PER_SKILL       = 5;
const CDMG_PER_SKILL     = 20;
const ARMOR_PER_SKILL    = 6;
const DODGE_PER_SKILL    = 4;
const HEALTH_PER_SKILL   = 10;
const ARMOR_SCALE        = 40;
const DODGE_SCALE        = 40;
const HP_LOST_BASE       = 10;   // HP lost per action before armor/dodge

// Converts raw skill levels + chosen gear into effective in-game stats.
// skills: { attack, precision, cChance, cDmg, armor, dodge, health, hunger }
// gear: { gun, helmet, chest, pant, glove, boot } — each an item from GEAR catalog
// Returns effective stats used by computeBuild.
export function resolveStats(skills, gear) {
  const armorRaw = (skills.armor ?? 0) * ARMOR_PER_SKILL
    + (gear.chest?.armor ?? 0)
    + (gear.pant?.armor  ?? 0);
  const dodgeRaw = (skills.dodge ?? 0) * DODGE_PER_SKILL
    + (gear.boot?.dodge ?? 0);

  return {
    attack:      BASE_ATTACK    + (skills.attack    ?? 0) * ATTACK_PER_SKILL + (gear.gun?.attack    ?? 0),
    weaponAtk:   gear.gun?.attack ?? 0,  // isolated weapon bonus — pill applies only to the rest
    precision:   BASE_PRECISION + (skills.precision ?? 0) * PREC_PER_SKILL   + (gear.glove?.precision ?? 0),
    cChance:     BASE_C_CHANCE  + (skills.cChance   ?? 0) * CC_PER_SKILL     + (gear.gun?.cChance   ?? 0),
    cDmg:        BASE_C_DMG     + (skills.cDmg      ?? 0) * CDMG_PER_SKILL   + (gear.helmet?.cDmg   ?? 0),
    armor:       (armorRaw / (armorRaw + ARMOR_SCALE)) * 100,
    dodge:       (dodgeRaw / (dodgeRaw + DODGE_SCALE)) * 100,
    health:      BASE_HEALTH + (skills.health ?? 0) * HEALTH_PER_SKILL,
    hunger:      BASE_HUNGER + (skills.hunger ?? 0),
  };
}

// Computes full combat metrics for a build.
//
// stats   — output of resolveStats()
// gear    — { gun, helmet, chest, pant, glove, boot } from GEAR catalog
// ammoKey — key from AMMO ('none' | 'light' | 'ammo' | 'heavy')
// foodKey — key from FOOD ('none' | 'bread' | 'meat' | 'fish')
// ctx     — { rankBonus, usePill, hours? }
//           rankBonus: player rank multiplier (≥ 1)
//           usePill:   whether a pill is consumed this session
//           hours:     combat session length override (default: pill ? 8 : 14)
//
// Returns: { dmg, dmgInitial, dmgSustained, rounds, cost, buyIn, costBreakdown }
export function computeBuild(stats, gear, ammoKey, foodKey, ctx) {
  const { rankBonus, usePill } = ctx;
  const ammo    = AMMO[ammoKey] ?? AMMO.light;
  const food    = FOOD[foodKey] ?? FOOD.none;
  const noGun   = !gear.gun || gear.gun.type === 'none' || gear.gun.type === 'basic';
  const aMult   = noGun ? 1 : ammo.mult;
  const pillMult = usePill ? PILL.boost : 1;
  const hours   = ctx.hours ?? (usePill ? PILL.hours : 14);

  // ─── Effective HP pool for this session ──────────────────────────────────
  const regenHP     = stats.health + (stats.health / 10) * hours;
  const foodActions = Math.floor(stats.hunger + (stats.hunger / 10) * hours);
  const healPerFood = (food.inc / 100) * stats.health;
  const totalHP     = regenHP + foodActions * healPerFood;
  const initialHP   = stats.health + stats.hunger * healPerFood;

  // ─── Survival (rounds of attack) ─────────────────────────────────────────
  // Evasion (dodge) gives a % chance to negate HP loss AND equipment wear per action.
  const hpLostMean = (HP_LOST_BASE * (100 - stats.armor) / 100)
                   * (100 - stats.dodge) / 100;
  const rounds = totalHP / hpLostMean;

  // ─── Attack ──────────────────────────────────────────────────────────────
  // Pill boosts the skill-based portion only; weapon bonus is not affected.
  const precCapped    = Math.min(stats.precision, 100);
  const overPrecision = Math.max(stats.precision - 100, 0);
  const pilledAtk     = (stats.attack - stats.weaponAtk) * pillMult + stats.weaponAtk;
  const effectiveAtk  = pilledAtk * rankBonus * aMult + overPrecision * 4;

  // ─── Crit ────────────────────────────────────────────────────────────────
  const cChanceCapped = Math.min(stats.cChance, 100);
  const overCrit      = Math.max(stats.cChance - 100, 0);
  const totalCDmg     = stats.cDmg + overCrit * 4;

  // ─── Total damage ────────────────────────────────────────────────────────
  const missRounds   = rounds * (100 - precCapped) / 100;
  const hitRounds    = rounds - missRounds;
  const critRounds   = hitRounds * cChanceCapped / 100;
  const normalRounds = hitRounds - critRounds;

  const dmg = (
    missRounds   * (effectiveAtk / 2)
    + normalRounds * effectiveAtk
    + critRounds   * ((100 + totalCDmg) / 100) * effectiveAtk
  ) * rankBonus;

  // ─── Costs ───────────────────────────────────────────────────────────────
  // Evasion negates equipment wear (except weapon + ammo).
  const dodgePct  = stats.dodge / 100;
  const foodCost  = foodActions * food.price;
  const ammoCost  = noGun ? 0 : rounds * ammo.price;
  const gunCost   = (gear.gun?.buyPrice ?? 0)    / DURABILITY * rounds;
  const armorCost = (
      (gear.helmet?.buyPrice ?? 0)
    + (gear.chest?.buyPrice  ?? 0)
    + (gear.pant?.buyPrice   ?? 0)
    + (gear.glove?.buyPrice  ?? 0)
    + (gear.boot?.buyPrice   ?? 0)
  ) / DURABILITY * rounds * (1 - dodgePct);
  const pillCost  = usePill ? PILL.price : 0;
  const totalCost = foodCost + ammoCost + gunCost + armorCost + pillCost;

  const buyIn = (gear.gun?.buyPrice    ?? 0)
    + (gear.helmet?.buyPrice ?? 0)
    + (gear.chest?.buyPrice  ?? 0)
    + (gear.pant?.buyPrice   ?? 0)
    + (gear.glove?.buyPrice  ?? 0)
    + (gear.boot?.buyPrice   ?? 0);

  return {
    dmg,
    dmgInitial:   dmg * (initialHP / totalHP),
    dmgSustained: dmg * (1 - initialHP / totalHP),
    rounds,
    cost: totalCost,
    buyIn,
    costBreakdown: { food: foodCost, ammo: ammoCost, gun: gunCost, armor: armorCost, pill: pillCost },
  };
}
