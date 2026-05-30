import { buildFood } from './items.js';

// ─── Stat conversion constants ────────────────────────────────────────────────
const BASE_ATTACK      = 100;
const BASE_PRECISION   = 50;
const BASE_C_CHANCE    = 10;
const BASE_C_DMG       = 100;
const BASE_HEALTH      = 100;
const BASE_HUNGER      = 4;
const BASE_LOOT        = 5;
const BASE_ENTER       = 30;
const BASE_ENERGY      = 30;
const BASE_PRODUCTION  = 10;
const BASE_COMPANIES   = 2;

const ATTACK_PER_SKILL     = 25;
const PREC_PER_SKILL       = 5;
const CC_PER_SKILL         = 5;
const CDMG_PER_SKILL       = 20;
const ARMOR_PER_SKILL      = 6;
const DODGE_PER_SKILL      = 4;
const HEALTH_PER_SKILL     = 10;
const LOOT_PER_SKILL       = 2;
const ENTER_PER_SKILL      = 5;
const ENERGY_PER_SKILL     = 10;
const PRODUCTION_PER_SKILL = 3;

const ARMOR_SCALE = 40;
const DODGE_SCALE = 40;
const DURABILITY  = 100;

// Converts skill levels + gear into effective in-game stat values.
// Writes into the `out` object (mutates) for performance.
export function writeAttributes(skills, gear, out) {
  const armorRaw = skills.armor * ARMOR_PER_SKILL + gear.chest.armor + gear.pant.armor;
  const dodgeRaw = skills.dodge * DODGE_PER_SKILL + gear.boot.dodge;

  out.attack     = BASE_ATTACK     + skills.attack     * ATTACK_PER_SKILL + gear.gun.attack;
  out.precision  = BASE_PRECISION  + skills.precision  * PREC_PER_SKILL   + gear.glove.precision;
  out.cChance    = BASE_C_CHANCE   + skills.cChance    * CC_PER_SKILL     + gear.gun.cChance;
  out.cDmg       = BASE_C_DMG      + skills.cDmg       * CDMG_PER_SKILL   + gear.helmet.cDmg;
  out.armor      = (armorRaw / (armorRaw + ARMOR_SCALE)) * 100;
  out.dodge      = (dodgeRaw / (dodgeRaw + DODGE_SCALE)) * 100;
  out.health     = BASE_HEALTH     + skills.health     * HEALTH_PER_SKILL;
  out.hunger     = BASE_HUNGER     + skills.hunger;
  out.loot       = BASE_LOOT       + skills.loot       * LOOT_PER_SKILL;
  out.enter      = BASE_ENTER      + skills.enter      * ENTER_PER_SKILL;
  out.energy     = BASE_ENERGY     + skills.energy     * ENERGY_PER_SKILL;
  out.production = BASE_PRODUCTION + skills.production * PRODUCTION_PER_SKILL;
  out.companies  = BASE_COMPANIES  + skills.companies;
}

// Non-mutating wrapper.
export function countAttributes(skills, gear) {
  const out = {};
  writeAttributes(skills, gear, out);
  return out;
}

// Evaluates a build fully, returning all combat metrics, costs, and income components.
//
// skillValues — output of countAttributes/writeAttributes
// gear        — { gun, helmet, chest, pant, glove, boot }
// params      — optimizer params (includes marketPrices, ammoType, usePill, salary, etc.)
// food        — { inc, price } from buildFood
export function evalBuild(skillValues, gear, params, food) {
  const sv = skillValues;
  const noGun      = gear.gun.type === 'basic' || gear.gun.type === 'none';
  const ammoMults  = { light: 1.1, ammo: 1.2, heavy: 1.4 };
  const ammoMult   = noGun ? 1 : (ammoMults[params.ammoType] ?? 1.1);
  const pillMult   = params.usePill ? 1.6 : 1;
  const hours      = params.hours ?? (params.usePill ? 8 : 14);
  const dmgMult    = params.dmgMultiplier ?? 1;
  const noDaily    = !!params.excludeDailyIncome;
  const noItemLoot = !!params.excludeItemLoot;

  // ─── HP / survival ──────────────────────────────────────────────────────────
  const regenHP     = sv.health + (sv.health / 10) * hours;
  const foodActions = sv.hunger + Math.floor((sv.hunger / 10) * hours);
  const healPerFood = (food.inc / 100) * sv.health;
  const totalHP     = regenHP + foodActions * healPerFood;
  const initialHP   = sv.health + sv.hunger * healPerFood;
  const initialPct  = initialHP / totalHP;

  const armorDmgPct = (100 - sv.armor) / 10;
  const hpLostMean  = ((100 - sv.dodge) / 100) * armorDmgPct;
  const rounds      = totalHP / hpLostMean;

  // ─── Attack ─────────────────────────────────────────────────────────────────
  const precCapped  = Math.min(sv.precision, 100);
  const overPrec    = Math.max(sv.precision - 100, 0);
  const gunAtk      = gear.gun.attack;
  const effectiveAtk =
    ((sv.attack - gunAtk) * pillMult + gunAtk) *
    (params.rankBonus ?? 1) * ammoMult +
    overPrec * 4;

  // ─── Crit ────────────────────────────────────────────────────────────────────
  const ccCapped   = Math.min(sv.cChance, 100);
  const overCC     = Math.max(sv.cChance - 100, 0);
  const totalCDmg  = sv.cDmg + overCC * 4;

  // ─── Damage ──────────────────────────────────────────────────────────────────
  const missRounds   = (rounds * (100 - precCapped)) / 100;
  const hitRounds    = rounds - missRounds;
  const critRounds   = (hitRounds * ccCapped) / 100;
  const normalRounds = hitRounds - critRounds;

  const rawDmg =
    missRounds   * (effectiveAtk / 2) +
    normalRounds * effectiveAtk +
    critRounds   * ((100 + totalCDmg) / 100) * effectiveAtk;

  const battleBonus = params.battleBonus ?? (params.countryBonus ?? 1);
  const dmg = rawDmg * battleBonus * dmgMult;

  // ─── Costs ───────────────────────────────────────────────────────────────────
  const armorPieces = (gear.chest.price + gear.pant.price + gear.helmet.price +
                       gear.glove.price + gear.boot.price) / DURABILITY;
  const dodgePct  = sv.dodge / 100;
  const foodCost  = foodActions * food.price;
  const ammoCost  = noGun ? 0 : rounds * (params.marketPrices[{
    light: 'lightAmmoPrice', ammo: 'ammoPrice', heavy: 'heavyAmmoPrice',
  }[params.ammoType] ?? 'lightAmmoPrice'] ?? 0);
  const gunCost   = (gear.gun.price / DURABILITY) * rounds;
  const armorCost = armorPieces * rounds * (1 - dodgePct);
  const pillCost  = params.usePill ? params.marketPrices.pillPrice : 0;
  const totalCost = foodCost + ammoCost + gunCost + armorCost + pillCost;

  const buyIn = gear.gun.buyPrice + gear.helmet.buyPrice + gear.chest.buyPrice +
                gear.pant.buyPrice + gear.glove.buyPrice + gear.boot.buyPrice;

  // ─── Income ──────────────────────────────────────────────────────────────────
  const mp         = params.marketPrices;
  const hitRoundsForLoot = hitRounds;  // rounds that hit (precision contributes to chests)
  const chestsCount = hitRoundsForLoot * (sv.loot / 100);

  const workIncome      = noDaily ? 0 : (sv.energy / 10) * 2.4 * sv.production * params.salary;
  const selfWorkIncome  = noDaily ? 0 : (sv.enter  / 10) * 2.4 * sv.production * params.ppSelfWorkBonus * params.ppSelfWorkPrice;
  const companyIncome   = noDaily ? 0 : sv.companies * params.companyProfit + params.workersProfit;
  const chestIncome     = chestsCount * mp.casePrice;
  const redChestIncome  = (chestsCount / 100) * mp.redCasePrice;
  const itemLoot        = noItemLoot ? 0 : (dmg / 1000) * 0.15;
  const bountyIncome    = (dmg / 1000) * params.bounty;
  const dailyIncome     = noDaily ? 0 : 2 * mp.casePrice + 14;
  const weeklyIncome    = noDaily ? 0 : (getWeeklyCases(dmg) * mp.casePrice) / 7;

  const totalIncome = workIncome + selfWorkIncome + companyIncome +
                      chestIncome + redChestIncome + itemLoot +
                      bountyIncome + dailyIncome + weeklyIncome;

  const spent = totalCost - totalIncome;
  const setsUsed = (rounds * (100 - sv.dodge)) / 100 / 100;
  const gunsUsed = rounds / 100;

  return {
    dmg,
    dmgInitial:   dmg * initialPct,
    dmgSustained: dmg * (1 - initialPct),
    initialHealthPct: initialPct,
    cost:   totalCost,
    profit: totalIncome,
    spent,
    setsUsed,
    gunsUsed,
    foodUsed:     foodActions,
    bulletsUsed:  noGun ? 0 : rounds,
    chestsCount,
    startingCost: buyIn,
    costBreakdown: {
      food:      foodCost,
      bullets:   ammoCost,
      guns:      gunCost,
      equipment: armorCost,
      pills:     pillCost,
    },
    profitBreakdown: {
      work:      workIncome,
      selfWork:  selfWorkIncome,
      companies: companyIncome,
      chests:    chestIncome,
      redChests: redChestIncome,
      loot:      itemLoot,
      bounty:    bountyIncome,
      daily:     dailyIncome,
      weekly:    weeklyIncome,
    },
  };
}

// Weekly case tier thresholds → case count.
export function getWeeklyCases(dmg) {
  if (dmg >= 1_200_000) return 63;
  if (dmg >=   400_000) return 53;
  if (dmg >=    25_000) return 43;
  return 39;
}
