import { GEAR_TIER_ORDER, GEAR_STAT_KEYS } from './constants.js';

// Scrap multiplier per tier — multiply by scrapPrice to get total scrap return per piece.
const SCRAP_MULT = { none: 0, basic: 2, green: 6, blue: 18, purple: 54, gold: 162 };

export function buildScrapReturn(scrapPrice) {
  return {
    basic:  SCRAP_MULT.basic  * scrapPrice,
    green:  SCRAP_MULT.green  * scrapPrice,
    blue:   SCRAP_MULT.blue   * scrapPrice,
    purple: SCRAP_MULT.purple * scrapPrice,
    gold:   SCRAP_MULT.gold   * scrapPrice,
  };
}

export function buildFood(marketPrices) {
  return {
    none:  { inc:  0, price: 0 },
    bread: { inc: 10, price: marketPrices.breadPrice },
    meat:  { inc: 15, price: marketPrices.meatPrice  },
    fish:  { inc: 20, price: marketPrices.fishPrice  },
  };
}

// ─── Gear catalog ─────────────────────────────────────────────────────────────
// `price` = (nominal sell value − scrap return) — used as per-durability running cost.
// `buyPrice` = market purchase price — used as buy-in.
// Both are computed at call time from scrapReturn.

function makeCatalog(s) {  // s = scrapReturn object
  return {
    gun: [
      { type: 'none',   attack:   0, cChance:  0, buyPrice:   0, price:   0                 },
      { type: 'basic',  attack:  40, cChance:  5, buyPrice:   2, price:   2     - s.basic   },
      { type: 'green',  attack:  59, cChance: 10, buyPrice:   4.242, price: 4.242 - s.green  },
      { type: 'blue',   attack:  84, cChance: 13, buyPrice:  14, price:  15     - s.blue    },
      { type: 'purple', attack: 106, cChance: 19, buyPrice:  50, price:  45     - s.purple  },
      { type: 'gold',   attack: 148, cChance: 32, buyPrice: 160, price: 160     - s.gold    },
    ],
    helmet: [
      { type: 'none',   cDmg:   0, buyPrice:   0, price:   0               },
      { type: 'basic',  cDmg:  15, buyPrice:   2, price:   1.6  - s.basic  },
      { type: 'green',  cDmg:  29, buyPrice:   5.1, price:  5.1  - s.green },
      { type: 'blue',   cDmg:  46, buyPrice:  22, price:  22    - s.blue   },
      { type: 'purple', cDmg:  84, buyPrice:  55, price:  50    - s.purple },
      { type: 'gold',   cDmg: 104, buyPrice: 113, price: 116    - s.gold   },
    ],
    chest: [
      { type: 'none',   armor:  0, buyPrice:   0, price:   0               },
      { type: 'basic',  armor:  5, buyPrice:   2, price:   2    - s.basic  },
      { type: 'green',  armor: 10, buyPrice:   5.1, price:  5.1  - s.green },
      { type: 'blue',   armor: 14, buyPrice:  18, price:  18    - s.blue   },
      { type: 'purple', armor: 28, buyPrice:  50, price:  51    - s.purple },
      { type: 'gold',   armor: 40, buyPrice: 107, price: 108    - s.gold   },
    ],
    pant: [
      { type: 'none',   armor:  0, buyPrice:   0, price:   0               },
      { type: 'basic',  armor:  5, buyPrice:   2, price:   1.6  - s.basic  },
      { type: 'green',  armor: 10, buyPrice:   5.1, price:  5.1  - s.green },
      { type: 'blue',   armor: 14, buyPrice:  18, price:  18    - s.blue   },
      { type: 'purple', armor: 28, buyPrice:  50, price:  51    - s.purple },
      { type: 'gold',   armor: 40, buyPrice: 107, price: 108    - s.gold   },
    ],
    glove: [
      { type: 'none',   precision:  0, buyPrice:   0, price:   0               },
      { type: 'basic',  precision:  5, buyPrice:   2, price:   1.6  - s.basic  },
      { type: 'green',  precision: 10, buyPrice:   5.1, price:  5.1  - s.green },
      { type: 'blue',   precision: 15, buyPrice:  22, price:  22    - s.blue   },
      { type: 'purple', precision: 25, buyPrice:  58, price:  70    - s.purple },
      { type: 'gold',   precision: 37, buyPrice: 148, price: 148    - s.gold   },
    ],
    boot: [
      { type: 'none',  dodge:  0, buyPrice:   0, price:   0               },
      { type: 'basic', dodge:  5, buyPrice:   2, price:   1.6  - s.basic  },
      { type: 'green', dodge: 10, buyPrice:   5.1, price:  4.5  - s.green },
      { type: 'blue',  dodge: 15, buyPrice:  19, price:  22    - s.blue   },
      { type: 'purple',dodge: 22, buyPrice:  55, price:  55    - s.purple },
      { type: 'gold',  dodge: 34, buyPrice: 153, price: 151    - s.gold   },
    ],
  };
}

const TIER_IDX = Object.fromEntries(GEAR_TIER_ORDER.map((t, i) => [t, i]));
const tierIndex = t => TIER_IDX[t] ?? -1;

// Builds the flat array of gear sets used by the optimizer.
//
// scrapPrice:      market scrap price (affects per-durability running cost)
// gearTiers:       { basic: bool, green: bool, ... } — tiers to include
// rollMultiplier:  multiply all gear stats by this scalar (default 1; used for envelope re-optimization)
// gearOverrides:   { slot: { tier: { stat?: value, buyPrice?: value } } } — API market overrides
// forcedNoneSlots: string[] — slots locked to 'none' regardless of gearTiers
//
// Returns flat array of { gun, helmet, chest, pant, glove, boot } objects.
export function buildGearAndSets(
  scrapPrice,
  gearTiers,
  rollMultiplier  = 1,
  gearOverrides   = null,
  forcedNoneSlots = null,
) {
  const scrap   = buildScrapReturn(scrapPrice);
  const catalog = makeCatalog(scrap);

  if (rollMultiplier !== 1) {
    for (const slot of Object.keys(GEAR_STAT_KEYS)) {
      for (const item of catalog[slot]) {
        for (const stat of GEAR_STAT_KEYS[slot]) {
          item[stat] = item[stat] * rollMultiplier;
        }
      }
    }
  }

  if (gearOverrides) {
    for (const slot of Object.keys(GEAR_STAT_KEYS)) {
      const overSlot = gearOverrides[slot];
      if (!overSlot) continue;
      for (const item of catalog[slot]) {
        const ov = overSlot[item.type];
        if (!ov) continue;
        for (const stat of GEAR_STAT_KEYS[slot]) {
          if (ov[stat] != null) item[stat] = ov[stat];
        }
        if (ov.buyPrice != null) {
          item.buyPrice = ov.buyPrice;
          item.price    = ov.buyPrice - (SCRAP_MULT[item.type] || 0) * scrapPrice;
        }
      }
    }
  }

  const allowed  = slot => catalog[slot].filter(item => gearTiers[item.type]);
  const upTo     = (items, maxType) => items.filter(item => tierIndex(item.type) <= tierIndex(maxType));

  const pools = {};
  for (const slot of ['gun', 'helmet', 'chest', 'pant', 'glove', 'boot']) {
    pools[slot] = forcedNoneSlots?.includes(slot)
      ? catalog[slot].filter(item => item.type === 'none')
      : allowed(slot);
  }

  const sets = [];
  for (const boot   of pools.boot) {
    const gunPool    = upTo(pools.gun,    boot.type);
    const helmetPool = upTo(pools.helmet, boot.type);
    const chestPool  = upTo(pools.chest,  boot.type);
    const pantPool   = upTo(pools.pant,   boot.type);
    for (const gun    of gunPool)
    for (const helmet of helmetPool)
    for (const chest  of chestPool)
    for (const pant   of pantPool)
    for (const glove  of pools.glove)
      sets.push({ gun, helmet, chest, pant, glove, boot });
  }
  return sets;
}
