import {
  ALLOWED_COUNTRY_CODES,
  API_HOSTS,
  LVLUP_ECO_THRESHOLD,
  LVLUP_MAX_PLAYER_LVL,
  MM_TIER_TO_CODE,
  MM_TOP_K_VARIANTS,
  NAMES,
  PILL_DEBUFF_DMG_PENALTY_PCT,
  PLAYER_API_SKILL_MAP,
  PREFILL_BOOKMARKLET,
  PROXY,
  RECIPES,
  SKILL_DISPLAY,
  WAR_ECO_ADVANTAGES_HTML,
} from './config.js';
import {
  trpc,
  trpcAuth,
  fetchDirect,
  fetchByUserId,
  searchUsernames,
  loadGearSnapshot,
  getGearSnapshotState,
  setGearSnapshotListener,
} from './api.js';
import { extractPlayerSkills, unmodeledReservedSP, wrapForWarEco } from './transforms.js';
import { state } from './state.js';
import { $, setStatus, clearDebug, renderDebug, escapeHtml } from './utils.js';
import { analyze, render, renderUserPicker } from './analyze.js';
const _OPT_FACTORY = () => {
    const _0x4ed385 = [
        "attack",
        "precision",
        "cChance",
        "cDmg",
        "armor",
        "dodge",
        "health",
        "hunger",
        "loot",
        "companies",
        "production",
        "energy",
        "enter",
      ],
      _0x59a60a = new Set([
        "attack",
        "precision",
        "cChance",
        "cDmg",
        "armor",
        "dodge",
        "health",
        "hunger",
      ]),
      _0x3309e9 = new Set(["energy", "enter"]),
      _0x272495 = "attack",
      _0x6d7cd7 = 0xa,
      _0x4103b5 = ["none", "basic", "green", "blue", "purple", "gold"],
      _0x45b945 = {
        none: 0x0,
        basic: 0x2,
        green: 0x6,
        blue: 0x12,
        purple: 0x36,
        gold: 0xa2,
      },
      _0xa25a41 = {
        scrapPrice: 0.213,
        casePrice: 3.44,
        redCasePrice: 28.16,
        bulletPrice: 0.17,
        lightAmmoPrice: 0.17,
        ammoPrice: 0.69,
        heavyAmmoPrice: 2.49,
        pillPrice: 0x20,
        breadPrice: 1.82,
        meatPrice: 3.45,
        fishPrice: 6.74,
      },
      _0x506854 = (_0x4c1739) => ({
        basic: 0x2 * _0x4c1739,
        green: 0x6 * _0x4c1739,
        blue: 0x12 * _0x4c1739,
        purple: 0x36 * _0x4c1739,
        gold: 0xa2 * _0x4c1739,
      }),
      _0x2fff6c = (_0xb747e9) => ({
        none: { inc: 0x0, price: 0x0 },
        bread: { inc: 0xa, price: _0xb747e9["breadPrice"] },
        meat: { inc: 0xf, price: _0xb747e9["meatPrice"] },
        fish: { inc: 0x14, price: _0xb747e9["fishPrice"] },
      }),
      _0x38b673 = (_0x282433) =>
        Math["max"](0x0, _0x4103b5["indexOf"](_0x282433)),
      _0x3607cb = {
        gun: ["attack", "cChance"],
        helmet: ["cDmg"],
        chest: ["armor"],
        pant: ["armor"],
        glove: ["precision"],
        boot: ["dodge"],
      };
    function _0x2696ef(
      _0x553a39,
      _0x5f12d1,
      _0x519982 = 0x1,
      _0x19c775 = null,
      _0x153440 = null,
    ) {
      const _0x306917 = _0x506854(_0x553a39),
        _0xf07c72 = {
          gun: [
            {
              attack: 0x0,
              cChance: 0x0,
              buyPrice: 0x0,
              price: 0x0,
              type: "none",
            },
            {
              attack: 0x28,
              cChance: 0x5,
              buyPrice: 0x2,
              price: 0x2 - _0x306917["basic"],
              type: "basic",
            },
            {
              attack: 0x3b,
              cChance: 0xa,
              buyPrice: 4.242,
              price: 4.242 - _0x306917["green"],
              type: "green",
            },
            {
              attack: 0x54,
              cChance: 0xd,
              buyPrice: 0xe,
              price: 0xf - _0x306917["blue"],
              type: "blue",
            },
            {
              attack: 0x6a,
              cChance: 0x13,
              buyPrice: 0x32,
              price: 0x2d - _0x306917["purple"],
              type: "purple",
            },
            {
              attack: 0x94,
              cChance: 0x20,
              buyPrice: 0xa0,
              price: 0xa0 - _0x306917["gold"],
              type: "gold",
            },
          ],
          helmet: [
            { cDmg: 0x0, buyPrice: 0x0, price: 0x0, type: "none" },
            {
              cDmg: 0xf,
              buyPrice: 0x2,
              price: 1.6 - _0x306917["basic"],
              type: "basic",
            },
            {
              cDmg: 0x1d,
              buyPrice: 5.1,
              price: 5.1 - _0x306917["green"],
              type: "green",
            },
            {
              cDmg: 0x2e,
              buyPrice: 0x16,
              price: 0x16 - _0x306917["blue"],
              type: "blue",
            },
            {
              cDmg: 0x54,
              buyPrice: 0x37,
              price: 0x32 - _0x306917["purple"],
              type: "purple",
            },
            {
              cDmg: 0x68,
              buyPrice: 0x71,
              price: 0x74 - _0x306917["gold"],
              type: "gold",
            },
          ],
          chest: [
            { armor: 0x0, buyPrice: 0x0, price: 0x0, type: "none" },
            {
              armor: 0x5,
              buyPrice: 0x2,
              price: 0x2 - _0x306917["basic"],
              type: "basic",
            },
            {
              armor: 0xa,
              buyPrice: 5.1,
              price: 5.1 - _0x306917["green"],
              type: "green",
            },
            {
              armor: 0xf,
              buyPrice: 0x16,
              price: 0x16 - _0x306917["blue"],
              type: "blue",
            },
            {
              armor: 0x1e,
              buyPrice: 0x3e,
              price: 0x3b - _0x306917["purple"],
              type: "purple",
            },
            {
              armor: 0x28,
              buyPrice: 0x6a,
              price: 0x6a - _0x306917["gold"],
              type: "gold",
            },
          ],
          pant: [
            { armor: 0x0, buyPrice: 0x0, price: 0x0, type: "none" },
            {
              armor: 0x5,
              buyPrice: 0x2,
              price: 1.6 - _0x306917["basic"],
              type: "basic",
            },
            {
              armor: 0xa,
              buyPrice: 5.1,
              price: 5.1 - _0x306917["green"],
              type: "green",
            },
            {
              armor: 0xe,
              buyPrice: 0x12,
              price: 0x12 - _0x306917["blue"],
              type: "blue",
            },
            {
              armor: 0x1c,
              buyPrice: 0x32,
              price: 0x33 - _0x306917["purple"],
              type: "purple",
            },
            {
              armor: 0x28,
              buyPrice: 0x6b,
              price: 0x6c - _0x306917["gold"],
              type: "gold",
            },
          ],
          glove: [
            { precision: 0x0, buyPrice: 0x0, price: 0x0, type: "none" },
            {
              precision: 0x5,
              buyPrice: 0x2,
              price: 1.6 - _0x306917["basic"],
              type: "basic",
            },
            {
              precision: 0xa,
              buyPrice: 5.1,
              price: 5.1 - _0x306917["green"],
              type: "green",
            },
            {
              precision: 0xf,
              buyPrice: 0x16,
              price: 0x16 - _0x306917["blue"],
              type: "blue",
            },
            {
              precision: 0x19,
              buyPrice: 0x3a,
              price: 0x46 - _0x306917["purple"],
              type: "purple",
            },
            {
              precision: 0x25,
              buyPrice: 0x94,
              price: 0x94 - _0x306917["gold"],
              type: "gold",
            },
          ],
          boot: [
            { dodge: 0x0, buyPrice: 0x0, price: 0x0, type: "none" },
            {
              dodge: 0x5,
              buyPrice: 0x2,
              price: 1.6 - _0x306917["basic"],
              type: "basic",
            },
            {
              dodge: 0xa,
              buyPrice: 5.1,
              price: 4.5 - _0x306917["green"],
              type: "green",
            },
            {
              dodge: 0xf,
              buyPrice: 0x13,
              price: 0x16 - _0x306917["blue"],
              type: "blue",
            },
            {
              dodge: 0x16,
              buyPrice: 0x37,
              price: 0x37 - _0x306917["purple"],
              type: "purple",
            },
            {
              dodge: 0x22,
              buyPrice: 0x99,
              price: 0x97 - _0x306917["gold"],
              type: "gold",
            },
          ],
        };
      if (_0x519982 !== 0x1)
        for (const _0x1200cf of Object["keys"](_0x3607cb)) {
          for (const _0x1623ca of _0xf07c72[_0x1200cf]) {
            for (const _0x257568 of _0x3607cb[_0x1200cf])
              _0x1623ca[_0x257568] = _0x1623ca[_0x257568] * _0x519982;
          }
        }
      if (_0x19c775)
        for (const _0x43cd23 of Object["keys"](_0x3607cb)) {
          const _0x272dc7 = _0x19c775[_0x43cd23];
          if (!_0x272dc7) continue;
          for (const _0x8178ef of _0xf07c72[_0x43cd23]) {
            const _0xe622d = _0x272dc7[_0x8178ef["type"]];
            if (!_0xe622d) continue;
            for (const _0x1cedc5 of _0x3607cb[_0x43cd23]) {
              if (_0xe622d[_0x1cedc5] != null)
                _0x8178ef[_0x1cedc5] = _0xe622d[_0x1cedc5];
            }
            _0xe622d["buyPrice"] != null &&
              ((_0x8178ef["buyPrice"] = _0xe622d["buyPrice"]),
              (_0x8178ef["price"] =
                _0xe622d["buyPrice"] -
                (_0x45b945[_0x8178ef["type"]] || 0x0) * _0x553a39));
          }
        }
      const _0x4bbba0 = (_0x3990bf) =>
          _0x3990bf["filter"]((_0x4f8719) => _0x5f12d1[_0x4f8719["type"]]),
        _0x569386 = (_0x6e9fac, _0x4a693e) =>
          _0x6e9fac["filter"](
            (_0x348966) => _0x38b673(_0x348966["type"]) <= _0x38b673(_0x4a693e),
          ),
        _0x491ab2 = {
          gun: _0x4bbba0(_0xf07c72["gun"]),
          helmet: _0x4bbba0(_0xf07c72["helmet"]),
          chest: _0x4bbba0(_0xf07c72["chest"]),
          pant: _0x4bbba0(_0xf07c72["pant"]),
          glove: _0x4bbba0(_0xf07c72["glove"]),
          boot: _0x4bbba0(_0xf07c72["boot"]),
        };
      if (_0x153440)
        for (const _0x17d42d of _0x153440) {
          if (_0x491ab2[_0x17d42d])
            _0x491ab2[_0x17d42d] = _0xf07c72[_0x17d42d]["filter"](
              (_0xf9a1dd) => _0xf9a1dd["type"] === "none",
            );
        }
      const _0x20297a = [];
      for (const _0x492679 of _0x491ab2["boot"]) {
        const _0x2dc9c7 = _0x569386(_0x491ab2["gun"], _0x492679["type"]),
          _0x4e627b = _0x569386(_0x491ab2["helmet"], _0x492679["type"]),
          _0x11ee37 = _0x569386(_0x491ab2["chest"], _0x492679["type"]),
          _0x5dc87d = _0x569386(_0x491ab2["pant"], _0x492679["type"]);
        for (const _0x530deb of _0x2dc9c7)
          for (const _0x408150 of _0x4e627b)
            for (const _0x2fc331 of _0x11ee37)
              for (const _0x218ee1 of _0x5dc87d)
                for (const _0x523eaa of _0x491ab2["glove"])
                  _0x20297a["push"]({
                    gun: _0x530deb,
                    helmet: _0x408150,
                    chest: _0x2fc331,
                    pant: _0x218ee1,
                    glove: _0x523eaa,
                    boot: _0x492679,
                  });
      }
      return _0x20297a;
    }
    function _0x5318c5(_0x575753, _0x3576c8, _0xd1d271) {
      const _0x18c77e =
          _0x575753["armor"] * 0x6 +
          _0x3576c8["chest"]["armor"] +
          _0x3576c8["pant"]["armor"],
        _0x54934a = _0x575753["dodge"] * 0x4 + _0x3576c8["boot"]["dodge"];
      ((_0xd1d271["attack"] =
        0x64 + _0x575753["attack"] * 0x19 + _0x3576c8["gun"]["attack"]),
        (_0xd1d271["precision"] =
          0x32 +
          _0x575753["precision"] * 0x5 +
          _0x3576c8["glove"]["precision"]),
        (_0xd1d271["cChance"] =
          0xa + _0x575753["cChance"] * 0x5 + _0x3576c8["gun"]["cChance"]),
        (_0xd1d271["cDmg"] =
          0x64 + _0x575753["cDmg"] * 0x14 + _0x3576c8["helmet"]["cDmg"]),
        (_0xd1d271["armor"] = (_0x18c77e / (_0x18c77e + 0x28)) * 0x64),
        (_0xd1d271["dodge"] = (_0x54934a / (_0x54934a + 0x28)) * 0x64),
        (_0xd1d271["health"] = 0x64 + _0x575753["health"] * 0xa),
        (_0xd1d271["hunger"] = 0x4 + _0x575753["hunger"]),
        (_0xd1d271["loot"] = 0x5 + _0x575753["loot"] * 0x2),
        (_0xd1d271["enter"] = 0x1e + _0x575753["enter"] * 0x5),
        (_0xd1d271["energy"] = 0x1e + _0x575753["energy"] * 0xa),
        (_0xd1d271["production"] = 0xa + _0x575753["production"] * 0x3),
        (_0xd1d271["companies"] = 0x2 + _0x575753["companies"]));
    }
    function _0x526c05(_0x33519c, _0x4c95ed) {
      const _0x1287ba = {};
      return (_0x5318c5(_0x33519c, _0x4c95ed, _0x1287ba), _0x1287ba);
    }
    const _0x13801e = (_0x83e373) =>
      _0x83e373 >= 0x124f80
        ? 0x3f
        : _0x83e373 >= 0x61a80
          ? 0x35
          : _0x83e373 >= 0x61a8
            ? 0x2b
            : 0x27;
    function _0x3315f7(_0x4e64c8, _0xb8d5f4, _0x5c5115, _0x15867b) {
      const _0x376d80 =
          _0xb8d5f4["gun"]["type"] === "basic" ||
          _0xb8d5f4["gun"]["type"] === "none",
        _0x_aMultE =
          { light: 1.1, ammo: 1.2, heavy: 1.4 }[_0x5c5115["ammoType"]] ?? 1.1,
        _0x177c4d = _0x376d80 ? 0x1 : _0x_aMultE,
        _0x3349de = _0x5c5115["usePill"] ? 1.6 : 0x1,
        _0x5bf17f = _0x5c5115["hours"] ?? (_0x5c5115["usePill"] ? 0x8 : 0xe),
        _0x342be8 = _0x5c5115["dmgMultiplier"] ?? 0x1,
        _0x41587f = !!_0x5c5115["excludeDailyIncome"],
        _0x4c20c0 = !!_0x5c5115["excludeItemLoot"],
        _0x2159c9 =
          _0x4e64c8["health"] + (_0x4e64c8["health"] / 0xa) * _0x5bf17f,
        _0xdd5553 = Math["floor"](
          _0x4e64c8["hunger"] + (_0x4e64c8["hunger"] / 0xa) * _0x5bf17f,
        ),
        _0x99cc9a = (_0x15867b["inc"] / 0x64) * _0x4e64c8["health"],
        _0x1e4d6b = _0x2159c9 + _0xdd5553 * _0x99cc9a,
        _0x24b418 = _0x4e64c8["health"] + _0x4e64c8["hunger"] * _0x99cc9a,
        _0x3271a4 = _0x24b418 / _0x1e4d6b,
        _0x524f5f = (0x64 - _0x4e64c8["armor"]) / 0xa,
        _0x10e7f2 = ((0x64 - _0x4e64c8["dodge"]) / 0x64) * _0x524f5f,
        _0x3626cf = _0x1e4d6b / _0x10e7f2,
        _0x43854c = Math["min"](_0x4e64c8["precision"], 0x64),
        _0x59d327 = Math["max"](_0x4e64c8["precision"] - 0x64, 0x0),
        _0x_gAtk = _0xb8d5f4["gun"]["attack"],
        _0x229f40 =
          ((_0x4e64c8["attack"] - _0x_gAtk) * _0x3349de + _0x_gAtk) *
            (_0x5c5115["rankBonus"] ?? 1) *
            _0x177c4d +
          _0x59d327 * 0x4,
        _0x453189 = Math["min"](_0x4e64c8["cChance"], 0x64),
        _0x17d1c8 = Math["max"](_0x4e64c8["cChance"] - 0x64, 0x0),
        _0x2420df = _0x4e64c8["cDmg"] + _0x17d1c8 * 0x4,
        _0x4c5ae6 = (_0x3626cf * (0x64 - _0x43854c)) / 0x64,
        _0x10e9d1 = _0x3626cf - _0x4c5ae6,
        _0xf5a9ac = (_0x10e9d1 * (0x64 - _0x453189)) / 0x64,
        _0x1243b6 = (_0x10e9d1 * _0x453189) / 0x64,
        _0x27c494 =
          _0x4c5ae6 * (_0x229f40 / 0x2) +
          _0xf5a9ac * _0x229f40 +
          _0x1243b6 * ((0x64 + _0x2420df) / 0x64) * _0x229f40,
        _0x34f058 =
          _0x27c494 *
          (_0x5c5115["battleBonus"] ??
            _0x5c5115["rankBonus"] * _0x5c5115["countryBonus"]) *
          _0x342be8,
        _0x24cda0 = _0x34f058 * _0x3271a4,
        _0x363157 = _0x34f058 - _0x24cda0,
        _0x5e931f = _0xdd5553 * _0x15867b["price"],
        _0x3f80b9 = _0x376d80
          ? 0x0
          : _0x3626cf *
            _0x5c5115["marketPrices"][
              {
                light: "lightAmmoPrice",
                ammo: "ammoPrice",
                heavy: "heavyAmmoPrice",
              }[_0x5c5115["ammoType"]] ?? "lightAmmoPrice"
            ],
        _0x5eb4f0 = (_0xb8d5f4["gun"]["price"] / 0x64) * _0x3626cf,
        _0x21d1ed =
          (_0xb8d5f4["chest"]["price"] +
            _0xb8d5f4["pant"]["price"] +
            _0xb8d5f4["helmet"]["price"] +
            _0xb8d5f4["glove"]["price"] +
            _0xb8d5f4["boot"]["price"]) /
          0x64,
        _0x1ff4da =
          _0x21d1ed * _0x3626cf * ((0x64 - _0x4e64c8["dodge"]) / 0x64),
        _0x3011d2 =
          _0x3349de > 0x1 ? _0x5c5115["marketPrices"]["pillPrice"] : 0x0,
        _0x22b17b = _0x5e931f + _0x3f80b9 + _0x5eb4f0 + _0x1ff4da + _0x3011d2,
        _0x444a27 = (_0x4e64c8["energy"] / 0xa) * 2.4,
        _0x327b5e = _0x41587f
          ? 0x0
          : _0x444a27 * _0x4e64c8["production"] * _0x5c5115["salary"],
        _0xa3d364 = (_0x4e64c8["enter"] / 0xa) * 2.4,
        _0x1bb094 = _0x41587f
          ? 0x0
          : _0xa3d364 *
            _0x4e64c8["production"] *
            _0x5c5115["ppSelfWorkBonus"] *
            _0x5c5115["ppSelfWorkPrice"],
        _0x741e81 = _0x41587f
          ? 0x0
          : _0x4e64c8["companies"] * _0x5c5115["companyProfit"] +
            _0x5c5115["workersProfit"],
        _0x1075c6 = _0x10e9d1 * (_0x4e64c8["loot"] / 0x64),
        _0x404fcd = _0x1075c6 * _0x5c5115["marketPrices"]["casePrice"],
        _0x39ba09 =
          (_0x1075c6 / 0x64) * _0x5c5115["marketPrices"]["redCasePrice"],
        _0x1ec596 = _0x4c20c0 ? 0x0 : (_0x34f058 / 0x3e8) * 0.15,
        _0x397a3b = (_0x34f058 / 0x3e8) * _0x5c5115["bounty"],
        _0x1cd88a = _0x41587f
          ? 0x0
          : 0x2 * _0x5c5115["marketPrices"]["casePrice"] + 0xe,
        _0x2d03b5 = _0x41587f
          ? 0x0
          : (_0x13801e(_0x34f058) * _0x5c5115["marketPrices"]["casePrice"]) /
            0x7,
        _0x2f4c73 =
          _0x327b5e +
          _0x1bb094 +
          _0x404fcd +
          _0x39ba09 +
          _0x741e81 +
          _0x1cd88a +
          _0x1ec596 +
          _0x397a3b +
          _0x2d03b5,
        _0x2956d9 = _0x22b17b - _0x2f4c73,
        _0x4e388d = (_0x3626cf * (0x64 - _0x4e64c8["dodge"])) / 0x64,
        _0x8f34a6 =
          _0xb8d5f4["gun"]["buyPrice"] +
          _0xb8d5f4["helmet"]["buyPrice"] +
          _0xb8d5f4["chest"]["buyPrice"] +
          _0xb8d5f4["pant"]["buyPrice"] +
          _0xb8d5f4["glove"]["buyPrice"] +
          _0xb8d5f4["boot"]["buyPrice"];
      return {
        dmg: _0x34f058,
        dmgInitial: _0x24cda0,
        dmgSustained: _0x363157,
        initialHealthPct: _0x3271a4,
        cost: _0x22b17b,
        profit: _0x2f4c73,
        spent: _0x2956d9,
        setsUsed: _0x4e388d / 0x64,
        gunsUsed: _0x3626cf / 0x64,
        foodUsed: _0xdd5553,
        bulletsUsed: _0x376d80 ? 0x0 : _0x3626cf,
        chestsCount: _0x1075c6,
        startingCost: _0x8f34a6,
        costBreakdown: {
          food: _0x5e931f,
          bullets: _0x3f80b9,
          guns: _0x5eb4f0,
          equipment: _0x1ff4da,
          pills: _0x3011d2,
        },
        profitBreakdown: {
          work: _0x327b5e,
          selfWork: _0x1bb094,
          companies: _0x741e81,
          chests: _0x404fcd,
          redChests: _0x39ba09,
          loot: _0x1ec596,
          bounty: _0x397a3b,
          daily: _0x1cd88a,
          weekly: _0x2d03b5,
        },
      };
    }
    function _0x21bc7b(_0xcf2694, _0xc5fc2b, _0x1864b0, _0xa86c66, _0x388f24) {
      const _0x183aa1 =
          _0xc5fc2b["gun"]["type"] === "basic" ||
          _0xc5fc2b["gun"]["type"] === "none",
        _0x_aMultS =
          { light: 1.1, ammo: 1.2, heavy: 1.4 }[_0x1864b0["ammoType"]] ?? 1.1,
        _0x4bfd40 = _0x183aa1 ? 0x1 : _0x_aMultS,
        _0x1d4ed6 = _0x1864b0["usePill"] ? 1.6 : 0x1,
        _0x8715fd = _0x1864b0["hours"] ?? (_0x1864b0["usePill"] ? 0x8 : 0xe),
        _0x4ca2df = _0x1864b0["dmgMultiplier"] ?? 0x1,
        _0x58c8b1 = !!_0x1864b0["excludeDailyIncome"],
        _0x4eed10 = !!_0x1864b0["excludeItemLoot"],
        _0x35ed6f =
          _0xcf2694["health"] + (_0xcf2694["health"] / 0xa) * _0x8715fd,
        _0x5ea086 = Math["floor"](
          _0xcf2694["hunger"] + (_0xcf2694["hunger"] / 0xa) * _0x8715fd,
        ),
        _0x137b3d = (_0xa86c66["inc"] / 0x64) * _0xcf2694["health"],
        _0x228601 = _0x35ed6f + _0x5ea086 * _0x137b3d,
        _0x5be19f = (0x64 - _0xcf2694["armor"]) / 0xa,
        _0x321008 = ((0x64 - _0xcf2694["dodge"]) / 0x64) * _0x5be19f,
        _0x3bcaba = _0x228601 / _0x321008,
        _0x18e093 = Math["min"](_0xcf2694["precision"], 0x64),
        _0x3655c4 = Math["max"](_0xcf2694["precision"] - 0x64, 0x0),
        _0x_gAtk2 = _0xc5fc2b["gun"]["attack"],
        _0x182484 =
          ((_0xcf2694["attack"] - _0x_gAtk2) * _0x1d4ed6 + _0x_gAtk2) *
            (_0x1864b0["rankBonus"] ?? 1) *
            _0x4bfd40 +
          _0x3655c4 * 0x4,
        _0x36b1cb = Math["min"](_0xcf2694["cChance"], 0x64),
        _0x5da4fc = Math["max"](_0xcf2694["cChance"] - 0x64, 0x0),
        _0x4c6184 = _0xcf2694["cDmg"] + _0x5da4fc * 0x4,
        _0x2636f1 = (_0x3bcaba * (0x64 - _0x18e093)) / 0x64,
        _0x589c2f = _0x3bcaba - _0x2636f1,
        _0x509888 = (_0x589c2f * (0x64 - _0x36b1cb)) / 0x64,
        _0xbeedac = (_0x589c2f * _0x36b1cb) / 0x64,
        _0xf2f64c =
          _0x2636f1 * (_0x182484 / 0x2) +
          _0x509888 * _0x182484 +
          _0xbeedac * ((0x64 + _0x4c6184) / 0x64) * _0x182484,
        _0x1dbd28 =
          _0xf2f64c *
          (_0x1864b0["battleBonus"] ??
            _0x1864b0["rankBonus"] * _0x1864b0["countryBonus"]) *
          _0x4ca2df,
        _0x450f51 = _0x5ea086 * _0xa86c66["price"],
        _0x585156 = _0x183aa1
          ? 0x0
          : _0x3bcaba *
            _0x1864b0["marketPrices"][
              {
                light: "lightAmmoPrice",
                ammo: "ammoPrice",
                heavy: "heavyAmmoPrice",
              }[_0x1864b0["ammoType"]] ?? "lightAmmoPrice"
            ],
        _0x30ce58 = (_0xc5fc2b["gun"]["price"] / 0x64) * _0x3bcaba,
        _0x254ce9 =
          (_0xc5fc2b["chest"]["price"] +
            _0xc5fc2b["pant"]["price"] +
            _0xc5fc2b["helmet"]["price"] +
            _0xc5fc2b["glove"]["price"] +
            _0xc5fc2b["boot"]["price"]) /
          0x64,
        _0x1c9858 =
          _0x254ce9 * _0x3bcaba * ((0x64 - _0xcf2694["dodge"]) / 0x64),
        _0x362998 =
          _0x1d4ed6 > 0x1 ? _0x1864b0["marketPrices"]["pillPrice"] : 0x0,
        _0x12f2dd = _0x450f51 + _0x585156 + _0x30ce58 + _0x1c9858 + _0x362998,
        _0x4dd060 = _0x589c2f * (_0xcf2694["loot"] / 0x64),
        _0x33cd1b = _0x4dd060 * _0x1864b0["marketPrices"]["casePrice"],
        _0x1c086a =
          (_0x4dd060 / 0x64) * _0x1864b0["marketPrices"]["redCasePrice"],
        _0x340b37 = _0x4eed10 ? 0x0 : (_0x1dbd28 / 0x3e8) * 0.15,
        _0x2aa19f = (_0x1dbd28 / 0x3e8) * _0x1864b0["bounty"],
        _0x1885c4 = _0x58c8b1
          ? 0x0
          : (_0xcf2694["energy"] / 0xa) *
            2.4 *
            _0xcf2694["production"] *
            _0x1864b0["salary"],
        _0x5353d6 = _0x58c8b1
          ? 0x0
          : (_0xcf2694["enter"] / 0xa) *
            2.4 *
            _0xcf2694["production"] *
            _0x1864b0["ppSelfWorkBonus"] *
            _0x1864b0["ppSelfWorkPrice"],
        _0xddcd90 = _0x58c8b1
          ? 0x0
          : _0xcf2694["companies"] * _0x1864b0["companyProfit"] +
            _0x1864b0["workersProfit"],
        _0x27ba1e = _0x58c8b1
          ? 0x0
          : 0x2 * _0x1864b0["marketPrices"]["casePrice"] + 0xe,
        _0x4f06b = _0x58c8b1
          ? 0x0
          : (_0x13801e(_0x1dbd28) * _0x1864b0["marketPrices"]["casePrice"]) /
            0x7,
        _0x2cf8fd =
          _0x1885c4 +
          _0x5353d6 +
          _0x33cd1b +
          _0x1c086a +
          _0xddcd90 +
          _0x27ba1e +
          _0x340b37 +
          _0x2aa19f +
          _0x4f06b;
      ((_0x388f24["dmg"] = _0x1dbd28),
        (_0x388f24["spent"] = _0x12f2dd - _0x2cf8fd));
    }
    function _0x339af1(_0x5e12b3, _0x5b748c, _0x445e33) {
      const _0x210351 = _0x2fff6c(_0x445e33["marketPrices"]),
        _0x2d0f62 = _0x210351[_0x445e33["foodType"]] ?? _0x210351["fish"],
        _0x1d89c9 = _0x526c05(_0x5b748c, _0x5e12b3),
        _0x528613 = _0x3315f7(_0x1d89c9, _0x5e12b3, _0x445e33, _0x2d0f62);
      return (
        (_0x528613["gear"] = _0x5e12b3),
        (_0x528613["skills"] = _0x5b748c),
        (_0x528613["skillValues"] = _0x1d89c9),
        _0x528613
      );
    }
    function _0x5ebcc8(
      _0x2f325d,
      _0x3a8829 = {},
      _0x158ba7 = {},
      _0x16616b = _0x272495,
      _0x188a7e = ![],
      _0x103cfd = 0x0,
    ) {
      const _0x4d285f = _0x2f325d * 0x4 - _0x103cfd,
        _0x43473a = _0x4ed385["includes"](_0x16616b) ? _0x16616b : _0x272495,
        _0x23cff5 = [
          _0x43473a,
          ..._0x4ed385["filter"]((_0x153b0f) => _0x153b0f !== _0x43473a),
        ],
        _0x586651 = _0x23cff5["indexOf"]("production"),
        _0x597f36 = Array["from"](
          { length: _0x6d7cd7 + 0x1 },
          (_0x505f3e, _0x4e5946) => (_0x4e5946 * (_0x4e5946 + 0x1)) / 0x2,
        ),
        _0x1d3416 = _0x23cff5["map"]((_0x592117) =>
          Math["max"](0x0, _0x3a8829[_0x592117] ?? 0x0),
        ),
        _0x130504 = _0x23cff5["map"]((_0x356d53) =>
          Math["min"](_0x6d7cd7, _0x158ba7[_0x356d53] ?? _0x6d7cd7),
        );
      for (let _0x5b1ae4 = 0x0; _0x5b1ae4 < _0x23cff5["length"]; _0x5b1ae4++)
        if (_0x1d3416[_0x5b1ae4] > _0x130504[_0x5b1ae4]) return [];
      const _0x352dd7 = _0x1d3416["reduce"](
          (_0x1b2674, _0x15b9f9) => _0x1b2674 + _0x597f36[_0x15b9f9],
          0x0,
        ),
        _0x1d6240 = _0x4d285f - _0x352dd7;
      if (_0x1d6240 < 0x0) return [];
      const _0x19af4b = [];
      function _0x371a8f(_0x50dd97, _0x4aa30a, _0x1a53e5) {
        if (_0x50dd97 === _0x23cff5["length"]) {
          if (_0x4aa30a === 0x0) {
            const _0x736919 = {};
            (_0x23cff5["forEach"]((_0x4602de, _0x3810ed) => {
              _0x736919[_0x4602de] = _0x1a53e5[_0x3810ed];
            }),
              _0x19af4b["push"](_0x736919));
          }
          return;
        }
        const _0x4f78c2 = _0x1d3416[_0x50dd97],
          _0x1b56af = _0x23cff5[_0x50dd97];
        let _0x252f63 = _0x130504[_0x50dd97];
        if (
          !_0x188a7e &&
          _0x59a60a["has"](_0x1b56af) &&
          _0x1b56af !== _0x43473a &&
          _0x1a53e5["length"] > 0x0
        )
          _0x252f63 = Math["min"](_0x252f63, _0x1a53e5[0x0]);
        if (
          !_0x188a7e &&
          _0x3309e9["has"](_0x1b56af) &&
          _0x1a53e5["length"] > _0x586651
        )
          _0x252f63 = Math["min"](_0x252f63, _0x1a53e5[_0x586651]);
        if (_0x252f63 < _0x4f78c2) return;
        for (let _0x34196a = _0x4f78c2; _0x34196a <= _0x252f63; _0x34196a++) {
          const _0x3f9c6f = _0x597f36[_0x34196a] - _0x597f36[_0x4f78c2];
          if (_0x3f9c6f > _0x4aa30a) break;
          (_0x1a53e5["push"](_0x34196a),
            _0x371a8f(_0x50dd97 + 0x1, _0x4aa30a - _0x3f9c6f, _0x1a53e5),
            _0x1a53e5["pop"]());
        }
      }
      return (_0x371a8f(0x0, _0x1d6240, []), _0x19af4b);
    }
    const _0x229c90 = {
        attack: 0x8,
        precision: 0x8,
        cChance: 0x8,
        cDmg: 0x8,
        armor: 0x6,
        dodge: 0x7,
        health: 0x6,
        hunger: 0x6,
        loot: 0x6,
        enter: 0x0,
        energy: 0x1,
        production: 0x1,
        companies: 0x5,
      },
      _0xf60841 = {
        sustainable: {
          label: "Sustainable Build",
          foodType: "meat",
          usePill: !![],
          gearTiers: {
            basic: ![],
            green: !![],
            blue: !![],
            purple: !![],
            gold: !![],
          },
          minSkills: {
            attack: 0x2,
            precision: 0x2,
            cChance: 0x1,
            cDmg: 0x1,
            armor: 0x1,
            dodge: 0x2,
            health: 0x1,
            hunger: 0x1,
            loot: 0x2,
            enter: 0x0,
            energy: 0x0,
            production: 0x0,
            companies: 0x4,
          },
          maxSkills: {},
          spentLimit: () => -0xf,
          companiesMaxAdjust: (_0x27bf69) => Math["max"](0x0, _0x27bf69 - 0x2),
          dominantSkill: "attack",
        },
        warEco: {
          label: "War-Eco Build",
          foodType: "bread",
          usePill: !![],
          gearTiers: {
            basic: !![],
            green: !![],
            blue: !![],
            purple: ![],
            gold: ![],
          },
          minSkills: {
            attack: 0x1,
            precision: 0x1,
            cChance: 0x0,
            cDmg: 0x0,
            armor: 0x0,
            dodge: 0x0,
            health: 0x0,
            hunger: 0x0,
            loot: 0x2,
            enter: 0x0,
            energy: 0x0,
            production: 0x0,
            companies: 0x4,
          },
          maxSkills: {},
          spentLimit: ({
            entrep: _0x365dd7,
            energy: _0x18cd8b,
            aeNet: _0x1b849c,
          }) => -Math["abs"](_0x365dd7 + _0x18cd8b + _0x1b849c) * 0.8,
          companiesMaxAdjust: (_0x1f3e1a) => Math["max"](0x0, _0x1f3e1a - 0x2),
          dominantSkill: "attack",
        },
        loot: {
          label: "Loot Build",
          foodType: "bread",
          usePill: ![],
          gearTiers: {
            none: !![],
            basic: !![],
            green: !![],
            blue: !![],
            purple: ![],
            gold: ![],
          },
          forcedNoneSlots: ["gun", "helmet"],
          minSkills: {
            attack: 0x0,
            precision: 0x4,
            cChance: 0x0,
            cDmg: 0x0,
            armor: 0x0,
            dodge: 0x0,
            health: 0x0,
            hunger: 0x0,
            loot: 0x4,
            enter: 0x0,
            energy: 0x0,
            production: 0x0,
            companies: 0x0,
          },
          maxSkills: {
            attack: 0x0,
            precision: 0x8,
            cChance: 0x0,
            cDmg: 0x0,
            armor: 0x8,
            dodge: 0x8,
            health: 0x8,
            hunger: 0x8,
            loot: 0xa,
            enter: 0x8,
            energy: 0x8,
            production: 0x8,
          },
          spentLimit: () => 0x3b9aca00,
          companiesMaxAdjust: (_0x5eee51) => Math["max"](0x0, _0x5eee51 - 0x2),
          dominantSkill: "precision",
        },
      };
    function _0x31f3aa(_0x449b94, _0x1bbbee = {}) {
      const _0x65234f = _0xf60841[_0x449b94];
      if (!_0x65234f) throw new Error("Unknown preset: " + _0x449b94);
      const _0x1a5774 = _0x1bbbee["companyCount"] ?? 0x0,
        _0x122938 = _0x65234f["companiesMaxAdjust"](_0x1a5774),
        _0x233199 = {
          ...(_0x1bbbee["minSkillsOverride"] ?? _0x65234f["minSkills"]),
        };
      if ((_0x233199["companies"] ?? 0x0) > _0x122938)
        _0x233199["companies"] = _0x122938;
      const _0x322597 = {
          ..._0x229c90,
          ...(_0x1bbbee["maxSkillsOverride"] ?? _0x65234f["maxSkills"]),
          companies: _0x122938,
        },
        _0x56b3d5 = _0x65234f["spentLimit"]({
          entrep: _0x1bbbee["entrep"] ?? 0x0,
          energy: _0x1bbbee["energy"] ?? 0x0,
          aeNet: _0x1bbbee["aeNet"] ?? 0x0,
        });
      return {
        spentLimit:
          _0x1bbbee["spentLimitOverride"] !== undefined
            ? _0x1bbbee["spentLimitOverride"]
            : _0x56b3d5,
        ...(_0x1bbbee["fixedSkills"]
          ? { fixedSkills: _0x1bbbee["fixedSkills"] }
          : {}),
        minDmgPerExtraDollar: 0x3e8,
        lvl: _0x1bbbee["lvl"] ?? 0x1,
        rankBonus: _0x1bbbee["rankBonus"] ?? 1.2,
        countryBonus: _0x1bbbee["countryBonus"] ?? 1.9,
        battleBonus: _0x1bbbee["battleBonus"],
        ammoType: _0x1bbbee["ammoType"] ?? "light",
        bounty: _0x1bbbee["bountyOverride"] ?? 0x0,
        foodType: _0x1bbbee["foodTypeOverride"] ?? _0x65234f["foodType"],
        usePill: _0x1bbbee["usePillOverride"] ?? _0x65234f["usePill"],
        hours: _0x1bbbee["hoursOverride"],
        dmgMultiplier: _0x1bbbee["dmgMultiplierOverride"],
        excludeDailyIncome: _0x1bbbee["excludeDailyIncomeOverride"],
        excludeItemLoot: _0x1bbbee["excludeItemLootOverride"],
        objective: _0x1bbbee["objectiveOverride"] ?? "maxDmg",
        companyProfit: _0x1bbbee["avgAePerCompany"] ?? 0x0,
        salary: _0x1bbbee["employer"]?.["netWage"] ?? 0x0,
        ppSelfWorkBonus: _0x1bbbee["employer"]
          ? 0x1 + _0x1bbbee["employer"]["productionBonus"] / 0x64
          : 0x1,
        ppSelfWorkPrice: _0x1bbbee["employer"]?.["netWage"] ?? 0x0,
        workersProfit: _0x1bbbee["workersProfit"] ?? 0x0,
        minSkills: _0x233199,
        maxSkills: _0x322597,
        gearTiers: _0x1bbbee["gearTiersOverride"] ?? _0x65234f["gearTiers"],
        forcedNoneSlots:
          _0x1bbbee["forcedNoneSlotsOverride"] ??
          _0x65234f["forcedNoneSlots"] ??
          null,
        dominantSkill: _0x65234f["dominantSkill"],
        noStructuralCaps:
          _0x1bbbee["noStructuralCapsOverride"] ??
          _0x65234f["noStructuralCaps"] ??
          ![],
        reservedSP: _0x1bbbee["reservedSPOverride"] ?? 0x0,
        marketPrices: _0x1bbbee["marketPrices"] ?? _0xa25a41,
        rollMultiplier: _0x1bbbee["rollMultiplier"] ?? 0x1,
        gearOverrides: _0x1bbbee["gearOverrides"] ?? null,
      };
    }
    function _0x345226(_0x2132aa, _0x4ab80b) {
      const _0xa37c05 = _0x2fff6c(_0x2132aa["marketPrices"]),
        _0x2b0185 = _0xa37c05[_0x2132aa["foodType"]] ?? _0xa37c05["fish"],
        _0x343dcb = _0x2696ef(
          _0x2132aa["marketPrices"]["scrapPrice"],
          _0x2132aa["gearTiers"],
          _0x2132aa["rollMultiplier"] ?? 0x1,
          _0x2132aa["gearOverrides"] ?? null,
          _0x2132aa["forcedNoneSlots"] ?? null,
        ),
        _0x4ce131 = _0x2132aa["minSkills"] ?? {},
        _0x244c7 = { ..._0x229c90, ...(_0x2132aa["maxSkills"] ?? {}) },
        _0x227c6f = _0x4ed385["includes"](_0x2132aa["dominantSkill"])
          ? _0x2132aa["dominantSkill"]
          : _0x272495,
        _0x31be17 = _0x2132aa["fixedSkills"]
          ? [_0x2132aa["fixedSkills"]]
          : _0x5ebcc8(
              _0x2132aa["lvl"],
              _0x4ce131,
              _0x244c7,
              _0x227c6f,
              _0x2132aa["noStructuralCaps"],
              _0x2132aa["reservedSP"],
            ),
        _0x453921 = Date["now"]();
      if (!_0x343dcb["length"] || !_0x31be17["length"])
        return {
          bestBuild: null,
          elapsed: Date["now"]() - _0x453921,
          gearSetsCount: _0x343dcb["length"],
          gearSetsPruned: 0x0,
          skillCombosCount: _0x31be17["length"],
          combosEvaluated: 0x0,
          effectiveMin: _0x4ce131,
          effectiveMax: _0x244c7,
          dominantSkill: _0x227c6f,
        };
      const _0x31d7eb = {};
      for (const _0x2a67b0 of _0x4ed385)
        _0x31d7eb[_0x2a67b0] = _0x244c7[_0x2a67b0] ?? _0x6d7cd7;
      const _0x4bf519 = _0x31d7eb[_0x227c6f];
      for (const _0x592cc3 of _0x59a60a)
        if (_0x592cc3 !== _0x227c6f)
          _0x31d7eb[_0x592cc3] = Math["min"](_0x31d7eb[_0x592cc3], _0x4bf519);
      const _0x244e2a = _0x31d7eb["production"];
      for (const _0x370c1d of _0x3309e9)
        _0x31d7eb[_0x370c1d] = Math["min"](_0x31d7eb[_0x370c1d], _0x244e2a);
      const _0x439268 = {},
        _0x4c9a2f = {
          attack: _0x4ce131["attack"] ?? 0x0,
          precision: _0x4ce131["precision"] ?? 0x0,
          cChance: _0x4ce131["cChance"] ?? 0x0,
          cDmg: _0x4ce131["cDmg"] ?? 0x0,
          armor: _0x4ce131["armor"] ?? 0x0,
          dodge: _0x4ce131["dodge"] ?? 0x0,
          health: _0x4ce131["health"] ?? 0x0,
          hunger: _0x4ce131["hunger"] ?? 0x0,
          loot: _0x31d7eb["loot"],
          companies: _0x31d7eb["companies"],
          production: _0x31d7eb["production"],
          energy: _0x31d7eb["energy"],
          enter: _0x31d7eb["enter"],
        },
        _0x2bc536 = [];
      for (const _0x56ac9f of _0x343dcb) {
        _0x5318c5(_0x4c9a2f, _0x56ac9f, _0x439268);
        const _0xdf54d = _0x3315f7(_0x439268, _0x56ac9f, _0x2132aa, _0x2b0185)[
          "spent"
        ];
        _0x5318c5(_0x31d7eb, _0x56ac9f, _0x439268);
        const _0x1b6b7c = _0x3315f7(_0x439268, _0x56ac9f, _0x2132aa, _0x2b0185)[
          "spent"
        ];
        if (Math["min"](_0xdf54d, _0x1b6b7c) <= _0x2132aa["spentLimit"])
          _0x2bc536["push"](_0x56ac9f);
      }
      const _0x55ec70 = _0x2bc536["map"]((_0x53bb49) => {
          return (
            _0x5318c5(_0x31d7eb, _0x53bb49, _0x439268),
            {
              gear: _0x53bb49,
              ubDmg: _0x3315f7(_0x439268, _0x53bb49, _0x2132aa, _0x2b0185)[
                "dmg"
              ],
            }
          );
        })["sort"](
          (_0x482ae7, _0x72b4e9) => _0x72b4e9["ubDmg"] - _0x482ae7["ubDmg"],
        ),
        _0x50ed1b = new Int32Array(_0x31be17["length"]);
      for (let _0x1a7238 = 0x0; _0x1a7238 < _0x31be17["length"]; _0x1a7238++) {
        const _0x320374 = _0x31be17[_0x1a7238];
        _0x50ed1b[_0x1a7238] =
          _0x2132aa["preset"] === "sustainable" ||
          _0x2132aa["preset"] === "warEco"
            ? _0x1a7238
            : ((((((_0x320374["attack"] * 0xb + _0x320374["precision"]) * 0xb +
                _0x320374["cChance"]) *
                0xb +
                _0x320374["cDmg"]) *
                0xb +
                _0x320374["armor"]) *
                0xb +
                _0x320374["dodge"]) *
                0xb +
                _0x320374["health"]) *
                0xb +
              _0x320374["hunger"];
      }
      const _0x6ca16a = new Uint32Array(_0x31be17["length"]);
      for (let _0x5c3d4d = 0x0; _0x5c3d4d < _0x6ca16a["length"]; _0x5c3d4d++)
        _0x6ca16a[_0x5c3d4d] = _0x5c3d4d;
      _0x6ca16a["sort"](
        (_0x1cf2c3, _0x16545f) => _0x50ed1b[_0x1cf2c3] - _0x50ed1b[_0x16545f],
      );
      const _0x468524 = new Array(_0x31be17["length"]),
        _0x3d9199 = new Int32Array(_0x31be17["length"]);
      for (let _0x415577 = 0x0; _0x415577 < _0x6ca16a["length"]; _0x415577++) {
        ((_0x468524[_0x415577] = _0x31be17[_0x6ca16a[_0x415577]]),
          (_0x3d9199[_0x415577] = _0x50ed1b[_0x6ca16a[_0x415577]]));
      }
      const _0x535244 = [];
      let _0x3698f4 = -0x1;
      for (let _0x2b094c = 0x0; _0x2b094c < _0x3d9199["length"]; _0x2b094c++) {
        _0x3d9199[_0x2b094c] !== _0x3698f4 &&
          (_0x535244["push"](_0x2b094c), (_0x3698f4 = _0x3d9199[_0x2b094c]));
      }
      _0x535244["push"](_0x468524["length"]);
      const _0x3f535e = _0x535244["length"] - 0x1;
      if (_0x55ec70["length"] === 0x0)
        return {
          bestBuild: null,
          elapsed: Date["now"]() - _0x453921,
          gearSetsCount: _0x343dcb["length"],
          gearSetsPruned: _0x343dcb["length"],
          skillCombosCount: _0x31be17["length"],
          combosEvaluated: 0x0,
          effectiveMin: _0x4ce131,
          effectiveMax: _0x244c7,
          dominantSkill: _0x227c6f,
        };
      const _0x3e59b4 = _0x55ec70[0x0]["gear"],
        _0x11aaa0 = new Float64Array(_0x3f535e);
      for (let _0x1fc921 = 0x0; _0x1fc921 < _0x3f535e; _0x1fc921++) {
        const _0x31a24e = _0x468524[_0x535244[_0x1fc921]];
        (_0x5318c5(_0x31a24e, _0x3e59b4, _0x439268),
          (_0x11aaa0[_0x1fc921] = _0x3315f7(
            _0x439268,
            _0x3e59b4,
            _0x2132aa,
            _0x2b0185,
          )["dmg"]));
      }
      const _0x567674 = new Int32Array(_0x3f535e);
      for (let _0x142138 = 0x0; _0x142138 < _0x3f535e; _0x142138++)
        _0x567674[_0x142138] = _0x142138;
      _0x567674["sort"](
        (_0x7b9bb7, _0x775579) => _0x11aaa0[_0x775579] - _0x11aaa0[_0x7b9bb7],
      );
      const _0x3856e0 = _0x2132aa["marketPrices"],
        _0x2bd901 =
          _0x3856e0[
            {
              light: "lightAmmoPrice",
              ammo: "ammoPrice",
              heavy: "heavyAmmoPrice",
            }[_0x2132aa["ammoType"]] ?? "lightAmmoPrice"
          ] ?? _0x3856e0["bulletPrice"],
        _0x1bff8 = _0x3856e0["casePrice"],
        _0x36406a = _0x3856e0["redCasePrice"],
        _0x4a3ef1 = _0x3856e0["pillPrice"],
        _0x2506ea = _0x2132aa["usePill"],
        _0x188d80 = _0x2506ea ? 1.6 : 0x1,
        _0x2b578d = _0x2506ea ? _0x4a3ef1 : 0x0,
        _0x17602b = _0x2132aa["hours"] ?? (_0x2506ea ? 0x8 : 0xe),
        _0x556851 = _0x2132aa["dmgMultiplier"] ?? 0x1,
        _0x32b479 = !!_0x2132aa["excludeDailyIncome"],
        _0x479b55 = !!_0x2132aa["excludeItemLoot"],
        _0x4180c2 = _0x2132aa["rankBonus"],
        _0x54287a = _0x2132aa["countryBonus"],
        _0x_bBonus = _0x2132aa["battleBonus"] ?? _0x54287a,
        _0xbb9a5f = _0x2132aa["bounty"],
        _0x5ce95d = _0x32b479 ? 0x0 : _0x2132aa["salary"] * 2.4,
        _0x102070 = _0x32b479
          ? 0x0
          : _0x2132aa["ppSelfWorkBonus"] * _0x2132aa["ppSelfWorkPrice"] * 2.4,
        _0x20172a = _0x32b479 ? 0x0 : _0x2132aa["companyProfit"],
        _0x4d532c = _0x32b479 ? 0x0 : _0x2132aa["workersProfit"],
        _0x51f161 = _0x32b479 ? 0x0 : 0x2 * _0x1bff8 + 0xe,
        _0x107d35 = _0x2b0185["inc"],
        _0x4ded49 = _0x2b0185["price"],
        _0x3b34a8 = _0x2132aa["spentLimit"],
        _0x226523 = _0x2132aa["minDmgPerExtraDollar"],
        _0x5588bc = _0x2132aa["objective"] ?? "maxDmg";
      let _0x57a44e = null,
        _0x17eca2 = 0x0,
        _0x42880b = 0x0;
      for (let _0x23adf3 = 0x0; _0x23adf3 < _0x55ec70["length"]; _0x23adf3++) {
        if (
          _0x5588bc === "maxDmg" &&
          _0x57a44e &&
          _0x55ec70[_0x23adf3]["ubDmg"] < _0x57a44e["dmg"]
        )
          break;
        const _0x4dc8bb = _0x55ec70[_0x23adf3]["gear"];
        _0x17eca2++;
        _0x4ab80b &&
          (_0x23adf3 % 0x14 === 0x0 ||
            _0x23adf3 === _0x55ec70["length"] - 0x1) &&
          _0x4ab80b(
            _0x17eca2,
            _0x55ec70["length"],
            _0x57a44e ? _0x57a44e["dmg"] : 0x0,
          );
        const _0x178876 =
            _0x4dc8bb["gun"]["type"] === "basic" ||
            _0x4dc8bb["gun"]["type"] === "none",
          _0x_ammoMult =
            { light: 1.1, ammo: 1.2, heavy: 1.4 }[_0x2132aa["ammoType"]] ?? 1.1,
          _0x431c32 = _0x178876 ? 0x1 : _0x_ammoMult,
          _0x30dcb9 = _0x4dc8bb["gun"]["price"],
          _0x21d4a2 = _0x4dc8bb["gun"]["attack"],
          _0x9c6603 = _0x4dc8bb["gun"]["cChance"],
          _0x2aacae = _0x4dc8bb["helmet"]["cDmg"],
          _0x574f3f = _0x4dc8bb["chest"]["armor"],
          _0x1c3ace = _0x4dc8bb["pant"]["armor"],
          _0x23244d = _0x4dc8bb["glove"]["precision"],
          _0xd3c962 = _0x4dc8bb["boot"]["dodge"],
          _0x3fa40d =
            _0x4dc8bb["chest"]["price"] +
            _0x4dc8bb["pant"]["price"] +
            _0x4dc8bb["helmet"]["price"] +
            _0x4dc8bb["glove"]["price"] +
            _0x4dc8bb["boot"]["price"];
        for (let _r = 0; _r < _0x3f535e; _r++) {
          const _rs = _0x468524[_0x535244[_r]];
          _0x5318c5(_rs, _0x4dc8bb, _0x439268);
          _0x11aaa0[_r] = _0x3315f7(_0x439268, _0x4dc8bb, _0x2132aa, _0x2b0185)[
            "dmg"
          ];
        }
        _0x567674.sort((_a, _b) => _0x11aaa0[_b] - _0x11aaa0[_a]);
        if (
          _0x5588bc === "maxDmg" &&
          _0x57a44e &&
          _0x11aaa0[_0x567674[0x0]] < _0x57a44e["dmg"]
        )
          continue;
        for (let _0x5f122c = 0x0; _0x5f122c < _0x3f535e; _0x5f122c++) {
          const _0x2c54c5 = _0x567674[_0x5f122c];
          if (
            _0x5588bc === "maxDmg" &&
            _0x57a44e &&
            _0x11aaa0[_0x2c54c5] < _0x57a44e["dmg"]
          )
            break;
          const _0x234ef8 = _0x535244[_0x2c54c5],
            _0x4a8520 = _0x535244[_0x2c54c5 + 0x1],
            _0x303241 = _0x468524[_0x234ef8],
            _0x2d2ec6 = 0x64 + _0x303241["attack"] * 0x19 + _0x21d4a2,
            _0x285e4a = 0x32 + _0x303241["precision"] * 0x5 + _0x23244d,
            _0x2fb7cf = 0xa + _0x303241["cChance"] * 0x5 + _0x9c6603,
            _0x21cc03 = 0x64 + _0x303241["cDmg"] * 0x14 + _0x2aacae,
            _0x370c1c = _0x303241["armor"] * 0x6 + _0x574f3f + _0x1c3ace,
            _0x38a869 = _0x303241["dodge"] * 0x4 + _0xd3c962,
            _0x3dfc26 = (_0x370c1c / (_0x370c1c + 0x28)) * 0x64,
            _0x2c174f = (_0x38a869 / (_0x38a869 + 0x28)) * 0x64,
            _0x577842 = 0x64 + _0x303241["health"] * 0xa,
            _0x1f4ed2 = 0x4 + _0x303241["hunger"],
            _0x4a26c0 = _0x577842 + (_0x577842 / 0xa) * _0x17602b,
            _0x32a82d = Math["floor"](
              _0x1f4ed2 + (_0x1f4ed2 / 0xa) * _0x17602b,
            ),
            _0x1ac92f = _0x4a26c0 + _0x32a82d * (_0x107d35 / 0x64) * _0x577842,
            _0x420361 =
              _0x1ac92f /
              (((0x64 - _0x2c174f) / 0x64) * ((0x64 - _0x3dfc26) / 0xa)),
            _0x529894 = _0x285e4a < 0x64 ? _0x285e4a : 0x64,
            _0x18c25f = _0x285e4a > 0x64 ? _0x285e4a - 0x64 : 0x0,
            _0x510b06 =
              ((_0x2d2ec6 - _0x21d4a2) * _0x188d80 + _0x21d4a2) *
                _0x4180c2 *
                _0x431c32 +
              _0x18c25f * 0x4,
            _0x33edd5 = _0x2fb7cf < 0x64 ? _0x2fb7cf : 0x64,
            _0x32990b = _0x2fb7cf > 0x64 ? _0x2fb7cf - 0x64 : 0x0,
            _0x590ca4 = _0x21cc03 + _0x32990b * 0x4,
            _0xaf4b36 = (_0x420361 * (0x64 - _0x529894)) / 0x64,
            _0x28c30b = _0x420361 - _0xaf4b36,
            _0x35397d = (_0x28c30b * (0x64 - _0x33edd5)) / 0x64,
            _0x299020 = (_0x28c30b * _0x33edd5) / 0x64,
            _0x1fb7cc =
              _0xaf4b36 * (_0x510b06 / 0x2) +
              _0x35397d * _0x510b06 +
              _0x299020 * ((0x64 + _0x590ca4) / 0x64) * _0x510b06,
            _0x1e48a0 = _0x1fb7cc * _0x_bBonus * _0x556851;
          if (
            _0x5588bc === "maxDmg" &&
            _0x57a44e &&
            _0x1e48a0 < _0x57a44e["dmg"]
          )
            continue;
          const _0x19bab0 = _0x32a82d * _0x4ded49,
            _0x518909 = _0x178876 ? 0x0 : _0x420361 * _0x2bd901,
            _0x450d39 = (_0x30dcb9 / 0x64) * _0x420361,
            _0x110d75 =
              (_0x3fa40d / 0x64) * _0x420361 * ((0x64 - _0x2c174f) / 0x64),
            _0x1fc406 =
              _0x19bab0 + _0x518909 + _0x450d39 + _0x110d75 + _0x2b578d,
            _0x3e905f =
              (_0x28c30b * _0x1bff8) / 0x64 + (_0x28c30b * _0x36406a) / 0x2710,
            _0x5441e2 =
              _0x51f161 +
              (_0x479b55 ? 0x0 : (_0x1e48a0 / 0x3e8) * 0.15) +
              (_0x1e48a0 / 0x3e8) * _0xbb9a5f +
              (_0x32b479 ? 0x0 : (_0x13801e(_0x1e48a0) * _0x1bff8) / 0x7);
          for (let _0x4290d9 = _0x234ef8; _0x4290d9 < _0x4a8520; _0x4290d9++) {
            const _0x46f576 = _0x468524[_0x4290d9],
              _0x429f3e = 0x5 + _0x46f576["loot"] * 0x2,
              _0x484d8f = 0xa + _0x46f576["production"] * 0x3,
              _0x3f7f93 = 0x3 + _0x46f576["energy"],
              _0x3ba6bf = 0x3 + _0x46f576["enter"] * 0.5,
              _0x2b4727 =
                _0x484d8f * (_0x3f7f93 * _0x5ce95d + _0x3ba6bf * _0x102070) +
                _0x429f3e * _0x3e905f +
                (0x2 + _0x46f576["companies"]) * _0x20172a +
                _0x4d532c +
                _0x5441e2,
              _0x5dadb2 = _0x1fc406 - _0x2b4727;
            _0x42880b++;
            if (_0x5dadb2 > _0x3b34a8) continue;
            if (!_0x57a44e) {
              _0x57a44e = {
                gear: _0x4dc8bb,
                sIdx: _0x4290d9,
                spent: _0x5dadb2,
                dmg: _0x1e48a0,
              };
              continue;
            }
            let _0x5e0dd4;
            if (_0x5588bc === "minSpent")
              _0x5e0dd4 = _0x5dadb2 < _0x57a44e["spent"];
            else {
              const _0x1d91a3 = _0x5dadb2 - _0x57a44e["spent"],
                _0x11a5e1 = _0x1e48a0 - _0x57a44e["dmg"];
              _0x5e0dd4 =
                (_0x1d91a3 <= 0x0 && _0x11a5e1 > 0x0) ||
                (_0x1d91a3 < 0x0 && _0x11a5e1 === 0x0) ||
                (_0x1d91a3 > 0x0 &&
                  _0x11a5e1 > 0x0 &&
                  _0x11a5e1 / _0x1d91a3 >= _0x226523);
            }
            if (_0x5e0dd4)
              _0x57a44e = {
                gear: _0x4dc8bb,
                sIdx: _0x4290d9,
                spent: _0x5dadb2,
                dmg: _0x1e48a0,
              };
          }
        }
      }
      let _0x491c3d = null;
      if (_0x57a44e) {
        const _0x3be2ab = _0x57a44e["gear"],
          _0x3605df = _0x468524[_0x57a44e["sIdx"]];
        ((_0x491c3d = _0x339af1(_0x3be2ab, _0x3605df, _0x2132aa)),
          (_0x491c3d["appliedSkillMin"] = _0x4ce131),
          (_0x491c3d["appliedSkillMax"] = _0x244c7),
          (_0x491c3d["appliedDominantSkill"] = _0x227c6f));
      }
      return {
        bestBuild: _0x491c3d,
        elapsed: Date["now"]() - _0x453921,
        gearSetsCount: _0x343dcb["length"],
        gearSetsPruned: _0x343dcb["length"] - _0x17eca2,
        skillCombosCount: _0x31be17["length"],
        combosEvaluated: _0x42880b,
        effectiveMin: _0x4ce131,
        effectiveMax: _0x244c7,
        dominantSkill: _0x227c6f,
      };
    }
    const _0x3b91e3 = (_0x1e74e4, _0x34e9c9) =>
        _0x345226(_0x31f3aa("sustainable", _0x1e74e4), _0x34e9c9),
      _0x451f94 = (_0x490dcb, _0x33c761) =>
        _0x345226(_0x31f3aa("warEco", _0x490dcb), _0x33c761),
      _0x591b9c = (_0x503daa, _0x4307d8, _0x49fb7d) =>
        _0x345226(_0x31f3aa(_0x503daa, _0x4307d8), _0x49fb7d);
    function _0x41f85e(
      _0x7d16e0,
      _0x45051b,
      _0x203a6b = 0.15,
      _0x44c019 = 0x3e8,
    ) {
      if (!_0x7d16e0) return null;
      const _0x252f47 = _0x2fff6c(_0x45051b["marketPrices"]),
        _0x1ef327 = _0x252f47[_0x45051b["foodType"]] ?? _0x252f47["fish"],
        _0x336f8a = _0x7d16e0["gear"],
        _0x561958 = _0x7d16e0["skills"],
        _0x281619 = {},
        _0x29d359 = new Array(_0x44c019),
        _0xb4a4e2 = new Array(_0x44c019),
        _0x40053f = new Array(_0x44c019),
        _0x384fdc = {};
      for (const _0x328b6f of Object["keys"](_0x336f8a))
        _0x384fdc[_0x328b6f] = { ..._0x336f8a[_0x328b6f] };
      for (let _0x4ce359 = 0x0; _0x4ce359 < _0x44c019; _0x4ce359++) {
        for (const _0x35da7f of Object["keys"](_0x3607cb)) {
          const _0x1b591a = _0x384fdc[_0x35da7f],
            _0x64ab2 = _0x336f8a[_0x35da7f];
          for (const _0x1c344c of _0x3607cb[_0x35da7f]) {
            const _0x49b839 = 0x1 + (Math["random"]() * 0x2 - 0x1) * _0x203a6b;
            _0x1b591a[_0x1c344c] = _0x64ab2[_0x1c344c] * _0x49b839;
          }
        }
        _0x5318c5(_0x561958, _0x384fdc, _0x281619);
        const _0x48f3db = _0x3315f7(_0x281619, _0x384fdc, _0x45051b, _0x1ef327);
        ((_0x29d359[_0x4ce359] = _0x48f3db["dmg"]),
          (_0xb4a4e2[_0x4ce359] = _0x48f3db["spent"]),
          (_0x40053f[_0x4ce359] = _0x48f3db["profit"]));
      }
      const _0x3d75d9 = (_0x4b3bb1) => {
        const _0x41e86b = _0x4b3bb1["slice"]()["sort"](
            (_0x3f3efc, _0x49602a) => _0x3f3efc - _0x49602a,
          ),
          _0xe7b24e = _0x41e86b["length"],
          _0xe53096 =
            _0x4b3bb1["reduce"](
              (_0x2e859c, _0x311cad) => _0x2e859c + _0x311cad,
              0x0,
            ) / _0xe7b24e,
          _0x24c1ff =
            _0x4b3bb1["reduce"](
              (_0x45b817, _0x1ffcb2) =>
                _0x45b817 + (_0x1ffcb2 - _0xe53096) ** 0x2,
              0x0,
            ) / _0xe7b24e,
          _0x44d691 = Math["sqrt"](_0x24c1ff),
          _0x2a0069 = (_0x156649) =>
            _0x41e86b[
              Math["min"](_0xe7b24e - 0x1, Math["floor"](_0x156649 * _0xe7b24e))
            ];
        return {
          mean: _0xe53096,
          std: _0x44d691,
          p10: _0x2a0069(0.1),
          p50: _0x2a0069(0.5),
          p90: _0x2a0069(0.9),
          min: _0x41e86b[0x0],
          max: _0x41e86b[_0xe7b24e - 0x1],
        };
      };
      return {
        spread: _0x203a6b,
        samples: _0x44c019,
        dmg: _0x3d75d9(_0x29d359),
        spent: _0x3d75d9(_0xb4a4e2),
        profit: _0x3d75d9(_0x40053f),
      };
    }
    function _0x3bf7d8() {
      const _0x9d210b = { ..._0xa25a41 },
        _0x5e98c = {
          spentLimit: 0x0,
          minDmgPerExtraDollar: 0x3e8,
          lvl: 0x1e,
          rankBonus: 1.2,
          countryBonus: 1.9,
          bounty: 0x0,
          foodType: "fish",
          usePill: !![],
          companyProfit: 0x14,
          salary: 0.121,
          ppSelfWorkBonus: 1.6675,
          ppSelfWorkPrice: 0.082,
          workersProfit: 0x0,
          marketPrices: _0x9d210b,
        },
        _0x263e52 = _0x2696ef(_0x9d210b["scrapPrice"], {
          basic: ![],
          green: ![],
          blue: !![],
          purple: !![],
          gold: !![],
        }),
        _0x4535c2 = _0x5ebcc8(
          0x1e,
          {
            attack: 0x6,
            precision: 0x4,
            cChance: 0x4,
            cDmg: 0x4,
            armor: 0x2,
            dodge: 0x4,
            health: 0x3,
            hunger: 0x2,
            loot: 0x2,
            enter: 0x0,
            energy: 0x0,
            production: 0x0,
            companies: 0x0,
          },
          {
            attack: 0x8,
            precision: 0x8,
            cChance: 0x8,
            cDmg: 0x8,
            armor: 0x6,
            dodge: 0x7,
            health: 0x6,
            hunger: 0x6,
            loot: 0x6,
            enter: 0x0,
            energy: 0x1,
            production: 0x1,
            companies: 0x5,
          },
        ),
        _0x3de795 = _0x339af1(_0x263e52[0x0], _0x4535c2[0x0], _0x5e98c);
      return {
        gearSets: _0x263e52["length"],
        skillCombos: _0x4535c2["length"],
        sample: _0x3de795,
      };
    }
    return {
      SKILL_NAMES: _0x4ed385,
      GEAR_TIER_ORDER: _0x4103b5,
      DOMINANT_DEFAULT: _0x272495,
      MAX_LVL: _0x6d7cd7,
      DEFAULT_MARKET_PRICES: _0xa25a41,
      PRESET_DEFS: _0xf60841,
      DEFAULT_PRESET_MAX_SKILLS: _0x229c90,
      buildScrapReturn: _0x506854,
      buildFood: _0x2fff6c,
      buildGearAndSets: _0x2696ef,
      writeAttributes: _0x5318c5,
      countAttributes: _0x526c05,
      evalBuild: _0x3315f7,
      simulateBuild: _0x339af1,
      getWeeklyCases: _0x13801e,
      getCombinations: _0x5ebcc8,
      buildPresetParams: _0x31f3aa,
      runOptimizer: _0x345226,
      optimize: _0x591b9c,
      optimizeSustainable: _0x3b91e3,
      optimizeWarEco: _0x451f94,
      varianceAnalysis: _0x41f85e,
      GEAR_STAT_KEYS: _0x3607cb,
      _selfTest: _0x3bf7d8,
    };
  },
  OPT = _OPT_FACTORY(),
  _OPT_SOURCE = "(" + _OPT_FACTORY["toString"]() + ")()";
window["OPT"] = OPT;
window["_LIVE_OFFERS"] = {
  generatedAt: "2026-05-19T20:55:45.655Z",
  items: {
    knife: {
      n: 0x29,
      price: {
        n: 0x29,
        min: 1.28,
        p10: 1.284,
        p50: 1.3,
        p90: 1.45,
        max: 1.55,
        mean: 1.336,
      },
      skills: {
        attack: {
          n: 0x29,
          min: 0x16,
          p10: 0x1a,
          p50: 0x21,
          p90: 0x25,
          max: 0x25,
          mean: 32.317,
        },
        criticalChance: {
          n: 0x29,
          min: 0x1,
          p10: 0x2,
          p50: 0x4,
          p90: 0x5,
          max: 0x5,
          mean: 3.512,
        },
      },
      priceByRoll: [
        {
          skills: { attack: 0x24, criticalChance: 0x4 },
          n: 0x7,
          minPrice: 1.383,
          p10Price: 1.383,
          p50Price: 1.4,
          sampleOfferId: "6a0c77c5ef20adbebd2cfb1a",
        },
        {
          skills: { attack: 0x25, criticalChance: 0x4 },
          n: 0x5,
          minPrice: 1.38,
          p10Price: 1.38,
          p50Price: 1.38,
          sampleOfferId: "6a0c963122e727783b345fe6",
        },
        {
          skills: { attack: 0x22, criticalChance: 0x4 },
          n: 0x3,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.3,
          sampleOfferId: "6a09d488a43a7ca7210f379e",
        },
        {
          skills: { attack: 0x1f, criticalChance: 0x5 },
          n: 0x2,
          minPrice: 1.287,
          p10Price: 1.287,
          p50Price: 1.287,
          sampleOfferId: "6a0be319edd9ab85e71be6e1",
        },
        {
          skills: { attack: 0x23, criticalChance: 0x2 },
          n: 0x2,
          minPrice: 1.287,
          p10Price: 1.287,
          p50Price: 1.287,
          sampleOfferId: "6a0bf0c0402e1cbefde9b0e3",
        },
        {
          skills: { attack: 0x1e, criticalChance: 0x4 },
          n: 0x2,
          minPrice: 1.29,
          p10Price: 1.29,
          p50Price: 1.29,
          sampleOfferId: "6a0b56a8eb47db9b21466ebe",
        },
        {
          skills: { attack: 0x20, criticalChance: 0x4 },
          n: 0x2,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.305,
          sampleOfferId: "6a0a179b085fa6396cd224a7",
        },
        {
          skills: { attack: 0x20, criticalChance: 0x3 },
          n: 0x2,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.323,
          sampleOfferId: "6a0c7f0a385386c1e2835953",
        },
        {
          skills: { attack: 0x1d, criticalChance: 0x3 },
          n: 0x1,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.28,
          sampleOfferId: "6a0cc556c60b8bb4ec146296",
        },
        {
          skills: { attack: 0x1a, criticalChance: 0x2 },
          n: 0x1,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.28,
          sampleOfferId: "6a0cc58e108199b6acc8f3db",
        },
        {
          skills: { attack: 0x19, criticalChance: 0x1 },
          n: 0x1,
          minPrice: 1.282,
          p10Price: 1.282,
          p50Price: 1.282,
          sampleOfferId: "6a0be3d4f3a82d5c05d8d2b3",
        },
        {
          skills: { attack: 0x16, criticalChance: 0x5 },
          n: 0x1,
          minPrice: 1.284,
          p10Price: 1.284,
          p50Price: 1.284,
          sampleOfferId: "6a0b56bfa38e29b6ddb3981a",
        },
        {
          skills: { attack: 0x16, criticalChance: 0x4 },
          n: 0x1,
          minPrice: 1.284,
          p10Price: 1.284,
          p50Price: 1.284,
          sampleOfferId: "6a0c82c312a79ff23740b93e",
        },
        {
          skills: { attack: 0x1a, criticalChance: 0x1 },
          n: 0x1,
          minPrice: 1.287,
          p10Price: 1.287,
          p50Price: 1.287,
          sampleOfferId: "6a0b122950882ed698cefaad",
        },
        {
          skills: { attack: 0x18, criticalChance: 0x1 },
          n: 0x1,
          minPrice: 1.287,
          p10Price: 1.287,
          p50Price: 1.287,
          sampleOfferId: "6a0b3048ace4c38ca0e4017e",
        },
        {
          skills: { attack: 0x25, criticalChance: 0x1 },
          n: 0x1,
          minPrice: 1.287,
          p10Price: 1.287,
          p50Price: 1.287,
          sampleOfferId: "6a0cc0ba69769ff8504307d0",
        },
        {
          skills: { attack: 0x1f, criticalChance: 0x3 },
          n: 0x1,
          minPrice: 1.29,
          p10Price: 1.29,
          p50Price: 1.29,
          sampleOfferId: "6a0c931444c156ae4bebf720",
        },
        {
          skills: { attack: 0x1c, criticalChance: 0x4 },
          n: 0x1,
          minPrice: 1.299,
          p10Price: 1.299,
          p50Price: 1.299,
          sampleOfferId: "6a0a9db858e179906da797b7",
        },
        {
          skills: { attack: 0x1d, criticalChance: 0x5 },
          n: 0x1,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.3,
          sampleOfferId: "6a09c6822881254fe0e89cfe",
        },
        {
          skills: { attack: 0x21, criticalChance: 0x3 },
          n: 0x1,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.3,
          sampleOfferId: "6a09ed0201317866bd177714",
        },
        {
          skills: { attack: 0x20, criticalChance: 0x5 },
          n: 0x1,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.3,
          sampleOfferId: "6a0bd28deb9ecf343ed51aee",
        },
        {
          skills: { attack: 0x23, criticalChance: 0x3 },
          n: 0x1,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.3,
          sampleOfferId: "6a0c8172f50f7e1a0c2fa2a4",
        },
        {
          skills: { attack: 0x21, criticalChance: 0x4 },
          n: 0x1,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.3,
          sampleOfferId: "6a0caccbcb6401ccea1daf23",
        },
        {
          skills: { attack: 0x22, criticalChance: 0x3 },
          n: 0x1,
          minPrice: 1.32,
          p10Price: 1.32,
          p50Price: 1.32,
          sampleOfferId: "6a085c7bf36415ad8b923d9b",
        },
      ],
      offers: [
        {
          id: "6a0cc556c60b8bb4ec146296",
          price: 1.28,
          skills: { attack: 0x1d, criticalChance: 0x3 },
        },
        {
          id: "6a0cc58e108199b6acc8f3db",
          price: 1.28,
          skills: { attack: 0x1a, criticalChance: 0x2 },
        },
        {
          id: "6a0be3d4f3a82d5c05d8d2b3",
          price: 1.282,
          skills: { attack: 0x19, criticalChance: 0x1 },
        },
        {
          id: "6a0b56bfa38e29b6ddb3981a",
          price: 1.284,
          skills: { attack: 0x16, criticalChance: 0x5 },
        },
        {
          id: "6a0c82c312a79ff23740b93e",
          price: 1.284,
          skills: { attack: 0x16, criticalChance: 0x4 },
        },
        {
          id: "6a0b122950882ed698cefaad",
          price: 1.287,
          skills: { attack: 0x1a, criticalChance: 0x1 },
        },
        {
          id: "6a0b3048ace4c38ca0e4017e",
          price: 1.287,
          skills: { attack: 0x18, criticalChance: 0x1 },
        },
        {
          id: "6a0be319edd9ab85e71be6e1",
          price: 1.287,
          skills: { attack: 0x1f, criticalChance: 0x5 },
        },
        {
          id: "6a0bf0c0402e1cbefde9b0e3",
          price: 1.287,
          skills: { attack: 0x23, criticalChance: 0x2 },
        },
        {
          id: "6a0bf0cb0ee509ace19b3411",
          price: 1.287,
          skills: { attack: 0x23, criticalChance: 0x2 },
        },
        {
          id: "6a0c6f65122e7b34da6b7599",
          price: 1.287,
          skills: { attack: 0x1f, criticalChance: 0x5 },
        },
        {
          id: "6a0cc0ba69769ff8504307d0",
          price: 1.287,
          skills: { attack: 0x25, criticalChance: 0x1 },
        },
        {
          id: "6a0b56a8eb47db9b21466ebe",
          price: 1.29,
          skills: { attack: 0x1e, criticalChance: 0x4 },
        },
        {
          id: "6a0c7f183049671deca8d26d",
          price: 1.29,
          skills: { attack: 0x1e, criticalChance: 0x4 },
        },
        {
          id: "6a0c931444c156ae4bebf720",
          price: 1.29,
          skills: { attack: 0x1f, criticalChance: 0x3 },
        },
        {
          id: "6a0a9db858e179906da797b7",
          price: 1.299,
          skills: { attack: 0x1c, criticalChance: 0x4 },
        },
        {
          id: "6a09c6822881254fe0e89cfe",
          price: 1.3,
          skills: { attack: 0x1d, criticalChance: 0x5 },
        },
        {
          id: "6a09d488a43a7ca7210f379e",
          price: 1.3,
          skills: { attack: 0x22, criticalChance: 0x4 },
        },
        {
          id: "6a09ed0201317866bd177714",
          price: 1.3,
          skills: { attack: 0x21, criticalChance: 0x3 },
        },
        {
          id: "6a0a179b085fa6396cd224a7",
          price: 1.3,
          skills: { attack: 0x20, criticalChance: 0x4 },
        },
        {
          id: "6a0bd28deb9ecf343ed51aee",
          price: 1.3,
          skills: { attack: 0x20, criticalChance: 0x5 },
        },
        {
          id: "6a0bf64ed90aa82f58a6d237",
          price: 1.3,
          skills: { attack: 0x22, criticalChance: 0x4 },
        },
        {
          id: "6a0c7f0a385386c1e2835953",
          price: 1.3,
          skills: { attack: 0x20, criticalChance: 0x3 },
        },
        {
          id: "6a0c8172f50f7e1a0c2fa2a4",
          price: 1.3,
          skills: { attack: 0x23, criticalChance: 0x3 },
        },
        {
          id: "6a0caccbcb6401ccea1daf23",
          price: 1.3,
          skills: { attack: 0x21, criticalChance: 0x4 },
        },
        {
          id: "6a09cda8ff59164b50aa8b4c",
          price: 1.305,
          skills: { attack: 0x20, criticalChance: 0x4 },
        },
        {
          id: "6a085c7bf36415ad8b923d9b",
          price: 1.32,
          skills: { attack: 0x22, criticalChance: 0x3 },
        },
        {
          id: "6a0a3075cf22352cb5f74f75",
          price: 1.32,
          skills: { attack: 0x22, criticalChance: 0x4 },
        },
        {
          id: "69fddb8286ef3e947f42be85",
          price: 1.323,
          skills: { attack: 0x20, criticalChance: 0x3 },
        },
        {
          id: "6a0c963122e727783b345fe6",
          price: 1.38,
          skills: { attack: 0x25, criticalChance: 0x4 },
        },
        {
          id: "6a0c963554f591bf4e8fb0d7",
          price: 1.38,
          skills: { attack: 0x25, criticalChance: 0x4 },
        },
        {
          id: "6a0c9639de8f16bec45d4f97",
          price: 1.38,
          skills: { attack: 0x25, criticalChance: 0x4 },
        },
        {
          id: "6a0c77c5ef20adbebd2cfb1a",
          price: 1.383,
          skills: { attack: 0x24, criticalChance: 0x4 },
        },
        {
          id: "6a0aeffbb0bd0010386a7ce5",
          price: 1.4,
          skills: { attack: 0x24, criticalChance: 0x4 },
        },
        {
          id: "6a0c63a3f1ffc55224bea925",
          price: 1.4,
          skills: { attack: 0x24, criticalChance: 0x4 },
        },
        {
          id: "6a0c956540469d638e1177c2",
          price: 1.4,
          skills: { attack: 0x24, criticalChance: 0x4 },
        },
        {
          id: "6a0b07766258156c0aa7a5cb",
          price: 1.45,
          skills: { attack: 0x25, criticalChance: 0x4 },
        },
        {
          id: "6a082fb1c39baf6bea8e050d",
          price: 1.5,
          skills: { attack: 0x24, criticalChance: 0x4 },
        },
        {
          id: "6a082fb879bd7811bcc6267a",
          price: 1.5,
          skills: { attack: 0x24, criticalChance: 0x4 },
        },
        {
          id: "6a0ac3c5d350be12caa21bc1",
          price: 1.5,
          skills: { attack: 0x24, criticalChance: 0x4 },
        },
        {
          id: "6a0ac3d67a8e21007d1b1e5c",
          price: 1.55,
          skills: { attack: 0x25, criticalChance: 0x4 },
        },
      ],
      fetchedAt: "2026-05-19T20:56:02.006Z",
      passesUsed: 0x5,
    },
    gun: {
      n: 0x30,
      price: {
        n: 0x30,
        min: 3.69,
        p10: 3.814,
        p50: 3.828,
        p90: 3.99,
        max: 0x4,
        mean: 3.858,
      },
      skills: {
        attack: {
          n: 0x30,
          min: 0x33,
          p10: 0x35,
          p50: 0x3a,
          p90: 0x3b,
          max: 0x3c,
          mean: 57.063,
        },
        criticalChance: {
          n: 0x30,
          min: 0x6,
          p10: 0x7,
          p50: 0x9,
          p90: 0xa,
          max: 0xa,
          mean: 8.75,
        },
      },
      priceByRoll: [
        {
          skills: { attack: 0x3b, criticalChance: 0xa },
          n: 0xc,
          minPrice: 3.9,
          p10Price: 3.939,
          p50Price: 3.97,
          sampleOfferId: "6a0cbce8690e0fe480bd1996",
        },
        {
          skills: { attack: 0x3a, criticalChance: 0x9 },
          n: 0x5,
          minPrice: 3.82,
          p10Price: 3.82,
          p50Price: 3.83,
          sampleOfferId: "6a0c224dfbe1eeaa62742061",
        },
        {
          skills: { attack: 0x3a, criticalChance: 0xa },
          n: 0x4,
          minPrice: 3.84,
          p10Price: 3.84,
          p50Price: 3.86,
          sampleOfferId: "6a0baf3c8d84a48e7ca7d620",
        },
        {
          skills: { attack: 0x36, criticalChance: 0x9 },
          n: 0x3,
          minPrice: 3.819,
          p10Price: 3.819,
          p50Price: 3.819,
          sampleOfferId: "6a0b3164f692c23a688c34b0",
        },
        {
          skills: { attack: 0x3b, criticalChance: 0x9 },
          n: 0x3,
          minPrice: 3.829,
          p10Price: 3.829,
          p50Price: 3.83,
          sampleOfferId: "6a0c4383332d5dda7572619c",
        },
        {
          skills: { attack: 0x39, criticalChance: 0x7 },
          n: 0x2,
          minPrice: 3.814,
          p10Price: 3.814,
          p50Price: 3.814,
          sampleOfferId: "6a0c407a385386c1e2013b85",
        },
        {
          skills: { attack: 0x39, criticalChance: 0x6 },
          n: 0x2,
          minPrice: 3.814,
          p10Price: 3.814,
          p50Price: 3.814,
          sampleOfferId: "6a0c4092297b921dee13d1af",
        },
        {
          skills: { attack: 0x33, criticalChance: 0x9 },
          n: 0x2,
          minPrice: 3.815,
          p10Price: 3.815,
          p50Price: 3.815,
          sampleOfferId: "6a0c279cae880baa0bd7d52a",
        },
        {
          skills: { attack: 0x3c, criticalChance: 0x8 },
          n: 0x2,
          minPrice: 3.819,
          p10Price: 3.819,
          p50Price: 3.82,
          sampleOfferId: "6a0c4ca61acc9b089e7274d1",
        },
        {
          skills: { attack: 0x38, criticalChance: 0x9 },
          n: 0x2,
          minPrice: 3.823,
          p10Price: 3.823,
          p50Price: 3.83,
          sampleOfferId: "6a0b65da60e45770e646e3f1",
        },
        {
          skills: { attack: 0x35, criticalChance: 0x6 },
          n: 0x1,
          minPrice: 3.69,
          p10Price: 3.69,
          p50Price: 3.69,
          sampleOfferId: "6a0cce64ae0fa0c0e685a36b",
        },
        {
          skills: { attack: 0x39, criticalChance: 0x8 },
          n: 0x1,
          minPrice: 3.814,
          p10Price: 3.814,
          p50Price: 3.814,
          sampleOfferId: "6a0c40cbce82d1aed72faace",
        },
        {
          skills: { attack: 0x39, criticalChance: 0x9 },
          n: 0x1,
          minPrice: 3.814,
          p10Price: 3.814,
          p50Price: 3.814,
          sampleOfferId: "6a0c40d9a928e04202fe74a1",
        },
        {
          skills: { attack: 0x34, criticalChance: 0xa },
          n: 0x1,
          minPrice: 3.815,
          p10Price: 3.815,
          p50Price: 3.815,
          sampleOfferId: "6a0c27bfd164a1cfbf294450",
        },
        {
          skills: { attack: 0x34, criticalChance: 0x6 },
          n: 0x1,
          minPrice: 3.816,
          p10Price: 3.816,
          p50Price: 3.816,
          sampleOfferId: "6a0c37c3332d5dda7553ca02",
        },
        {
          skills: { attack: 0x35, criticalChance: 0x7 },
          n: 0x1,
          minPrice: 3.816,
          p10Price: 3.816,
          p50Price: 3.816,
          sampleOfferId: "6a0c37e7332d5dda7554f3ff",
        },
        {
          skills: { attack: 0x37, criticalChance: 0x7 },
          n: 0x1,
          minPrice: 3.817,
          p10Price: 3.817,
          p50Price: 3.817,
          sampleOfferId: "6a0b7d9188b39978a72b6042",
        },
        {
          skills: { attack: 0x3c, criticalChance: 0x7 },
          n: 0x1,
          minPrice: 3.818,
          p10Price: 3.818,
          p50Price: 3.818,
          sampleOfferId: "6a0cbe88ef20adbebd813021",
        },
        {
          skills: { attack: 0x37, criticalChance: 0x8 },
          n: 0x1,
          minPrice: 3.819,
          p10Price: 3.819,
          p50Price: 3.819,
          sampleOfferId: "6a0c2a001acc9b089e0d3790",
        },
        {
          skills: { attack: 0x3a, criticalChance: 0x7 },
          n: 0x1,
          minPrice: 3.82,
          p10Price: 3.82,
          p50Price: 3.82,
          sampleOfferId: "6a0b240b02790aa725ca90a5",
        },
        {
          skills: { attack: 0x38, criticalChance: 0x8 },
          n: 0x1,
          minPrice: 3.82,
          p10Price: 3.82,
          p50Price: 3.82,
          sampleOfferId: "6a0b83599d1f29338f8980c6",
        },
      ],
      offers: [
        {
          id: "6a0cce64ae0fa0c0e685a36b",
          price: 3.69,
          skills: { attack: 0x35, criticalChance: 0x6 },
        },
        {
          id: "6a0c407a385386c1e2013b85",
          price: 3.814,
          skills: { attack: 0x39, criticalChance: 0x7 },
        },
        {
          id: "6a0c4092297b921dee13d1af",
          price: 3.814,
          skills: { attack: 0x39, criticalChance: 0x6 },
        },
        {
          id: "6a0c409d385386c1e20192d2",
          price: 3.814,
          skills: { attack: 0x39, criticalChance: 0x6 },
        },
        {
          id: "6a0c40adddd9411a1f0ad0fe",
          price: 3.814,
          skills: { attack: 0x39, criticalChance: 0x7 },
        },
        {
          id: "6a0c40cbce82d1aed72faace",
          price: 3.814,
          skills: { attack: 0x39, criticalChance: 0x8 },
        },
        {
          id: "6a0c40d9a928e04202fe74a1",
          price: 3.814,
          skills: { attack: 0x39, criticalChance: 0x9 },
        },
        {
          id: "6a0c279cae880baa0bd7d52a",
          price: 3.815,
          skills: { attack: 0x33, criticalChance: 0x9 },
        },
        {
          id: "6a0c27afef20adbebd6f1dd5",
          price: 3.815,
          skills: { attack: 0x33, criticalChance: 0x9 },
        },
        {
          id: "6a0c27bfd164a1cfbf294450",
          price: 3.815,
          skills: { attack: 0x34, criticalChance: 0xa },
        },
        {
          id: "6a0c37c3332d5dda7553ca02",
          price: 3.816,
          skills: { attack: 0x34, criticalChance: 0x6 },
        },
        {
          id: "6a0c37e7332d5dda7554f3ff",
          price: 3.816,
          skills: { attack: 0x35, criticalChance: 0x7 },
        },
        {
          id: "6a0b7d9188b39978a72b6042",
          price: 3.817,
          skills: { attack: 0x37, criticalChance: 0x7 },
        },
        {
          id: "6a0cbe88ef20adbebd813021",
          price: 3.818,
          skills: { attack: 0x3c, criticalChance: 0x7 },
        },
        {
          id: "6a0b3164f692c23a688c34b0",
          price: 3.819,
          skills: { attack: 0x36, criticalChance: 0x9 },
        },
        {
          id: "6a0c080d6a85c92f53515c0f",
          price: 3.819,
          skills: { attack: 0x36, criticalChance: 0x9 },
        },
        {
          id: "6a0c081f8d84a48e7cbb6c11",
          price: 3.819,
          skills: { attack: 0x36, criticalChance: 0x9 },
        },
        {
          id: "6a0c2a001acc9b089e0d3790",
          price: 3.819,
          skills: { attack: 0x37, criticalChance: 0x8 },
        },
        {
          id: "6a0c4ca61acc9b089e7274d1",
          price: 3.819,
          skills: { attack: 0x3c, criticalChance: 0x8 },
        },
        {
          id: "6a0b240b02790aa725ca90a5",
          price: 3.82,
          skills: { attack: 0x3a, criticalChance: 0x7 },
        },
        {
          id: "6a0b83599d1f29338f8980c6",
          price: 3.82,
          skills: { attack: 0x38, criticalChance: 0x8 },
        },
        {
          id: "6a0c224dfbe1eeaa62742061",
          price: 3.82,
          skills: { attack: 0x3a, criticalChance: 0x9 },
        },
        {
          id: "6a0c3d507410a291d773df54",
          price: 3.82,
          skills: { attack: 0x3c, criticalChance: 0x8 },
        },
        {
          id: "6a0b65da60e45770e646e3f1",
          price: 3.823,
          skills: { attack: 0x38, criticalChance: 0x9 },
        },
        {
          id: "6a0cc6a354b61a5c0944b11f",
          price: 3.828,
          skills: { attack: 0x3a, criticalChance: 0x9 },
        },
        {
          id: "6a0c4383332d5dda7572619c",
          price: 3.829,
          skills: { attack: 0x3b, criticalChance: 0x9 },
        },
        {
          id: "6a0ad705e3dda23acdd17f38",
          price: 3.83,
          skills: { attack: 0x38, criticalChance: 0x9 },
        },
        {
          id: "6a0bff8b0ee509ace1a108e2",
          price: 3.83,
          skills: { attack: 0x3a, criticalChance: 0x9 },
        },
        {
          id: "6a0bffd588b39978a74adb39",
          price: 3.83,
          skills: { attack: 0x3b, criticalChance: 0x9 },
        },
        {
          id: "6a0c89e9240c05c97f26f25a",
          price: 3.83,
          skills: { attack: 0x3b, criticalChance: 0x9 },
        },
        {
          id: "6a0baf3c8d84a48e7ca7d620",
          price: 3.84,
          skills: { attack: 0x3a, criticalChance: 0xa },
        },
        {
          id: "6a0c07ed22d618f6e57f532d",
          price: 3.858,
          skills: { attack: 0x3a, criticalChance: 0x9 },
        },
        {
          id: "6a0c2b25ce82d1aed7f107ba",
          price: 3.86,
          skills: { attack: 0x3a, criticalChance: 0xa },
        },
        {
          id: "6a0cc84095aebd55bf1400de",
          price: 3.86,
          skills: { attack: 0x3a, criticalChance: 0xa },
        },
        {
          id: "69ffe5f9df2bd8f1f3fe1da5",
          price: 3.861,
          skills: { attack: 0x3a, criticalChance: 0x9 },
        },
        {
          id: "6a0a6f0cd9eaf5d5e801ada0",
          price: 3.861,
          skills: { attack: 0x3a, criticalChance: 0xa },
        },
        {
          id: "6a0cbce8690e0fe480bd1996",
          price: 3.9,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a0cc2cef50f7e1a0c768e37",
          price: 3.939,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a0cc2de4ed4e285c73b8fa8",
          price: 3.939,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a0cc2ef256c6c9318151dfc",
          price: 3.939,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a0b711b4cd24f965911ac07",
          price: 3.96,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a0b7125ad526e2a6ead8842",
          price: 3.96,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a02b9e407b9f890b3f48fa5",
          price: 3.97,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a0ca3f7f1ffc55224205737",
          price: 3.99,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a005c0dfa5c8eade8e75562",
          price: 0x4,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a04d6ab1dffde49b6f2eb52",
          price: 0x4,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a075a959993ebdf339a0ee7",
          price: 0x4,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
        {
          id: "6a075a9cd725935b76bd26a7",
          price: 0x4,
          skills: { attack: 0x3b, criticalChance: 0xa },
        },
      ],
      fetchedAt: "2026-05-19T20:56:21.366Z",
      passesUsed: 0x5,
    },
    rifle: {
      n: 0x30,
      price: {
        n: 0x30,
        min: 11.79,
        p10: 11.9,
        p50: 14.495,
        p90: 22.772,
        max: 0x17,
        mean: 15.511,
      },
      skills: {
        attack: {
          n: 0x30,
          min: 0x47,
          p10: 0x49,
          p50: 0x52,
          p90: 0x57,
          max: 0x58,
          mean: 80.688,
        },
        criticalChance: {
          n: 0x30,
          min: 0xb,
          p10: 0xc,
          p50: 0xd,
          p90: 0xe,
          max: 0xe,
          mean: 13.125,
        },
      },
      priceByRoll: [
        {
          skills: { attack: 0x57, criticalChance: 0xe },
          n: 0x7,
          minPrice: 21.75,
          p10Price: 21.75,
          p50Price: 22.772,
          sampleOfferId: "6a0ca51142c3954108d5673d",
        },
        {
          skills: { attack: 0x52, criticalChance: 0xd },
          n: 0x5,
          minPrice: 14.495,
          p10Price: 14.495,
          p50Price: 14.8,
          sampleOfferId: "6a0ccdd9f0b60a4260e4247f",
        },
        {
          skills: { attack: 0x4e, criticalChance: 0xe },
          n: 0x4,
          minPrice: 12.4,
          p10Price: 12.4,
          p50Price: 12.45,
          sampleOfferId: "6a0ca8bef50f7e1a0c61b5e7",
        },
        {
          skills: { attack: 0x53, criticalChance: 0xd },
          n: 0x4,
          minPrice: 14.99,
          p10Price: 14.99,
          p50Price: 15.99,
          sampleOfferId: "6a0cc203662a45b4912660b8",
        },
        {
          skills: { attack: 0x4e, criticalChance: 0xd },
          n: 0x3,
          minPrice: 0xc,
          p10Price: 0xc,
          p50Price: 12.2,
          sampleOfferId: "6a0cbea48a830ebf7667af3a",
        },
        {
          skills: { attack: 0x52, criticalChance: 0xe },
          n: 0x3,
          minPrice: 15.999,
          p10Price: 15.999,
          p50Price: 0x10,
          sampleOfferId: "6a0cb7f5000753ef3ee9a307",
        },
        {
          skills: { attack: 0x56, criticalChance: 0xe },
          n: 0x3,
          minPrice: 21.68,
          p10Price: 21.68,
          p50Price: 21.78,
          sampleOfferId: "6a0c4e403049671dec4c5bb7",
        },
        {
          skills: { attack: 0x4a, criticalChance: 0xc },
          n: 0x2,
          minPrice: 11.79,
          p10Price: 11.79,
          p50Price: 11.9,
          sampleOfferId: "6a0cbe99218a2fe5f0ac5d1c",
        },
        {
          skills: { attack: 0x49, criticalChance: 0xd },
          n: 0x2,
          minPrice: 11.881,
          p10Price: 11.881,
          p50Price: 0xc,
          sampleOfferId: "6a0cc57acb6401ccea2ee553",
        },
        {
          skills: { attack: 0x53, criticalChance: 0xc },
          n: 0x2,
          minPrice: 12.3,
          p10Price: 12.3,
          p50Price: 12.4,
          sampleOfferId: "6a0cbb49c5fa963059f8eeec",
        },
        {
          skills: { attack: 0x58, criticalChance: 0xe },
          n: 0x2,
          minPrice: 22.99,
          p10Price: 22.99,
          p50Price: 0x17,
          sampleOfferId: "6a0cc0a83049671decfb6274",
        },
        {
          skills: { attack: 0x49, criticalChance: 0xb },
          n: 0x1,
          minPrice: 11.8,
          p10Price: 11.8,
          p50Price: 11.8,
          sampleOfferId: "6a0cbe40cb6401ccea2b6000",
        },
        {
          skills: { attack: 0x4d, criticalChance: 0xc },
          n: 0x1,
          minPrice: 11.891,
          p10Price: 11.891,
          p50Price: 11.891,
          sampleOfferId: "6a0ccd4777ca45b457b9f38e",
        },
        {
          skills: { attack: 0x47, criticalChance: 0xb },
          n: 0x1,
          minPrice: 11.9,
          p10Price: 11.9,
          p50Price: 11.9,
          sampleOfferId: "6a0cbafd59dc7bdd6fd03286",
        },
        {
          skills: { attack: 0x47, criticalChance: 0xd },
          n: 0x1,
          minPrice: 11.9,
          p10Price: 11.9,
          p50Price: 11.9,
          sampleOfferId: "6a0cbb5dc5fa963059f95023",
        },
        {
          skills: { attack: 0x4b, criticalChance: 0xd },
          n: 0x1,
          minPrice: 11.9,
          p10Price: 11.9,
          p50Price: 11.9,
          sampleOfferId: "6a0cbd344ed4e285c737d2dd",
        },
        {
          skills: { attack: 0x4d, criticalChance: 0xd },
          n: 0x1,
          minPrice: 11.9,
          p10Price: 11.9,
          p50Price: 11.9,
          sampleOfferId: "6a0cc827e3a8d77b22060b10",
        },
        {
          skills: { attack: 0x4e, criticalChance: 0xb },
          n: 0x1,
          minPrice: 11.99,
          p10Price: 11.99,
          p50Price: 11.99,
          sampleOfferId: "6a0cc22e218a2fe5f0ae0c45",
        },
        {
          skills: { attack: 0x4a, criticalChance: 0xe },
          n: 0x1,
          minPrice: 11.99,
          p10Price: 11.99,
          p50Price: 11.99,
          sampleOfferId: "6a0cc238218a2fe5f0ae2c64",
        },
        {
          skills: { attack: 0x51, criticalChance: 0xc },
          n: 0x1,
          minPrice: 0xc,
          p10Price: 0xc,
          p50Price: 0xc,
          sampleOfferId: "6a0cc53a3d84306856101664",
        },
        {
          skills: { attack: 0x50, criticalChance: 0xc },
          n: 0x1,
          minPrice: 12.2,
          p10Price: 12.2,
          p50Price: 12.2,
          sampleOfferId: "6a0cc25f9d22488fe5065d67",
        },
        {
          skills: { attack: 0x4f, criticalChance: 0xc },
          n: 0x1,
          minPrice: 12.35,
          p10Price: 12.35,
          p50Price: 12.35,
          sampleOfferId: "6a0c9405232be789f17e5c6d",
        },
      ],
      offers: [
        {
          id: "6a0cbe99218a2fe5f0ac5d1c",
          price: 11.79,
          skills: { attack: 0x4a, criticalChance: 0xc },
        },
        {
          id: "6a0cbe40cb6401ccea2b6000",
          price: 11.8,
          skills: { attack: 0x49, criticalChance: 0xb },
        },
        {
          id: "6a0cc57acb6401ccea2ee553",
          price: 11.881,
          skills: { attack: 0x49, criticalChance: 0xd },
        },
        {
          id: "6a0ccd4777ca45b457b9f38e",
          price: 11.891,
          skills: { attack: 0x4d, criticalChance: 0xc },
        },
        {
          id: "6a0cbafd59dc7bdd6fd03286",
          price: 11.9,
          skills: { attack: 0x47, criticalChance: 0xb },
        },
        {
          id: "6a0cbb05505754d69a4e203d",
          price: 11.9,
          skills: { attack: 0x4a, criticalChance: 0xc },
        },
        {
          id: "6a0cbb5dc5fa963059f95023",
          price: 11.9,
          skills: { attack: 0x47, criticalChance: 0xd },
        },
        {
          id: "6a0cbd344ed4e285c737d2dd",
          price: 11.9,
          skills: { attack: 0x4b, criticalChance: 0xd },
        },
        {
          id: "6a0cc827e3a8d77b22060b10",
          price: 11.9,
          skills: { attack: 0x4d, criticalChance: 0xd },
        },
        {
          id: "6a0cc22e218a2fe5f0ae0c45",
          price: 11.99,
          skills: { attack: 0x4e, criticalChance: 0xb },
        },
        {
          id: "6a0cc238218a2fe5f0ae2c64",
          price: 11.99,
          skills: { attack: 0x4a, criticalChance: 0xe },
        },
        {
          id: "6a0c9c9114c0a61282a85c17",
          price: 0xc,
          skills: { attack: 0x49, criticalChance: 0xd },
        },
        {
          id: "6a0cbea48a830ebf7667af3a",
          price: 0xc,
          skills: { attack: 0x4e, criticalChance: 0xd },
        },
        {
          id: "6a0cc53a3d84306856101664",
          price: 0xc,
          skills: { attack: 0x51, criticalChance: 0xc },
        },
        {
          id: "6a0c894a40469d638e008284",
          price: 12.2,
          skills: { attack: 0x4e, criticalChance: 0xd },
        },
        {
          id: "6a0cc25f9d22488fe5065d67",
          price: 12.2,
          skills: { attack: 0x50, criticalChance: 0xc },
        },
        {
          id: "6a0cbb49c5fa963059f8eeec",
          price: 12.3,
          skills: { attack: 0x53, criticalChance: 0xc },
        },
        {
          id: "6a0c9405232be789f17e5c6d",
          price: 12.35,
          skills: { attack: 0x4f, criticalChance: 0xc },
        },
        {
          id: "6a0894e6f557fc81fbb8cc6b",
          price: 12.398,
          skills: { attack: 0x4e, criticalChance: 0xd },
        },
        {
          id: "6a0c8a51122e7b34da7d650d",
          price: 12.4,
          skills: { attack: 0x53, criticalChance: 0xc },
        },
        {
          id: "6a0ca8bef50f7e1a0c61b5e7",
          price: 12.4,
          skills: { attack: 0x4e, criticalChance: 0xe },
        },
        {
          id: "6a0ca4faa0cb19947a638222",
          price: 12.448,
          skills: { attack: 0x4e, criticalChance: 0xe },
        },
        {
          id: "6a0ca0cda928e04202b2cf82",
          price: 12.45,
          skills: { attack: 0x4e, criticalChance: 0xe },
        },
        {
          id: "6a0ca282662a45b491056005",
          price: 12.46,
          skills: { attack: 0x4e, criticalChance: 0xe },
        },
        {
          id: "6a0ccdd9f0b60a4260e4247f",
          price: 14.495,
          skills: { attack: 0x52, criticalChance: 0xd },
        },
        {
          id: "6a0cc68b54b61a5c09443659",
          price: 14.5,
          skills: { attack: 0x52, criticalChance: 0xd },
        },
        {
          id: "6a0cc2b942c3954108f3b37c",
          price: 14.8,
          skills: { attack: 0x52, criticalChance: 0xd },
        },
        {
          id: "6a0cc203662a45b4912660b8",
          price: 14.99,
          skills: { attack: 0x53, criticalChance: 0xd },
        },
        {
          id: "6a0cbba2576934a15609dea7",
          price: 0xf,
          skills: { attack: 0x53, criticalChance: 0xd },
        },
        {
          id: "6a0cbb195671c3f647df400e",
          price: 15.8,
          skills: { attack: 0x52, criticalChance: 0xd },
        },
        {
          id: "6a0c9a01809396aab5e375a4",
          price: 15.9,
          skills: { attack: 0x52, criticalChance: 0xd },
        },
        {
          id: "6a0c48d6576934a15653474c",
          price: 15.99,
          skills: { attack: 0x53, criticalChance: 0xd },
        },
        {
          id: "6a0c48da54f591bf4e0792a2",
          price: 15.99,
          skills: { attack: 0x53, criticalChance: 0xd },
        },
        {
          id: "6a0cb7f5000753ef3ee9a307",
          price: 15.999,
          skills: { attack: 0x52, criticalChance: 0xe },
        },
        {
          id: "6a0c9b1d3fd37b4c0bd88c27",
          price: 0x10,
          skills: { attack: 0x52, criticalChance: 0xe },
        },
        {
          id: "6a0c6ea5223c697421cd5474",
          price: 16.1,
          skills: { attack: 0x52, criticalChance: 0xe },
        },
        {
          id: "6a0c4e403049671dec4c5bb7",
          price: 21.68,
          skills: { attack: 0x56, criticalChance: 0xe },
        },
        {
          id: "6a0ca51142c3954108d5673d",
          price: 21.75,
          skills: { attack: 0x57, criticalChance: 0xe },
        },
        {
          id: "6a0b63eec3823f4ee471b6e4",
          price: 21.78,
          skills: { attack: 0x56, criticalChance: 0xe },
        },
        {
          id: "6a0cce76a69e75061358960e",
          price: 21.782,
          skills: { attack: 0x57, criticalChance: 0xe },
        },
        {
          id: "6a0be38ee99b20ccf3c0415b",
          price: 21.988,
          skills: { attack: 0x56, criticalChance: 0xe },
        },
        {
          id: "6a0b352cddf69007267b6e04",
          price: 0x16,
          skills: { attack: 0x57, criticalChance: 0xe },
        },
        {
          id: "6a0a62c52881254fe024dcd3",
          price: 22.772,
          skills: { attack: 0x57, criticalChance: 0xe },
        },
        {
          id: "6a0a62cfff59164b50ee9c35",
          price: 22.772,
          skills: { attack: 0x57, criticalChance: 0xe },
        },
        {
          id: "6a0a5651baa118bd290b0f06",
          price: 22.989,
          skills: { attack: 0x57, criticalChance: 0xe },
        },
        {
          id: "6a0cc0a83049671decfb6274",
          price: 22.99,
          skills: { attack: 0x58, criticalChance: 0xe },
        },
        {
          id: "6a0a3b9a2d2872ef553b16d2",
          price: 0x17,
          skills: { attack: 0x57, criticalChance: 0xe },
        },
        {
          id: "6a0cce5095aebd55bf15de51",
          price: 0x17,
          skills: { attack: 0x58, criticalChance: 0xe },
        },
      ],
      fetchedAt: "2026-05-19T20:56:39.377Z",
      passesUsed: 0x5,
    },
    sniper: {
      n: 0x3c,
      price: {
        n: 0x3c,
        min: 0x26,
        p10: 38.7,
        p50: 50.79,
        p90: 0x43,
        max: 0x45,
        mean: 51.487,
      },
      skills: {
        attack: {
          n: 0x3c,
          min: 0x65,
          p10: 0x6c,
          p50: 0x75,
          p90: 0x80,
          max: 0x80,
          mean: 116.833,
        },
        criticalChance: {
          n: 0x3c,
          min: 0x10,
          p10: 0x11,
          p50: 0x13,
          p90: 0x14,
          max: 0x14,
          mean: 18.783,
        },
      },
      priceByRoll: [
        {
          skills: { attack: 0x75, criticalChance: 0x13 },
          n: 0x6,
          minPrice: 49.45,
          p10Price: 49.45,
          p50Price: 50.79,
          sampleOfferId: "6a0c80f554f591bf4e7625de",
        },
        {
          skills: { attack: 0x7a, criticalChance: 0x14 },
          n: 0x6,
          minPrice: 59.97,
          p10Price: 59.97,
          p50Price: 59.98,
          sampleOfferId: "6a0c5432de8f16bec4f3fcb6",
        },
        {
          skills: { attack: 0x7b, criticalChance: 0x14 },
          n: 0x6,
          minPrice: 60.849,
          p10Price: 60.849,
          p50Price: 61.359,
          sampleOfferId: "6a0cb0aaef20adbebd7814c7",
        },
        {
          skills: { attack: 0x7f, criticalChance: 0x14 },
          n: 0x6,
          minPrice: 0x41,
          p10Price: 0x41,
          p50Price: 0x43,
          sampleOfferId: "6a0cc2272038bc67f6f91737",
        },
        {
          skills: { attack: 0x80, criticalChance: 0x14 },
          n: 0x6,
          minPrice: 0x43,
          p10Price: 0x43,
          p50Price: 68.998,
          sampleOfferId: "6a0c964554f591bf4e8fb765",
        },
        {
          skills: { attack: 0x6e, criticalChance: 0x12 },
          n: 0x5,
          minPrice: 0x27,
          p10Price: 0x27,
          p50Price: 40.97,
          sampleOfferId: "6a0c96c1de8f16bec45e206c",
        },
        {
          skills: { attack: 0x70, criticalChance: 0x12 },
          n: 0x4,
          minPrice: 0x28,
          p10Price: 0x28,
          p50Price: 0x28,
          sampleOfferId: "6a0c7a64d1c0c3cba704cc10",
        },
        {
          skills: { attack: 0x74, criticalChance: 0x13 },
          n: 0x3,
          minPrice: 47.989,
          p10Price: 47.989,
          p50Price: 47.999,
          sampleOfferId: "6a0c764159dc7bdd6f82d59c",
        },
        {
          skills: { attack: 0x67, criticalChance: 0x11 },
          n: 0x2,
          minPrice: 0x26,
          p10Price: 0x26,
          p50Price: 0x26,
          sampleOfferId: "6a0cbb4fef20adbebd80234c",
        },
        {
          skills: { attack: 0x66, criticalChance: 0x10 },
          n: 0x2,
          minPrice: 38.599,
          p10Price: 38.599,
          p50Price: 38.7,
          sampleOfferId: "6a0cab6d000753ef3edc631e",
        },
        {
          skills: { attack: 0x6d, criticalChance: 0x11 },
          n: 0x2,
          minPrice: 38.7,
          p10Price: 38.7,
          p50Price: 38.911,
          sampleOfferId: "6a0cbf287c540e3a2515e598",
        },
        {
          skills: { attack: 0x6f, criticalChance: 0x12 },
          n: 0x2,
          minPrice: 39.899,
          p10Price: 39.899,
          p50Price: 41.799,
          sampleOfferId: "6a0c8f61ede0e7856a061a00",
        },
        {
          skills: { attack: 0x76, criticalChance: 0x13 },
          n: 0x2,
          minPrice: 51.398,
          p10Price: 51.398,
          p50Price: 51.398,
          sampleOfferId: "6a0cb891ae880baa0bed6f6f",
        },
        {
          skills: { attack: 0x65, criticalChance: 0x12 },
          n: 0x1,
          minPrice: 38.6,
          p10Price: 38.6,
          p50Price: 38.6,
          sampleOfferId: "6a0c8ed9c59101a5601efd31",
        },
        {
          skills: { attack: 0x6d, criticalChance: 0x10 },
          n: 0x1,
          minPrice: 38.7,
          p10Price: 38.7,
          p50Price: 38.7,
          sampleOfferId: "6a0cb8c522e727783b62bb01",
        },
        {
          skills: { attack: 0x6c, criticalChance: 0x11 },
          n: 0x1,
          minPrice: 38.899,
          p10Price: 38.899,
          p50Price: 38.899,
          sampleOfferId: "6a0cabfa3687d472c20861bb",
        },
        {
          skills: { attack: 0x6e, criticalChance: 0x11 },
          n: 0x1,
          minPrice: 38.9,
          p10Price: 38.9,
          p50Price: 38.9,
          sampleOfferId: "6a0cce866e19d378d4991ef3",
        },
        {
          skills: { attack: 0x6c, criticalChance: 0x12 },
          n: 0x1,
          minPrice: 38.94,
          p10Price: 38.94,
          p50Price: 38.94,
          sampleOfferId: "6a0cc07c1c81298e4a5ae9cf",
        },
        {
          skills: { attack: 0x6f, criticalChance: 0x10 },
          n: 0x1,
          minPrice: 38.98,
          p10Price: 38.98,
          p50Price: 38.98,
          sampleOfferId: "6a0cab78c5fa963059e831aa",
        },
        {
          skills: { attack: 0x71, criticalChance: 0x12 },
          n: 0x1,
          minPrice: 40.9,
          p10Price: 40.9,
          p50Price: 40.9,
          sampleOfferId: "6a0b7190e091457aed5e3492",
        },
        {
          skills: { attack: 0x74, criticalChance: 0x14 },
          n: 0x1,
          minPrice: 50.98,
          p10Price: 50.98,
          p50Price: 50.98,
          sampleOfferId: "6a0c42787410a291d787bb6d",
        },
      ],
      offers: [
        {
          id: "6a0cbb4fef20adbebd80234c",
          price: 0x26,
          skills: { attack: 0x67, criticalChance: 0x11 },
        },
        {
          id: "6a0cc7e1a143bc2223186962",
          price: 0x26,
          skills: { attack: 0x67, criticalChance: 0x11 },
        },
        {
          id: "6a0cab6d000753ef3edc631e",
          price: 38.599,
          skills: { attack: 0x66, criticalChance: 0x10 },
        },
        {
          id: "6a0c8ed9c59101a5601efd31",
          price: 38.6,
          skills: { attack: 0x65, criticalChance: 0x12 },
        },
        {
          id: "6a0c83c25671c3f6479b770e",
          price: 38.7,
          skills: { attack: 0x66, criticalChance: 0x10 },
        },
        {
          id: "6a0cb8c522e727783b62bb01",
          price: 38.7,
          skills: { attack: 0x6d, criticalChance: 0x10 },
        },
        {
          id: "6a0cbf287c540e3a2515e598",
          price: 38.7,
          skills: { attack: 0x6d, criticalChance: 0x11 },
        },
        {
          id: "6a0cabfa3687d472c20861bb",
          price: 38.899,
          skills: { attack: 0x6c, criticalChance: 0x11 },
        },
        {
          id: "6a0cce866e19d378d4991ef3",
          price: 38.9,
          skills: { attack: 0x6e, criticalChance: 0x11 },
        },
        {
          id: "6a0cabe7be10f3a837eb37a7",
          price: 38.911,
          skills: { attack: 0x6d, criticalChance: 0x11 },
        },
        {
          id: "6a0cc07c1c81298e4a5ae9cf",
          price: 38.94,
          skills: { attack: 0x6c, criticalChance: 0x12 },
        },
        {
          id: "6a0cab78c5fa963059e831aa",
          price: 38.98,
          skills: { attack: 0x6f, criticalChance: 0x10 },
        },
        {
          id: "6a0c96c1de8f16bec45e206c",
          price: 0x27,
          skills: { attack: 0x6e, criticalChance: 0x12 },
        },
        {
          id: "6a0c8f61ede0e7856a061a00",
          price: 39.899,
          skills: { attack: 0x6f, criticalChance: 0x12 },
        },
        {
          id: "6a0c7a64d1c0c3cba704cc10",
          price: 0x28,
          skills: { attack: 0x70, criticalChance: 0x12 },
        },
        {
          id: "6a0c7a6b37311e064dc8450c",
          price: 0x28,
          skills: { attack: 0x70, criticalChance: 0x12 },
        },
        {
          id: "6a0c7d0a223c697421d686c8",
          price: 0x28,
          skills: { attack: 0x70, criticalChance: 0x12 },
        },
        {
          id: "6a0bc7740aec4d1065320c28",
          price: 40.7,
          skills: { attack: 0x6e, criticalChance: 0x12 },
        },
        {
          id: "6a0b7190e091457aed5e3492",
          price: 40.9,
          skills: { attack: 0x71, criticalChance: 0x12 },
        },
        {
          id: "6a0b719f5ed78df2c2d72dcc",
          price: 40.9,
          skills: { attack: 0x70, criticalChance: 0x12 },
        },
        {
          id: "6a0b0661427f90f99100ab5a",
          price: 40.97,
          skills: { attack: 0x6e, criticalChance: 0x12 },
        },
        {
          id: "6a0a03e15ff9ce41ee0a9576",
          price: 0x29,
          skills: { attack: 0x6e, criticalChance: 0x12 },
        },
        {
          id: "6a08f862470ee144a13fd393",
          price: 41.584,
          skills: { attack: 0x6e, criticalChance: 0x12 },
        },
        {
          id: "6a0b0e0d47de864ce443e94d",
          price: 41.799,
          skills: { attack: 0x6f, criticalChance: 0x12 },
        },
        {
          id: "6a0c764159dc7bdd6f82d59c",
          price: 47.989,
          skills: { attack: 0x74, criticalChance: 0x13 },
        },
        {
          id: "6a0c41c954f591bf4eec317e",
          price: 47.999,
          skills: { attack: 0x74, criticalChance: 0x13 },
        },
        {
          id: "6a0b7b9a60e45770e653cf76",
          price: 48.514,
          skills: { attack: 0x74, criticalChance: 0x13 },
        },
        {
          id: "6a0c80f554f591bf4e7625de",
          price: 49.45,
          skills: { attack: 0x75, criticalChance: 0x13 },
        },
        {
          id: "6a0b90efc6073b597f48d713",
          price: 49.505,
          skills: { attack: 0x75, criticalChance: 0x13 },
        },
        {
          id: "6a0b6581e091457aed55cd60",
          price: 0x32,
          skills: { attack: 0x75, criticalChance: 0x13 },
        },
        {
          id: "6a0b371df855bff3c34cb7f8",
          price: 50.79,
          skills: { attack: 0x75, criticalChance: 0x13 },
        },
        {
          id: "6a0c42787410a291d787bb6d",
          price: 50.98,
          skills: { attack: 0x74, criticalChance: 0x14 },
        },
        {
          id: "6a0aa4e2ad94f7bd4c14af94",
          price: 0x33,
          skills: { attack: 0x75, criticalChance: 0x13 },
        },
        {
          id: "6a0b1ff723767bb2ae92912f",
          price: 0x33,
          skills: { attack: 0x75, criticalChance: 0x13 },
        },
        {
          id: "6a0cb891ae880baa0bed6f6f",
          price: 51.398,
          skills: { attack: 0x76, criticalChance: 0x13 },
        },
        {
          id: "6a0cb8ea22e727783b62c0b6",
          price: 51.398,
          skills: { attack: 0x76, criticalChance: 0x13 },
        },
        {
          id: "6a0c5432de8f16bec4f3fcb6",
          price: 59.97,
          skills: { attack: 0x7a, criticalChance: 0x14 },
        },
        {
          id: "6a0c543742c39541085bffbd",
          price: 59.97,
          skills: { attack: 0x7a, criticalChance: 0x14 },
        },
        {
          id: "6a0c543c7410a291d7b44230",
          price: 59.97,
          skills: { attack: 0x7a, criticalChance: 0x14 },
        },
        {
          id: "6a0bf3f6fce09fd63ab7029f",
          price: 59.98,
          skills: { attack: 0x7a, criticalChance: 0x14 },
        },
        {
          id: "6a0bfc50c6073b597f62cfb3",
          price: 0x3c,
          skills: { attack: 0x7a, criticalChance: 0x14 },
        },
        {
          id: "6a0c13f3acff46ba09ab1527",
          price: 0x3c,
          skills: { attack: 0x7a, criticalChance: 0x14 },
        },
        {
          id: "6a0cb0aaef20adbebd7814c7",
          price: 60.849,
          skills: { attack: 0x7b, criticalChance: 0x14 },
        },
        {
          id: "6a0c72323fd37b4c0bb1e111",
          price: 60.85,
          skills: { attack: 0x7b, criticalChance: 0x14 },
        },
        {
          id: "6a0c54051acc9b089e803ba2",
          price: 61.359,
          skills: { attack: 0x7b, criticalChance: 0x14 },
        },
        {
          id: "6a0c540ed164a1cfbfaa4890",
          price: 61.359,
          skills: { attack: 0x7b, criticalChance: 0x14 },
        },
        {
          id: "6a0c441942c395410830802c",
          price: 61.36,
          skills: { attack: 0x7b, criticalChance: 0x14 },
        },
        {
          id: "6a0c441d576934a15640cdb8",
          price: 61.36,
          skills: { attack: 0x7b, criticalChance: 0x14 },
        },
        {
          id: "6a0cc2272038bc67f6f91737",
          price: 0x41,
          skills: { attack: 0x7f, criticalChance: 0x14 },
        },
        {
          id: "6a0c8dac3049671decbd1924",
          price: 66.898,
          skills: { attack: 0x7f, criticalChance: 0x14 },
        },
        {
          id: "6a0c450fddd9411a1f1717fa",
          price: 66.899,
          skills: { attack: 0x7f, criticalChance: 0x14 },
        },
        {
          id: "6a0b37a28f5d7a3480b3140c",
          price: 0x43,
          skills: { attack: 0x7f, criticalChance: 0x14 },
        },
        {
          id: "6a0c2ba7ef20adbebd7bc2af",
          price: 0x43,
          skills: { attack: 0x7f, criticalChance: 0x14 },
        },
        {
          id: "6a0c964554f591bf4e8fb765",
          price: 0x43,
          skills: { attack: 0x80, criticalChance: 0x14 },
        },
        {
          id: "6a0cb04154f591bf4ebab48b",
          price: 0x43,
          skills: { attack: 0x7f, criticalChance: 0x14 },
        },
        {
          id: "6a0c8395662a45b491dcfa7a",
          price: 68.849,
          skills: { attack: 0x80, criticalChance: 0x14 },
        },
        {
          id: "6a0c724ad1c0c3cba7fcadf4",
          price: 68.85,
          skills: { attack: 0x80, criticalChance: 0x14 },
        },
        {
          id: "6a0c5b8c3049671dec6671d2",
          price: 68.998,
          skills: { attack: 0x80, criticalChance: 0x14 },
        },
        {
          id: "6a0c5b3d1acc9b089e8d1d5c",
          price: 68.999,
          skills: { attack: 0x80, criticalChance: 0x14 },
        },
        {
          id: "6a0c14feb3469219a10a1326",
          price: 0x45,
          skills: { attack: 0x80, criticalChance: 0x14 },
        },
      ],
      fetchedAt: "2026-05-19T20:56:58.856Z",
      passesUsed: 0x5,
    },
    tank: {
      n: 0x34,
      price: {
        n: 0x34,
        min: 0x90,
        p10: 0x93,
        p50: 155.6,
        p90: 221.5,
        max: 257.477,
        mean: 172.079,
      },
      skills: {
        attack: {
          n: 0x34,
          min: 0x92,
          p10: 0x95,
          p50: 0x9d,
          p90: 0xa8,
          max: 0xaa,
          mean: 157.577,
        },
        criticalChance: {
          n: 0x34,
          min: 0x1a,
          p10: 0x1c,
          p50: 0x20,
          p90: 0x23,
          max: 0x23,
          mean: 31.673,
        },
      },
      priceByRoll: [
        {
          skills: { attack: 0xa8, criticalChance: 0x23 },
          n: 0x3,
          minPrice: 0xd2,
          p10Price: 0xd2,
          p50Price: 221.5,
          sampleOfferId: "6a0cad7659dc7bdd6fc48a35",
        },
        {
          skills: { attack: 0x9e, criticalChance: 0x1a },
          n: 0x2,
          minPrice: 0x91,
          p10Price: 0x91,
          p50Price: 0x91,
          sampleOfferId: "6a0cc65f73ff458c4f396cd8",
        },
        {
          skills: { attack: 0x9c, criticalChance: 0x1d },
          n: 0x2,
          minPrice: 147.999,
          p10Price: 147.999,
          p50Price: 0x96,
          sampleOfferId: "6a0bdb5fdcbdd8850092807f",
        },
        {
          skills: { attack: 0x95, criticalChance: 0x20 },
          n: 0x2,
          minPrice: 0x94,
          p10Price: 0x94,
          p50Price: 0x96,
          sampleOfferId: "6a0cb0b914c0a61282c3eacc",
        },
        {
          skills: { attack: 0x96, criticalChance: 0x1f },
          n: 0x2,
          minPrice: 0x95,
          p10Price: 0x95,
          p50Price: 0x96,
          sampleOfferId: "6a0c26ac332d5dda7516eed5",
        },
        {
          skills: { attack: 0x99, criticalChance: 0x1f },
          n: 0x2,
          minPrice: 0x96,
          p10Price: 0x96,
          p50Price: 155.6,
          sampleOfferId: "6a0c18363049671decc61b96",
        },
        {
          skills: { attack: 0x9a, criticalChance: 0x1f },
          n: 0x2,
          minPrice: 0x98,
          p10Price: 0x98,
          p50Price: 155.4,
          sampleOfferId: "6a0b74b8edd9ab85e7fe24d0",
        },
        {
          skills: { attack: 0x9d, criticalChance: 0x1f },
          n: 0x2,
          minPrice: 0x9b,
          p10Price: 0x9b,
          p50Price: 0x9d,
          sampleOfferId: "6a0c8a94000753ef3ea82b6c",
        },
        {
          skills: { attack: 0x99, criticalChance: 0x22 },
          n: 0x2,
          minPrice: 0x9e,
          p10Price: 0x9e,
          p50Price: 159.999,
          sampleOfferId: "6a0c43c70450530a9a79c024",
        },
        {
          skills: { attack: 0xa2, criticalChance: 0x21 },
          n: 0x2,
          minPrice: 186.999,
          p10Price: 186.999,
          p50Price: 0xbe,
          sampleOfferId: "69f5daeef9c8bdb2934f0d87",
        },
        {
          skills: { attack: 0xa2, criticalChance: 0x22 },
          n: 0x2,
          minPrice: 194.996,
          p10Price: 194.996,
          p50Price: 0xc3,
          sampleOfferId: "6a0741f6210b031e3c57202e",
        },
        {
          skills: { attack: 0xa9, criticalChance: 0x23 },
          n: 0x2,
          minPrice: 219.9,
          p10Price: 219.9,
          p50Price: 0xe9,
          sampleOfferId: "6a0b0ca47a8e21007d372193",
        },
        {
          skills: { attack: 0xa7, criticalChance: 0x23 },
          n: 0x2,
          minPrice: 0xdf,
          p10Price: 0xdf,
          p50Price: 228.7,
          sampleOfferId: "69f53fddf9c8bdb293ca5753",
        },
        {
          skills: { attack: 0x92, criticalChance: 0x1e },
          n: 0x1,
          minPrice: 0x90,
          p10Price: 0x90,
          p50Price: 0x90,
          sampleOfferId: "6a0cbc4c14c0a61282ca09de",
        },
        {
          skills: { attack: 0x98, criticalChance: 0x1b },
          n: 0x1,
          minPrice: 0x90,
          p10Price: 0x90,
          p50Price: 0x90,
          sampleOfferId: "6a0cc5ed3e4f52241e4d9097",
        },
        {
          skills: { attack: 0x9d, criticalChance: 0x1a },
          n: 0x1,
          minPrice: 144.5,
          p10Price: 144.5,
          p50Price: 144.5,
          sampleOfferId: "6a0cc60795aebd55bf120a74",
        },
        {
          skills: { attack: 0x95, criticalChance: 0x1c },
          n: 0x1,
          minPrice: 0x93,
          p10Price: 0x93,
          p50Price: 0x93,
          sampleOfferId: "6a0cb770ea6f64b76769a02e",
        },
        {
          skills: { attack: 0x9a, criticalChance: 0x1d },
          n: 0x1,
          minPrice: 147.99,
          p10Price: 147.99,
          p50Price: 147.99,
          sampleOfferId: "6a0be2adc96112bc2bc5ab5d",
        },
        {
          skills: { attack: 0x92, criticalChance: 0x1f },
          n: 0x1,
          minPrice: 147.99,
          p10Price: 147.99,
          p50Price: 147.99,
          sampleOfferId: "6a0cc29d122e7b34dabee39b",
        },
        {
          skills: { attack: 0x9f, criticalChance: 0x1b },
          n: 0x1,
          minPrice: 147.999,
          p10Price: 147.999,
          p50Price: 147.999,
          sampleOfferId: "6a0bd90c60e45770e66caf52",
        },
        {
          skills: { attack: 0x93, criticalChance: 0x1e },
          n: 0x1,
          minPrice: 0x94,
          p10Price: 0x94,
          p50Price: 0x94,
          sampleOfferId: "6a0b025587ed532c2dd97456",
        },
        {
          skills: { attack: 0x97, criticalChance: 0x1e },
          n: 0x1,
          minPrice: 0x94,
          p10Price: 0x94,
          p50Price: 0x94,
          sampleOfferId: "6a0c7e4f59dc7bdd6f881bf0",
        },
        {
          skills: { attack: 0x9d, criticalChance: 0x1d },
          n: 0x1,
          minPrice: 0x96,
          p10Price: 0x96,
          p50Price: 0x96,
          sampleOfferId: "6a0b5ea81fcfa2821250633f",
        },
        {
          skills: { attack: 0x97, criticalChance: 0x1f },
          n: 0x1,
          minPrice: 0x96,
          p10Price: 0x96,
          p50Price: 0x96,
          sampleOfferId: "6a0c028b41de31c08e06d855",
        },
        {
          skills: { attack: 0x9b, criticalChance: 0x1d },
          n: 0x1,
          minPrice: 0x96,
          p10Price: 0x96,
          p50Price: 0x96,
          sampleOfferId: "6a0cbac0db9b5f8461e6a4b1",
        },
        {
          skills: { attack: 0x9a, criticalChance: 0x20 },
          n: 0x1,
          minPrice: 0x9b,
          p10Price: 0x9b,
          p50Price: 0x9b,
          sampleOfferId: "6a0c4680de8f16bec4d14f6d",
        },
        {
          skills: { attack: 0x9b, criticalChance: 0x1f },
          n: 0x1,
          minPrice: 155.6,
          p10Price: 155.6,
          p50Price: 155.6,
          sampleOfferId: "6a0a69209c3fb9c4ebb37a29",
        },
        {
          skills: { attack: 0x9c, criticalChance: 0x1f },
          n: 0x1,
          minPrice: 156.388,
          p10Price: 156.388,
          p50Price: 156.388,
          sampleOfferId: "6a09d9575713eb2565a105bc",
        },
        {
          skills: { attack: 0x9a, criticalChance: 0x22 },
          n: 0x1,
          minPrice: 0x9f,
          p10Price: 0x9f,
          p50Price: 0x9f,
          sampleOfferId: "6a0c8ad0db9b5f8461a89128",
        },
        {
          skills: { attack: 0xa0, criticalChance: 0x21 },
          n: 0x1,
          minPrice: 0xb9,
          p10Price: 0xb9,
          p50Price: 0xb9,
          sampleOfferId: "6a0cb46ad164a1cfbf45b332",
        },
        {
          skills: { attack: 0xa1, criticalChance: 0x21 },
          n: 0x1,
          minPrice: 186.9,
          p10Price: 186.9,
          p50Price: 186.9,
          sampleOfferId: "6a0b0c536105cef530e481b6",
        },
        {
          skills: { attack: 0xa4, criticalChance: 0x21 },
          n: 0x1,
          minPrice: 193.069,
          p10Price: 193.069,
          p50Price: 193.069,
          sampleOfferId: "6a0b9bcd7849346b83ecbec9",
        },
        {
          skills: { attack: 0xa0, criticalChance: 0x22 },
          n: 0x1,
          minPrice: 193.1,
          p10Price: 193.1,
          p50Price: 193.1,
          sampleOfferId: "6a0c70b297b181038007dc76",
        },
        {
          skills: { attack: 0xa1, criticalChance: 0x22 },
          n: 0x1,
          minPrice: 194.995,
          p10Price: 194.995,
          p50Price: 194.995,
          sampleOfferId: "6a0bd9e4402e1cbefde342b9",
        },
        {
          skills: { attack: 0xa3, criticalChance: 0x21 },
          n: 0x1,
          minPrice: 0xc3,
          p10Price: 0xc3,
          p50Price: 0xc3,
          sampleOfferId: "6a0af5ddf33a76fce207387e",
        },
        {
          skills: { attack: 0xa0, criticalChance: 0x23 },
          n: 0x1,
          minPrice: 0xc3,
          p10Price: 0xc3,
          p50Price: 0xc3,
          sampleOfferId: "6a0c987d000753ef3ebc244a",
        },
        {
          skills: { attack: 0xa8, criticalChance: 0x21 },
          n: 0x1,
          minPrice: 0xc6,
          p10Price: 0xc6,
          p50Price: 0xc6,
          sampleOfferId: "6a0c534d44c156ae4b8b5e28",
        },
        {
          skills: { attack: 0xaa, criticalChance: 0x23 },
          n: 0x1,
          minPrice: 257.477,
          p10Price: 257.477,
          p50Price: 257.477,
          sampleOfferId: "6a0c2bbd54f591bf4e9ff34f",
        },
      ],
      offers: [
        {
          id: "6a0cbc4c14c0a61282ca09de",
          price: 0x90,
          skills: { attack: 0x92, criticalChance: 0x1e },
        },
        {
          id: "6a0cc5ed3e4f52241e4d9097",
          price: 0x90,
          skills: { attack: 0x98, criticalChance: 0x1b },
        },
        {
          id: "6a0cc60795aebd55bf120a74",
          price: 144.5,
          skills: { attack: 0x9d, criticalChance: 0x1a },
        },
        {
          id: "6a0cc65f73ff458c4f396cd8",
          price: 0x91,
          skills: { attack: 0x9e, criticalChance: 0x1a },
        },
        {
          id: "6a0cc68c519a7ee93e3c4d31",
          price: 0x91,
          skills: { attack: 0x9e, criticalChance: 0x1a },
        },
        {
          id: "6a0cb770ea6f64b76769a02e",
          price: 0x93,
          skills: { attack: 0x95, criticalChance: 0x1c },
        },
        {
          id: "6a0be2adc96112bc2bc5ab5d",
          price: 147.99,
          skills: { attack: 0x9a, criticalChance: 0x1d },
        },
        {
          id: "6a0cc29d122e7b34dabee39b",
          price: 147.99,
          skills: { attack: 0x92, criticalChance: 0x1f },
        },
        {
          id: "6a0bd90c60e45770e66caf52",
          price: 147.999,
          skills: { attack: 0x9f, criticalChance: 0x1b },
        },
        {
          id: "6a0bdb5fdcbdd8850092807f",
          price: 147.999,
          skills: { attack: 0x9c, criticalChance: 0x1d },
        },
        {
          id: "6a0b025587ed532c2dd97456",
          price: 0x94,
          skills: { attack: 0x93, criticalChance: 0x1e },
        },
        {
          id: "6a0c7e4f59dc7bdd6f881bf0",
          price: 0x94,
          skills: { attack: 0x97, criticalChance: 0x1e },
        },
        {
          id: "6a0cb0b914c0a61282c3eacc",
          price: 0x94,
          skills: { attack: 0x95, criticalChance: 0x20 },
        },
        {
          id: "6a0c26ac332d5dda7516eed5",
          price: 0x95,
          skills: { attack: 0x96, criticalChance: 0x1f },
        },
        {
          id: "6a07b46ad725935b762ae8f4",
          price: 0x96,
          skills: { attack: 0x95, criticalChance: 0x20 },
        },
        {
          id: "6a0b5ea81fcfa2821250633f",
          price: 0x96,
          skills: { attack: 0x9d, criticalChance: 0x1d },
        },
        {
          id: "6a0be694497a03da7acfe073",
          price: 0x96,
          skills: { attack: 0x96, criticalChance: 0x1f },
        },
        {
          id: "6a0c02841fcfa28212969760",
          price: 0x96,
          skills: { attack: 0x9c, criticalChance: 0x1d },
        },
        {
          id: "6a0c028b41de31c08e06d855",
          price: 0x96,
          skills: { attack: 0x97, criticalChance: 0x1f },
        },
        {
          id: "6a0c18363049671decc61b96",
          price: 0x96,
          skills: { attack: 0x99, criticalChance: 0x1f },
        },
        {
          id: "6a0cbac0db9b5f8461e6a4b1",
          price: 0x96,
          skills: { attack: 0x9b, criticalChance: 0x1d },
        },
        {
          id: "6a0b74b8edd9ab85e7fe24d0",
          price: 0x98,
          skills: { attack: 0x9a, criticalChance: 0x1f },
        },
        {
          id: "6a0c4680de8f16bec4d14f6d",
          price: 0x9b,
          skills: { attack: 0x9a, criticalChance: 0x20 },
        },
        {
          id: "6a0c8a94000753ef3ea82b6c",
          price: 0x9b,
          skills: { attack: 0x9d, criticalChance: 0x1f },
        },
        {
          id: "6a0a694d470ee144a1c30968",
          price: 155.4,
          skills: { attack: 0x9a, criticalChance: 0x1f },
        },
        {
          id: "6a0a68e90843a4590746b8f6",
          price: 155.6,
          skills: { attack: 0x99, criticalChance: 0x1f },
        },
        {
          id: "6a0a69209c3fb9c4ebb37a29",
          price: 155.6,
          skills: { attack: 0x9b, criticalChance: 0x1f },
        },
        {
          id: "6a09d9575713eb2565a105bc",
          price: 156.388,
          skills: { attack: 0x9c, criticalChance: 0x1f },
        },
        {
          id: "6a0c28dfd164a1cfbf2cff9c",
          price: 0x9d,
          skills: { attack: 0x9d, criticalChance: 0x1f },
        },
        {
          id: "6a0c43c70450530a9a79c024",
          price: 0x9e,
          skills: { attack: 0x99, criticalChance: 0x22 },
        },
        {
          id: "6a0c8ad0db9b5f8461a89128",
          price: 0x9f,
          skills: { attack: 0x9a, criticalChance: 0x22 },
        },
        {
          id: "6a0bdb78a615362509b98232",
          price: 159.999,
          skills: { attack: 0x99, criticalChance: 0x22 },
        },
        {
          id: "6a0cb46ad164a1cfbf45b332",
          price: 0xb9,
          skills: { attack: 0xa0, criticalChance: 0x21 },
        },
        {
          id: "6a0b0c536105cef530e481b6",
          price: 186.9,
          skills: { attack: 0xa1, criticalChance: 0x21 },
        },
        {
          id: "69f5daeef9c8bdb2934f0d87",
          price: 186.999,
          skills: { attack: 0xa2, criticalChance: 0x21 },
        },
        {
          id: "6a0a69992881254fe026373b",
          price: 0xbe,
          skills: { attack: 0xa2, criticalChance: 0x21 },
        },
        {
          id: "6a0b9bcd7849346b83ecbec9",
          price: 193.069,
          skills: { attack: 0xa4, criticalChance: 0x21 },
        },
        {
          id: "6a0c70b297b181038007dc76",
          price: 193.1,
          skills: { attack: 0xa0, criticalChance: 0x22 },
        },
        {
          id: "6a0bd9e4402e1cbefde342b9",
          price: 194.995,
          skills: { attack: 0xa1, criticalChance: 0x22 },
        },
        {
          id: "6a0741f6210b031e3c57202e",
          price: 194.996,
          skills: { attack: 0xa2, criticalChance: 0x22 },
        },
        {
          id: "69f5f9f0e6d4b9f7002a146a",
          price: 0xc3,
          skills: { attack: 0xa2, criticalChance: 0x22 },
        },
        {
          id: "6a0af5ddf33a76fce207387e",
          price: 0xc3,
          skills: { attack: 0xa3, criticalChance: 0x21 },
        },
        {
          id: "6a0c987d000753ef3ebc244a",
          price: 0xc3,
          skills: { attack: 0xa0, criticalChance: 0x23 },
        },
        {
          id: "6a0c534d44c156ae4b8b5e28",
          price: 0xc6,
          skills: { attack: 0xa8, criticalChance: 0x21 },
        },
        {
          id: "6a0cad7659dc7bdd6fc48a35",
          price: 0xd2,
          skills: { attack: 0xa8, criticalChance: 0x23 },
        },
        {
          id: "6a0b0ca47a8e21007d372193",
          price: 219.9,
          skills: { attack: 0xa9, criticalChance: 0x23 },
        },
        {
          id: "6a06b5c1e11ee2dc9937e40d",
          price: 221.5,
          skills: { attack: 0xa8, criticalChance: 0x23 },
        },
        {
          id: "69f53fddf9c8bdb293ca5753",
          price: 0xdf,
          skills: { attack: 0xa7, criticalChance: 0x23 },
        },
        {
          id: "69fd251eb1938cf7e6004131",
          price: 0xdf,
          skills: { attack: 0xa8, criticalChance: 0x23 },
        },
        {
          id: "69f23e185fe73e366d168427",
          price: 228.7,
          skills: { attack: 0xa7, criticalChance: 0x23 },
        },
        {
          id: "69fd830b86ef3e947f1f7105",
          price: 0xe9,
          skills: { attack: 0xa9, criticalChance: 0x23 },
        },
        {
          id: "6a0c2bbd54f591bf4e9ff34f",
          price: 257.477,
          skills: { attack: 0xaa, criticalChance: 0x23 },
        },
      ],
      fetchedAt: "2026-05-19T20:57:19.441Z",
      passesUsed: 0x5,
    },
    jet: {
      n: 0x2e,
      price: {
        n: 0x2e,
        min: 0x18d,
        p10: 0x19f,
        p50: 0x1c7,
        p90: 0x253,
        max: 0x2710,
        mean: 687.598,
      },
      skills: {
        attack: {
          n: 0x2e,
          min: 0xe1,
          p10: 0xef,
          p50: 0x10a,
          p90: 0x123,
          max: 0x12a,
          mean: 264.543,
        },
        criticalChance: {
          n: 0x2e,
          min: 0x29,
          p10: 0x2b,
          p50: 0x2f,
          p90: 0x32,
          max: 0x32,
          mean: 46.565,
        },
      },
      priceByRoll: [
        {
          skills: { attack: 0x125, criticalChance: 0x32 },
          n: 0x3,
          minPrice: 668.317,
          p10Price: 668.317,
          p50Price: 0x29d,
          sampleOfferId: "6a099dfb79e713efac8c74b8",
        },
        {
          skills: { attack: 0x118, criticalChance: 0x29 },
          n: 0x2,
          minPrice: 0x1ae,
          p10Price: 0x1ae,
          p50Price: 434.6,
          sampleOfferId: "6a0cbc6ce5afba85e7cb9ec7",
        },
        {
          skills: { attack: 0xe6, criticalChance: 0x2b },
          n: 0x1,
          minPrice: 0x18d,
          p10Price: 0x18d,
          p50Price: 0x18d,
          sampleOfferId: "6a0caff14c1c1ac46bd60872",
        },
        {
          skills: { attack: 0xf6, criticalChance: 0x2b },
          n: 0x1,
          minPrice: 0x190,
          p10Price: 0x190,
          p50Price: 0x190,
          sampleOfferId: "6a0cba0c3fd37b4c0b009cf0",
        },
        {
          skills: { attack: 0xf4, criticalChance: 0x2b },
          n: 0x1,
          minPrice: 414.999,
          p10Price: 414.999,
          p50Price: 414.999,
          sampleOfferId: "6a0ca8d2240c05c97f4d6816",
        },
        {
          skills: { attack: 0xe9, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x19f,
          p10Price: 0x19f,
          p50Price: 0x19f,
          sampleOfferId: "6a0a500389991d1903015c27",
        },
        {
          skills: { attack: 0xef, criticalChance: 0x2c },
          n: 0x1,
          minPrice: 0x19f,
          p10Price: 0x19f,
          p50Price: 0x19f,
          sampleOfferId: "6a0c329ef1ffc5522440bb20",
        },
        {
          skills: { attack: 0xf8, criticalChance: 0x2b },
          n: 0x1,
          minPrice: 0x1a4,
          p10Price: 0x1a4,
          p50Price: 0x1a4,
          sampleOfferId: "6a09f1d95ff9ce41ee032b40",
        },
        {
          skills: { attack: 0xe9, criticalChance: 0x2f },
          n: 0x1,
          minPrice: 0x1a4,
          p10Price: 0x1a4,
          p50Price: 0x1a4,
          sampleOfferId: "6a0a35f5a2cc72c0084c1baf",
        },
        {
          skills: { attack: 0xe1, criticalChance: 0x32 },
          n: 0x1,
          minPrice: 0x1a4,
          p10Price: 0x1a4,
          p50Price: 0x1a4,
          sampleOfferId: "6a0cafddb1fd467f706487d3",
        },
        {
          skills: { attack: 0xf5, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x1a8,
          p10Price: 0x1a8,
          p50Price: 0x1a8,
          sampleOfferId: "6a0b70bd5ed78df2c2d683af",
        },
        {
          skills: { attack: 0x115, criticalChance: 0x2b },
          n: 0x1,
          minPrice: 0x1ae,
          p10Price: 0x1ae,
          p50Price: 0x1ae,
          sampleOfferId: "6a088d8c1187003c14712b4c",
        },
        {
          skills: { attack: 0xf6, criticalChance: 0x2c },
          n: 0x1,
          minPrice: 0x1b8,
          p10Price: 0x1b8,
          p50Price: 0x1b8,
          sampleOfferId: "69fcd5d78dbb9fdf4b9daa0a",
        },
        {
          skills: { attack: 0xff, criticalChance: 0x2c },
          n: 0x1,
          minPrice: 0x1b8,
          p10Price: 0x1b8,
          p50Price: 0x1b8,
          sampleOfferId: "69fcd5e1e16f792d9641ea85",
        },
        {
          skills: { attack: 0x116, criticalChance: 0x2c },
          n: 0x1,
          minPrice: 0x1b8,
          p10Price: 0x1b8,
          p50Price: 0x1b8,
          sampleOfferId: "6a02279f5d1cd48878b91666",
        },
        {
          skills: { attack: 0xfb, criticalChance: 0x31 },
          n: 0x1,
          minPrice: 0x1bb,
          p10Price: 0x1bb,
          p50Price: 0x1bb,
          sampleOfferId: "6a0c503ad164a1cfbfa19075",
        },
        {
          skills: { attack: 0xfb, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x1c1,
          p10Price: 0x1c1,
          p50Price: 0x1c1,
          sampleOfferId: "6a02deb86fd9a30833743ca6",
        },
        {
          skills: { attack: 0x107, criticalChance: 0x2b },
          n: 0x1,
          minPrice: 0x1c2,
          p10Price: 0x1c2,
          p50Price: 0x1c2,
          sampleOfferId: "69f42d17f69d06da4508dd37",
        },
        {
          skills: { attack: 0x106, criticalChance: 0x2c },
          n: 0x1,
          minPrice: 0x1c2,
          p10Price: 0x1c2,
          p50Price: 0x1c2,
          sampleOfferId: "69f42d1ff69d06da4508e1b7",
        },
        {
          skills: { attack: 0xfe, criticalChance: 0x2d },
          n: 0x1,
          minPrice: 0x1c2,
          p10Price: 0x1c2,
          p50Price: 0x1c2,
          sampleOfferId: "69fbb78badfb8b85f49efeda",
        },
        {
          skills: { attack: 0xfe, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x1c2,
          p10Price: 0x1c2,
          p50Price: 0x1c2,
          sampleOfferId: "69fcd5b6c513525f282efe3d",
        },
        {
          skills: { attack: 0x104, criticalChance: 0x2f },
          n: 0x1,
          minPrice: 0x1c2,
          p10Price: 0x1c2,
          p50Price: 0x1c2,
          sampleOfferId: "6a0c750708ed149c50cb5d1a",
        },
        {
          skills: { attack: 0x102, criticalChance: 0x2e },
          n: 0x1,
          minPrice: 0x1c5,
          p10Price: 0x1c5,
          p50Price: 0x1c5,
          sampleOfferId: "69fc6ae140d20c449b5a3619",
        },
        {
          skills: { attack: 0x107, criticalChance: 0x2e },
          n: 0x1,
          minPrice: 0x1c7,
          p10Price: 0x1c7,
          p50Price: 0x1c7,
          sampleOfferId: "69f6487ef821c663f39231f3",
        },
        {
          skills: { attack: 0x10e, criticalChance: 0x2e },
          n: 0x1,
          minPrice: 0x1c7,
          p10Price: 0x1c7,
          p50Price: 0x1c7,
          sampleOfferId: "6a08c1e8e54cb6ab5e797bdc",
        },
        {
          skills: { attack: 0xfc, criticalChance: 0x2d },
          n: 0x1,
          minPrice: 457.4,
          p10Price: 457.4,
          p50Price: 457.4,
          sampleOfferId: "69dfd1f9405cba980f0a4896",
        },
        {
          skills: { attack: 0x123, criticalChance: 0x2c },
          n: 0x1,
          minPrice: 0x1cc,
          p10Price: 0x1cc,
          p50Price: 0x1cc,
          sampleOfferId: "6a07875f1f60645ae4b2bed8",
        },
        {
          skills: { attack: 0x107, criticalChance: 0x2f },
          n: 0x1,
          minPrice: 0x1cc,
          p10Price: 0x1cc,
          p50Price: 0x1cc,
          sampleOfferId: "6a0cbde6122e7b34dabc5cfc",
        },
        {
          skills: { attack: 0x10d, criticalChance: 0x2f },
          n: 0x1,
          minPrice: 0x1cd,
          p10Price: 0x1cd,
          p50Price: 0x1cd,
          sampleOfferId: "69f38bc9cc5be0b669a0dee2",
        },
        {
          skills: { attack: 0x10d, criticalChance: 0x31 },
          n: 0x1,
          minPrice: 487.55,
          p10Price: 487.55,
          p50Price: 487.55,
          sampleOfferId: "6a0ac25c57a773a0e0eb4327",
        },
        {
          skills: { attack: 0x117, criticalChance: 0x2f },
          n: 0x1,
          minPrice: 0x1f4,
          p10Price: 0x1f4,
          p50Price: 0x1f4,
          sampleOfferId: "6a093a6884a8a3f3b4dcd363",
        },
        {
          skills: { attack: 0x10a, criticalChance: 0x31 },
          n: 0x1,
          minPrice: 0x1f4,
          p10Price: 0x1f4,
          p50Price: 0x1f4,
          sampleOfferId: "6a0c7d06dba93000aca3ad4b",
        },
        {
          skills: { attack: 0x110, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x201,
          p10Price: 0x201,
          p50Price: 0x201,
          sampleOfferId: "6a0c91898cecb6e111a6829d",
        },
        {
          skills: { attack: 0x111, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x203,
          p10Price: 0x203,
          p50Price: 0x203,
          sampleOfferId: "6a0c9121256c6c9318db82b5",
        },
        {
          skills: { attack: 0x110, criticalChance: 0x31 },
          n: 0x1,
          minPrice: 0x208,
          p10Price: 0x208,
          p50Price: 0x208,
          sampleOfferId: "6a04b1f79c5e435cd2497eba",
        },
        {
          skills: { attack: 0x112, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x208,
          p10Price: 0x208,
          p50Price: 0x208,
          sampleOfferId: "6a0c9a69db9b5f8461bc7afb",
        },
        {
          skills: { attack: 0x10b, criticalChance: 0x32 },
          n: 0x1,
          minPrice: 524.752,
          p10Price: 524.752,
          p50Price: 524.752,
          sampleOfferId: "6a0c63a7ce82d1aed77a32b1",
        },
        {
          skills: { attack: 0x115, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x20d,
          p10Price: 0x20d,
          p50Price: 0x20d,
          sampleOfferId: "69f54bb1cfc0e38b712663e5",
        },
        {
          skills: { attack: 0x10a, criticalChance: 0x2f },
          n: 0x1,
          minPrice: 0x225,
          p10Price: 0x225,
          p50Price: 0x225,
          sampleOfferId: "69f126c7b55e5cdc3f68a2e0",
        },
        {
          skills: { attack: 0x123, criticalChance: 0x30 },
          n: 0x1,
          minPrice: 0x226,
          p10Price: 0x226,
          p50Price: 0x226,
          sampleOfferId: "6a0c624bce82d1aed777c37c",
        },
        {
          skills: { attack: 0x119, criticalChance: 0x32 },
          n: 0x1,
          minPrice: 0x244,
          p10Price: 0x244,
          p50Price: 0x244,
          sampleOfferId: "6a0b64f54c1b5c9f0677a4c3",
        },
        {
          skills: { attack: 0x11d, criticalChance: 0x32 },
          n: 0x1,
          minPrice: 0x253,
          p10Price: 0x253,
          p50Price: 0x253,
          sampleOfferId: "6a09cff23e5d65bf5d5aa476",
        },
        {
          skills: { attack: 0x12a, criticalChance: 0x32 },
          n: 0x1,
          minPrice: 0x2710,
          p10Price: 0x2710,
          p50Price: 0x2710,
          sampleOfferId: "68e0fa3c52df939b2e626b56",
        },
      ],
      offers: [
        {
          id: "6a0caff14c1c1ac46bd60872",
          price: 0x18d,
          skills: { attack: 0xe6, criticalChance: 0x2b },
        },
        {
          id: "6a0cba0c3fd37b4c0b009cf0",
          price: 0x190,
          skills: { attack: 0xf6, criticalChance: 0x2b },
        },
        {
          id: "6a0ca8d2240c05c97f4d6816",
          price: 414.999,
          skills: { attack: 0xf4, criticalChance: 0x2b },
        },
        {
          id: "6a0a500389991d1903015c27",
          price: 0x19f,
          skills: { attack: 0xe9, criticalChance: 0x30 },
        },
        {
          id: "6a0c329ef1ffc5522440bb20",
          price: 0x19f,
          skills: { attack: 0xef, criticalChance: 0x2c },
        },
        {
          id: "6a09f1d95ff9ce41ee032b40",
          price: 0x1a4,
          skills: { attack: 0xf8, criticalChance: 0x2b },
        },
        {
          id: "6a0a35f5a2cc72c0084c1baf",
          price: 0x1a4,
          skills: { attack: 0xe9, criticalChance: 0x2f },
        },
        {
          id: "6a0cafddb1fd467f706487d3",
          price: 0x1a4,
          skills: { attack: 0xe1, criticalChance: 0x32 },
        },
        {
          id: "6a0b70bd5ed78df2c2d683af",
          price: 0x1a8,
          skills: { attack: 0xf5, criticalChance: 0x30 },
        },
        {
          id: "6a088d8c1187003c14712b4c",
          price: 0x1ae,
          skills: { attack: 0x115, criticalChance: 0x2b },
        },
        {
          id: "6a0cbc6ce5afba85e7cb9ec7",
          price: 0x1ae,
          skills: { attack: 0x118, criticalChance: 0x29 },
        },
        {
          id: "6a084cc9751ac723628bae83",
          price: 434.6,
          skills: { attack: 0x118, criticalChance: 0x29 },
        },
        {
          id: "69fcd5d78dbb9fdf4b9daa0a",
          price: 0x1b8,
          skills: { attack: 0xf6, criticalChance: 0x2c },
        },
        {
          id: "69fcd5e1e16f792d9641ea85",
          price: 0x1b8,
          skills: { attack: 0xff, criticalChance: 0x2c },
        },
        {
          id: "6a02279f5d1cd48878b91666",
          price: 0x1b8,
          skills: { attack: 0x116, criticalChance: 0x2c },
        },
        {
          id: "6a0c503ad164a1cfbfa19075",
          price: 0x1bb,
          skills: { attack: 0xfb, criticalChance: 0x31 },
        },
        {
          id: "6a02deb86fd9a30833743ca6",
          price: 0x1c1,
          skills: { attack: 0xfb, criticalChance: 0x30 },
        },
        {
          id: "69f42d17f69d06da4508dd37",
          price: 0x1c2,
          skills: { attack: 0x107, criticalChance: 0x2b },
        },
        {
          id: "69f42d1ff69d06da4508e1b7",
          price: 0x1c2,
          skills: { attack: 0x106, criticalChance: 0x2c },
        },
        {
          id: "69fbb78badfb8b85f49efeda",
          price: 0x1c2,
          skills: { attack: 0xfe, criticalChance: 0x2d },
        },
        {
          id: "69fcd5b6c513525f282efe3d",
          price: 0x1c2,
          skills: { attack: 0xfe, criticalChance: 0x30 },
        },
        {
          id: "6a0c750708ed149c50cb5d1a",
          price: 0x1c2,
          skills: { attack: 0x104, criticalChance: 0x2f },
        },
        {
          id: "69fc6ae140d20c449b5a3619",
          price: 0x1c5,
          skills: { attack: 0x102, criticalChance: 0x2e },
        },
        {
          id: "69f6487ef821c663f39231f3",
          price: 0x1c7,
          skills: { attack: 0x107, criticalChance: 0x2e },
        },
        {
          id: "6a08c1e8e54cb6ab5e797bdc",
          price: 0x1c7,
          skills: { attack: 0x10e, criticalChance: 0x2e },
        },
        {
          id: "69dfd1f9405cba980f0a4896",
          price: 457.4,
          skills: { attack: 0xfc, criticalChance: 0x2d },
        },
        {
          id: "6a07875f1f60645ae4b2bed8",
          price: 0x1cc,
          skills: { attack: 0x123, criticalChance: 0x2c },
        },
        {
          id: "6a0cbde6122e7b34dabc5cfc",
          price: 0x1cc,
          skills: { attack: 0x107, criticalChance: 0x2f },
        },
        {
          id: "69f38bc9cc5be0b669a0dee2",
          price: 0x1cd,
          skills: { attack: 0x10d, criticalChance: 0x2f },
        },
        {
          id: "6a0ac25c57a773a0e0eb4327",
          price: 487.55,
          skills: { attack: 0x10d, criticalChance: 0x31 },
        },
        {
          id: "6a093a6884a8a3f3b4dcd363",
          price: 0x1f4,
          skills: { attack: 0x117, criticalChance: 0x2f },
        },
        {
          id: "6a0c7d06dba93000aca3ad4b",
          price: 0x1f4,
          skills: { attack: 0x10a, criticalChance: 0x31 },
        },
        {
          id: "6a0c91898cecb6e111a6829d",
          price: 0x201,
          skills: { attack: 0x110, criticalChance: 0x30 },
        },
        {
          id: "6a0c9121256c6c9318db82b5",
          price: 0x203,
          skills: { attack: 0x111, criticalChance: 0x30 },
        },
        {
          id: "6a04b1f79c5e435cd2497eba",
          price: 0x208,
          skills: { attack: 0x110, criticalChance: 0x31 },
        },
        {
          id: "6a0c9a69db9b5f8461bc7afb",
          price: 0x208,
          skills: { attack: 0x112, criticalChance: 0x30 },
        },
        {
          id: "6a0c63a7ce82d1aed77a32b1",
          price: 524.752,
          skills: { attack: 0x10b, criticalChance: 0x32 },
        },
        {
          id: "69f54bb1cfc0e38b712663e5",
          price: 0x20d,
          skills: { attack: 0x115, criticalChance: 0x30 },
        },
        {
          id: "69f126c7b55e5cdc3f68a2e0",
          price: 0x225,
          skills: { attack: 0x10a, criticalChance: 0x2f },
        },
        {
          id: "6a0c624bce82d1aed777c37c",
          price: 0x226,
          skills: { attack: 0x123, criticalChance: 0x30 },
        },
        {
          id: "6a0b64f54c1b5c9f0677a4c3",
          price: 0x244,
          skills: { attack: 0x119, criticalChance: 0x32 },
        },
        {
          id: "6a09cff23e5d65bf5d5aa476",
          price: 0x253,
          skills: { attack: 0x11d, criticalChance: 0x32 },
        },
        {
          id: "6a099dfb79e713efac8c74b8",
          price: 668.317,
          skills: { attack: 0x125, criticalChance: 0x32 },
        },
        {
          id: "6a0270d45eb7f5772a49dd18",
          price: 0x29d,
          skills: { attack: 0x125, criticalChance: 0x32 },
        },
        {
          id: "69b2ba164b0d180f67b0752b",
          price: 728.88,
          skills: { attack: 0x125, criticalChance: 0x32 },
        },
        {
          id: "68e0fa3c52df939b2e626b56",
          price: 0x2710,
          skills: { attack: 0x12a, criticalChance: 0x32 },
        },
      ],
      fetchedAt: "2026-05-19T20:57:39.969Z",
      passesUsed: 0x5,
    },
    helmet1: {
      n: 0x34,
      price: {
        n: 0x34,
        min: 1.275,
        p10: 1.28,
        p50: 1.33,
        p90: 1.7,
        max: 1.7,
        mean: 1.419,
      },
      skills: {
        criticalDamages: {
          n: 0x34,
          min: 0x1,
          p10: 0x4,
          p50: 0xd,
          p90: 0xf,
          max: 0xf,
          mean: 11.538,
        },
      },
      priceByRoll: [
        {
          skills: { criticalDamages: 0xe },
          n: 0xc,
          minPrice: 1.399,
          p10Price: 1.4,
          p50Price: 1.4,
          sampleOfferId: "6a0c45ab297b921dee26c443",
        },
        {
          skills: { criticalDamages: 0xf },
          n: 0xc,
          minPrice: 1.67,
          p10Price: 1.672,
          p50Price: 1.7,
          sampleOfferId: "6a0ccca25c05ff60f1bb1311",
        },
        {
          skills: { criticalDamages: 0xd },
          n: 0x8,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.31,
          sampleOfferId: "6a0cc5b2c23414860262598f",
        },
        {
          skills: { criticalDamages: 0x4 },
          n: 0x6,
          minPrice: 1.279,
          p10Price: 1.279,
          p50Price: 1.28,
          sampleOfferId: "6a0b7498f3a82d5c05ab2c86",
        },
        {
          skills: { criticalDamages: 0xc },
          n: 0x4,
          minPrice: 1.29,
          p10Price: 1.29,
          p50Price: 1.298,
          sampleOfferId: "6a0c5e1d332d5dda75aef2d6",
        },
        {
          skills: { criticalDamages: 0xa },
          n: 0x3,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.28,
          sampleOfferId: "6a0c2215295066cb76e06f14",
        },
        {
          skills: { criticalDamages: 0x9 },
          n: 0x3,
          minPrice: 1.281,
          p10Price: 1.281,
          p50Price: 1.281,
          sampleOfferId: "6a0b177bbdc733aa49d682aa",
        },
        {
          skills: { criticalDamages: 0x7 },
          n: 0x1,
          minPrice: 1.275,
          p10Price: 1.275,
          p50Price: 1.275,
          sampleOfferId: "6a0cc89d396e7531ecc1d66b",
        },
        {
          skills: { criticalDamages: 0x1 },
          n: 0x1,
          minPrice: 1.279,
          p10Price: 1.279,
          p50Price: 1.279,
          sampleOfferId: "6a0b748e41de31c08ecd4412",
        },
        {
          skills: { criticalDamages: 0x8 },
          n: 0x1,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.28,
          sampleOfferId: "6a0b1768655449e064de1880",
        },
        {
          skills: { criticalDamages: 0x3 },
          n: 0x1,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.28,
          sampleOfferId: "6a0c1cdbfbe1eeaa627011eb",
        },
        {
          skills: { criticalDamages: 0x2 },
          n: 0x0,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.28,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x5 },
          n: 0x0,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.28,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x6 },
          n: 0x0,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.28,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0xb },
          n: 0x0,
          minPrice: 1.29,
          p10Price: 1.29,
          p50Price: 1.29,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0cc89d396e7531ecc1d66b",
          price: 1.275,
          skills: { criticalDamages: 0x7 },
        },
        {
          id: "6a0b748e41de31c08ecd4412",
          price: 1.279,
          skills: { criticalDamages: 0x1 },
        },
        {
          id: "6a0b7498f3a82d5c05ab2c86",
          price: 1.279,
          skills: { criticalDamages: 0x4 },
        },
        {
          id: "6a0b1768655449e064de1880",
          price: 1.28,
          skills: { criticalDamages: 0x8 },
        },
        {
          id: "6a0b567d91ec71a336a0ea45",
          price: 1.28,
          skills: { criticalDamages: 0x4 },
        },
        {
          id: "6a0b72e9d1745cf0cbf4eba3",
          price: 1.28,
          skills: { criticalDamages: 0x4 },
        },
        {
          id: "6a0b74cd41de31c08ecdf9a4",
          price: 1.28,
          skills: { criticalDamages: 0x4 },
        },
        {
          id: "6a0c1cdbfbe1eeaa627011eb",
          price: 1.28,
          skills: { criticalDamages: 0x3 },
        },
        {
          id: "6a0c2215295066cb76e06f14",
          price: 1.28,
          skills: { criticalDamages: 0xa },
        },
        {
          id: "6a0c49a1385386c1e21ec0e3",
          price: 1.28,
          skills: { criticalDamages: 0xa },
        },
        {
          id: "6a0c7f8d12a79ff2373c5293",
          price: 1.28,
          skills: { criticalDamages: 0x4 },
        },
        {
          id: "6a0cc569c775007f7e59f515",
          price: 1.28,
          skills: { criticalDamages: 0x4 },
        },
        {
          id: "6a0cc5b2c23414860262598f",
          price: 1.28,
          skills: { criticalDamages: 0xd },
        },
        {
          id: "6a0b177bbdc733aa49d682aa",
          price: 1.281,
          skills: { criticalDamages: 0x9 },
        },
        {
          id: "6a0b1792ed8423eb1cd05746",
          price: 1.281,
          skills: { criticalDamages: 0x9 },
        },
        {
          id: "6a0c0e0be15b757e7e7e9369",
          price: 1.285,
          skills: { criticalDamages: 0xa },
        },
        {
          id: "6a0b5ea2fce09fd63a8b4a1a",
          price: 1.286,
          skills: { criticalDamages: 0x9 },
        },
        {
          id: "6a0c5e1d332d5dda75aef2d6",
          price: 1.29,
          skills: { criticalDamages: 0xc },
        },
        {
          id: "6a0c92971c81298e4a27f88b",
          price: 1.298,
          skills: { criticalDamages: 0xc },
        },
        {
          id: "6a0c929ec775007f7e265490",
          price: 1.298,
          skills: { criticalDamages: 0xc },
        },
        {
          id: "6a0c92a61aca5eb348f73792",
          price: 1.298,
          skills: { criticalDamages: 0xc },
        },
        {
          id: "6a0cb50f0450530a9a4150c7",
          price: 1.298,
          skills: { criticalDamages: 0xd },
        },
        {
          id: "6a0c7c73c59101a5600ee221",
          price: 1.299,
          skills: { criticalDamages: 0xd },
        },
        {
          id: "6a0c7109ea6f64b7671b7a9d",
          price: 1.307,
          skills: { criticalDamages: 0xd },
        },
        {
          id: "6a0bf4caeb9ecf343ee09070",
          price: 1.31,
          skills: { criticalDamages: 0xd },
        },
        {
          id: "6a0c006c22d618f6e57c53c7",
          price: 1.327,
          skills: { criticalDamages: 0xd },
        },
        {
          id: "6a0b24eef6f2a29be2e454ff",
          price: 1.33,
          skills: { criticalDamages: 0xd },
        },
        {
          id: "6a0c45ab297b921dee26c443",
          price: 1.399,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a078f52bbb9193210fa3434",
          price: 1.4,
          skills: { criticalDamages: 0xd },
        },
        {
          id: "6a08a417e35aa12e5f1857fe",
          price: 1.4,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a0a598a470ee144a1bf1cbe",
          price: 1.4,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a0b0220b9ea30ac16d7d2ee",
          price: 1.4,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a0b4ed2a38e29b6ddabe5c1",
          price: 1.4,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a0c28ccd164a1cfbf2cc762",
          price: 1.4,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a0c28f23049671decde4b8c",
          price: 1.4,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a050f658a7f6b676576758c",
          price: 1.5,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a050f6a578457141ebc0806",
          price: 1.5,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a050f718a7f6b6765767afe",
          price: 1.5,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a050f78652b45efbc71be84",
          price: 1.5,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a050f7d578457141ebc1557",
          price: 1.5,
          skills: { criticalDamages: 0xe },
        },
        {
          id: "6a0ccca25c05ff60f1bb1311",
          price: 1.67,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0c838122e727783b1f8593",
          price: 1.672,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0c8382ce82d1aed7abcd6b",
          price: 1.672,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0c7c2d12a79ff23738d3e7",
          price: 1.68,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0ca286ce82d1aed7d3749f",
          price: 1.69,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0bf241eb47db9b217b6100",
          price: 1.7,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0bf2450ee509ace19b58bf",
          price: 1.7,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0bf2499d8ae1434018c70d",
          price: 1.7,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0bf24e0ee509ace19b64ce",
          price: 1.7,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0bf252e116865e0e83d745",
          price: 1.7,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0bf257b8a66abeff7ef730",
          price: 1.7,
          skills: { criticalDamages: 0xf },
        },
        {
          id: "6a0bf275eb47db9b217b78fc",
          price: 1.7,
          skills: { criticalDamages: 0xf },
        },
      ],
      fetchedAt: "2026-05-19T20:58:00.433Z",
      passesUsed: 0x5,
    },
    helmet2: {
      n: 0x38,
      price: {
        n: 0x38,
        min: 3.85,
        p10: 3.88,
        p50: 0x4,
        p90: 6.399,
        max: 6.4,
        mean: 4.476,
      },
      skills: {
        criticalDamages: {
          n: 0x38,
          min: 0x10,
          p10: 0x15,
          p50: 0x1c,
          p90: 0x1e,
          max: 0x1e,
          mean: 26.429,
        },
      },
      priceByRoll: [
        {
          skills: { criticalDamages: 0x1d },
          n: 0xc,
          minPrice: 4.198,
          p10Price: 4.2,
          p50Price: 4.2,
          sampleOfferId: "6a0ccee897401bcd991c0449",
        },
        {
          skills: { criticalDamages: 0x1e },
          n: 0xc,
          minPrice: 5.94,
          p10Price: 5.95,
          p50Price: 6.399,
          sampleOfferId: "6a0cb6db000753ef3ee8aa09",
        },
        {
          skills: { criticalDamages: 0x1b },
          n: 0x8,
          minPrice: 3.9,
          p10Price: 3.9,
          p50Price: 0x4,
          sampleOfferId: "6a0c72d3108199b6ac778238",
        },
        {
          skills: { criticalDamages: 0x15 },
          n: 0x4,
          minPrice: 3.87,
          p10Price: 3.87,
          p50Price: 3.88,
          sampleOfferId: "6a0cc5bb71a7dc4d0d5782ea",
        },
        {
          skills: { criticalDamages: 0x17 },
          n: 0x4,
          minPrice: 3.87,
          p10Price: 3.87,
          p50Price: 3.89,
          sampleOfferId: "6a0cc5d5a143bc2223172f5a",
        },
        {
          skills: { criticalDamages: 0x19 },
          n: 0x4,
          minPrice: 3.89,
          p10Price: 3.89,
          p50Price: 3.899,
          sampleOfferId: "6a0cb47569769ff8503d9ea7",
        },
        {
          skills: { criticalDamages: 0x1c },
          n: 0x4,
          minPrice: 3.949,
          p10Price: 3.949,
          p50Price: 3.95,
          sampleOfferId: "6a0cc446505754d69a530282",
        },
        {
          skills: { criticalDamages: 0x10 },
          n: 0x2,
          minPrice: 3.85,
          p10Price: 3.85,
          p50Price: 3.87,
          sampleOfferId: "6a0c4e2dd164a1cfbf9f319b",
        },
        {
          skills: { criticalDamages: 0x18 },
          n: 0x2,
          minPrice: 3.88,
          p10Price: 3.88,
          p50Price: 3.89,
          sampleOfferId: "6a0cc5eabbe7728d2b917276",
        },
        {
          skills: { criticalDamages: 0x1a },
          n: 0x2,
          minPrice: 3.898,
          p10Price: 3.898,
          p50Price: 3.899,
          sampleOfferId: "6a0ccc5ec23414860267a96f",
        },
        {
          skills: { criticalDamages: 0x11 },
          n: 0x1,
          minPrice: 3.88,
          p10Price: 3.88,
          p50Price: 3.88,
          sampleOfferId: "6a0c02d0497a03da7adada50",
        },
        {
          skills: { criticalDamages: 0x13 },
          n: 0x1,
          minPrice: 3.89,
          p10Price: 3.89,
          p50Price: 3.89,
          sampleOfferId: "6a0adca865f750440b26d1bc",
        },
        {
          skills: { criticalDamages: 0x12 },
          n: 0x0,
          minPrice: 3.88,
          p10Price: 3.88,
          p50Price: 3.88,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x14 },
          n: 0x0,
          minPrice: 3.88,
          p10Price: 3.88,
          p50Price: 3.88,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x16 },
          n: 0x0,
          minPrice: 3.87,
          p10Price: 3.87,
          p50Price: 3.87,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0c4e2dd164a1cfbf9f319b",
          price: 3.85,
          skills: { criticalDamages: 0x10 },
        },
        {
          id: "6a0c02c2497a03da7ada88ab",
          price: 3.87,
          skills: { criticalDamages: 0x10 },
        },
        {
          id: "6a0cc5bb71a7dc4d0d5782ea",
          price: 3.87,
          skills: { criticalDamages: 0x15 },
        },
        {
          id: "6a0cc5d5a143bc2223172f5a",
          price: 3.87,
          skills: { criticalDamages: 0x17 },
        },
        {
          id: "6a0ae2fbf93a2c9eaa6d679a",
          price: 3.88,
          skills: { criticalDamages: 0x15 },
        },
        {
          id: "6a0c029488b39978a74b6482",
          price: 3.88,
          skills: { criticalDamages: 0x15 },
        },
        {
          id: "6a0c02d0497a03da7adada50",
          price: 3.88,
          skills: { criticalDamages: 0x11 },
        },
        {
          id: "6a0cc5eabbe7728d2b917276",
          price: 3.88,
          skills: { criticalDamages: 0x18 },
        },
        {
          id: "6a0adca865f750440b26d1bc",
          price: 3.89,
          skills: { criticalDamages: 0x13 },
        },
        {
          id: "6a0addadf93a2c9eaa67fe90",
          price: 3.89,
          skills: { criticalDamages: 0x17 },
        },
        {
          id: "6a0addddf83549922f4750cd",
          price: 3.89,
          skills: { criticalDamages: 0x15 },
        },
        {
          id: "6a0ae269b888fe1852c73292",
          price: 3.89,
          skills: { criticalDamages: 0x18 },
        },
        {
          id: "6a0cb47569769ff8503d9ea7",
          price: 3.89,
          skills: { criticalDamages: 0x19 },
        },
        {
          id: "6a0cc277108199b6acc78a86",
          price: 3.89,
          skills: { criticalDamages: 0x17 },
        },
        {
          id: "6a0c4648ef20adbebdc91b86",
          price: 3.898,
          skills: { criticalDamages: 0x19 },
        },
        {
          id: "6a0ccc5ec23414860267a96f",
          price: 3.898,
          skills: { criticalDamages: 0x1a },
        },
        {
          id: "6a0c022edcbdd885009ca22d",
          price: 3.899,
          skills: { criticalDamages: 0x19 },
        },
        {
          id: "6a0c4667218a2fe5f0de4181",
          price: 3.899,
          skills: { criticalDamages: 0x1a },
        },
        {
          id: "6a0c4a6aef20adbebdd69432",
          price: 3.899,
          skills: { criticalDamages: 0x19 },
        },
        {
          id: "6a082b88c45f231a12e060eb",
          price: 3.9,
          skills: { criticalDamages: 0x17 },
        },
        {
          id: "6a0c72d3108199b6ac778238",
          price: 3.9,
          skills: { criticalDamages: 0x1b },
        },
        {
          id: "6a0c72dbdba93000ac9e19cf",
          price: 3.9,
          skills: { criticalDamages: 0x1b },
        },
        {
          id: "6a0cc446505754d69a530282",
          price: 3.949,
          skills: { criticalDamages: 0x1c },
        },
        {
          id: "6a0c93ecef20adbebd4e13a0",
          price: 3.95,
          skills: { criticalDamages: 0x1b },
        },
        {
          id: "6a0cb98ace82d1aed7f1d84c",
          price: 3.95,
          skills: { criticalDamages: 0x1c },
        },
        {
          id: "6a0cc38cdba93000acea03cc",
          price: 3.95,
          skills: { criticalDamages: 0x1c },
        },
        {
          id: "6a0cc3ccc74e15be778d064c",
          price: 3.95,
          skills: { criticalDamages: 0x1c },
        },
        {
          id: "6a0bc6a8b325b2be5268e50c",
          price: 3.99,
          skills: { criticalDamages: 0x1b },
        },
        {
          id: "6a07ad4c9993ebdf33f6cde8",
          price: 0x4,
          skills: { criticalDamages: 0x1b },
        },
        {
          id: "6a08137ddb40503d2bd16a4f",
          price: 0x4,
          skills: { criticalDamages: 0x1b },
        },
        {
          id: "6a08763f99ac96de391e64a1",
          price: 0x4,
          skills: { criticalDamages: 0x1b },
        },
        {
          id: "6a0998607891ce55a4c56c46",
          price: 0x4,
          skills: { criticalDamages: 0x1b },
        },
        {
          id: "6a0ccee897401bcd991c0449",
          price: 4.198,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0ccdafae0fa0c0e685355c",
          price: 4.2,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0ccdbd49bcf31f24ef14a2",
          price: 4.2,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0ccdcb43d331534b3b9e17",
          price: 4.2,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0ccde8c0ddcd988553e255",
          price: 4.2,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0ccdfb8a21a75b5def0251",
          price: 4.2,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0cce0545fb467b6a7fa8de",
          price: 4.2,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0cce1245fb467b6a7fb7ac",
          price: 4.2,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0cc40c5671c3f647e3d8de",
          price: 4.25,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0cad291acc9b089e0c947a",
          price: 4.3,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0cbbeb297b921deee55d5b",
          price: 4.3,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0b79a1408e51bdfbc48045",
          price: 4.4,
          skills: { criticalDamages: 0x1d },
        },
        {
          id: "6a0cb6db000753ef3ee8aa09",
          price: 5.94,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0cab20223c69742110e588",
          price: 5.95,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0cab2d4c1c1ac46bcf094c",
          price: 5.95,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0cab34a0cb19947a6f4850",
          price: 5.95,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0ca5026f520a36f6ff65d2",
          price: 0x6,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0c96e1218a2fe5f075f6a9",
          price: 6.38,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0c7df8c59101a560105560",
          price: 6.399,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0c7e05223c697421d90b04",
          price: 6.399,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0358d8f98f94ee29180711",
          price: 6.4,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0358dc62fe64ff0c7fdd05",
          price: 6.4,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0358dfd81d3f5d0dd967b4",
          price: 6.4,
          skills: { criticalDamages: 0x1e },
        },
        {
          id: "6a0358e39de5b6742bdf486b",
          price: 6.4,
          skills: { criticalDamages: 0x1e },
        },
      ],
      fetchedAt: "2026-05-19T20:58:20.879Z",
      passesUsed: 0x5,
    },
    helmet3: {
      n: 0x3c,
      price: {
        n: 0x3c,
        min: 12.999,
        p10: 13.9,
        p50: 20.99,
        p90: 29.9,
        max: 0x1e,
        mean: 21.049,
      },
      skills: {
        criticalDamages: {
          n: 0x3c,
          min: 0x1f,
          p10: 0x22,
          p50: 0x2c,
          p90: 0x31,
          max: 0x32,
          mean: 43.05,
        },
      },
      priceByRoll: [
        {
          skills: { criticalDamages: 0x31 },
          n: 0xb,
          minPrice: 28.85,
          p10Price: 28.877,
          p50Price: 29.5,
          sampleOfferId: "6a0cb3bf662a45b4911dcbeb",
        },
        {
          skills: { criticalDamages: 0x2c },
          n: 0x7,
          minPrice: 0x13,
          p10Price: 0x13,
          p50Price: 19.4,
          sampleOfferId: "6a0cc621396e7531ecc05d14",
        },
        {
          skills: { criticalDamages: 0x2f },
          n: 0x6,
          minPrice: 25.247,
          p10Price: 25.247,
          p50Price: 0x1b,
          sampleOfferId: "6a0cc4ac42c3954108f55cd9",
        },
        {
          skills: { criticalDamages: 0x30 },
          n: 0x6,
          minPrice: 26.1,
          p10Price: 26.1,
          p50Price: 26.3,
          sampleOfferId: "6a0cbfedd164a1cfbf506093",
        },
        {
          skills: { criticalDamages: 0x28 },
          n: 0x5,
          minPrice: 14.9,
          p10Price: 14.9,
          p50Price: 14.99,
          sampleOfferId: "6a0cc39844c156ae4b24bde4",
        },
        {
          skills: { criticalDamages: 0x29 },
          n: 0x4,
          minPrice: 14.87,
          p10Price: 14.87,
          p50Price: 14.99,
          sampleOfferId: "6a0cc926e3a8d77b22064a1a",
        },
        {
          skills: { criticalDamages: 0x22 },
          n: 0x3,
          minPrice: 12.999,
          p10Price: 12.999,
          p50Price: 13.75,
          sampleOfferId: "6a0cbfb3db9b5f8461eaf233",
        },
        {
          skills: { criticalDamages: 0x23 },
          n: 0x3,
          minPrice: 0xd,
          p10Price: 0xd,
          p50Price: 0xd,
          sampleOfferId: "6a0cbb4de788b380ec81e417",
        },
        {
          skills: { criticalDamages: 0x21 },
          n: 0x3,
          minPrice: 13.86,
          p10Price: 13.86,
          p50Price: 13.99,
          sampleOfferId: "6a0cbafe59dc7bdd6fd03631",
        },
        {
          skills: { criticalDamages: 0x2d },
          n: 0x3,
          minPrice: 20.99,
          p10Price: 20.99,
          p50Price: 21.781,
          sampleOfferId: "6a0cb28fc775007f7e4f0b51",
        },
        {
          skills: { criticalDamages: 0x1f },
          n: 0x2,
          minPrice: 13.5,
          p10Price: 13.5,
          p50Price: 13.9,
          sampleOfferId: "6a0cbaf8fa3d9a79ce779d65",
        },
        {
          skills: { criticalDamages: 0x27 },
          n: 0x2,
          minPrice: 14.9,
          p10Price: 14.9,
          p50Price: 14.999,
          sampleOfferId: "6a0cc35d54f591bf4ec5dce3",
        },
        {
          skills: { criticalDamages: 0x2e },
          n: 0x2,
          minPrice: 22.799,
          p10Price: 22.799,
          p50Price: 22.8,
          sampleOfferId: "6a0cc055218a2fe5f0acc6d8",
        },
        {
          skills: { criticalDamages: 0x25 },
          n: 0x1,
          minPrice: 13.99,
          p10Price: 13.99,
          p50Price: 13.99,
          sampleOfferId: "6a0cc31b3049671decfcb527",
        },
        {
          skills: { criticalDamages: 0x2a },
          n: 0x1,
          minPrice: 0xf,
          p10Price: 0xf,
          p50Price: 0xf,
          sampleOfferId: "6a0ccc0245fb467b6a7e56fc",
        },
        {
          skills: { criticalDamages: 0x32 },
          n: 0x1,
          minPrice: 0x1e,
          p10Price: 0x1e,
          p50Price: 0x1e,
          sampleOfferId: "6a0c9e84751be7d5db288be3",
        },
        {
          skills: { criticalDamages: 0x20 },
          n: 0x0,
          minPrice: 13.68,
          p10Price: 13.68,
          p50Price: 13.68,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x24 },
          n: 0x0,
          minPrice: 13.5,
          p10Price: 13.5,
          p50Price: 13.5,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x26 },
          n: 0x0,
          minPrice: 14.45,
          p10Price: 14.45,
          p50Price: 14.45,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x2b },
          n: 0x0,
          minPrice: 0x11,
          p10Price: 0x11,
          p50Price: 0x11,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0cbfb3db9b5f8461eaf233",
          price: 12.999,
          skills: { criticalDamages: 0x22 },
        },
        {
          id: "6a0cbb4de788b380ec81e417",
          price: 0xd,
          skills: { criticalDamages: 0x23 },
        },
        {
          id: "6a0cc460f50f7e1a0c7786ef",
          price: 0xd,
          skills: { criticalDamages: 0x23 },
        },
        {
          id: "6a0cbaf8fa3d9a79ce779d65",
          price: 13.5,
          skills: { criticalDamages: 0x1f },
        },
        {
          id: "6a0cb971332d5dda753aa32e",
          price: 13.75,
          skills: { criticalDamages: 0x22 },
        },
        {
          id: "6a0cbafe59dc7bdd6fd03631",
          price: 13.86,
          skills: { criticalDamages: 0x21 },
        },
        {
          id: "6a0ca23c751be7d5db2f9da5",
          price: 13.9,
          skills: { criticalDamages: 0x1f },
        },
        {
          id: "6a0cb9112038bc67f6f48901",
          price: 13.99,
          skills: { criticalDamages: 0x21 },
        },
        {
          id: "6a0cc31b3049671decfcb527",
          price: 13.99,
          skills: { criticalDamages: 0x25 },
        },
        {
          id: "6a0c9efb218a2fe5f083b66a",
          price: 0xe,
          skills: { criticalDamages: 0x21 },
        },
        {
          id: "6a0caf2c809396aab5077041",
          price: 0xe,
          skills: { criticalDamages: 0x22 },
        },
        {
          id: "6a0cb6320782276477cf6d0a",
          price: 0xe,
          skills: { criticalDamages: 0x23 },
        },
        {
          id: "6a0cc926e3a8d77b22064a1a",
          price: 14.87,
          skills: { criticalDamages: 0x29 },
        },
        {
          id: "6a0cc35d54f591bf4ec5dce3",
          price: 14.9,
          skills: { criticalDamages: 0x27 },
        },
        {
          id: "6a0cc39844c156ae4b24bde4",
          price: 14.9,
          skills: { criticalDamages: 0x28 },
        },
        {
          id: "6a0cc3c05cfd025f8432160a",
          price: 14.9,
          skills: { criticalDamages: 0x29 },
        },
        {
          id: "6a0cbb404c1c1ac46bde20f5",
          price: 14.98,
          skills: { criticalDamages: 0x28 },
        },
        {
          id: "6a0cb24859dc7bdd6fc983ca",
          price: 14.99,
          skills: { criticalDamages: 0x28 },
        },
        {
          id: "6a0cb310ae880baa0be9658a",
          price: 14.99,
          skills: { criticalDamages: 0x29 },
        },
        {
          id: "69fd87dcdf0f11f8898be653",
          price: 14.999,
          skills: { criticalDamages: 0x27 },
        },
        {
          id: "6a0ca80237311e064dfb00e3",
          price: 0xf,
          skills: { criticalDamages: 0x28 },
        },
        {
          id: "6a0cb1b259dc7bdd6fc8f4f0",
          price: 0xf,
          skills: { criticalDamages: 0x29 },
        },
        {
          id: "6a0ccc0245fb467b6a7e56fc",
          price: 0xf,
          skills: { criticalDamages: 0x2a },
        },
        {
          id: "6a0c8db7240c05c97f2beba7",
          price: 15.247,
          skills: { criticalDamages: 0x28 },
        },
        {
          id: "6a0cc621396e7531ecc05d14",
          price: 0x13,
          skills: { criticalDamages: 0x2c },
        },
        {
          id: "6a0cca0054b61a5c0947cc55",
          price: 0x13,
          skills: { criticalDamages: 0x2c },
        },
        {
          id: "6a0cc06b40469d638e4544e0",
          price: 19.399,
          skills: { criticalDamages: 0x2c },
        },
        {
          id: "6a0cb272ede0e7856a384f67",
          price: 19.4,
          skills: { criticalDamages: 0x2c },
        },
        {
          id: "6a0c597e54f591bf4e2d7176",
          price: 19.45,
          skills: { criticalDamages: 0x2c },
        },
        {
          id: "6a07035cafba17837c3f465e",
          price: 0x14,
          skills: { criticalDamages: 0x2c },
        },
        {
          id: "6a0cb28fc775007f7e4f0b51",
          price: 20.99,
          skills: { criticalDamages: 0x2d },
        },
        {
          id: "6a05f7f894e08b2367e73379",
          price: 0x15,
          skills: { criticalDamages: 0x2c },
        },
        {
          id: "6a0cb28754f591bf4ebc31e9",
          price: 21.781,
          skills: { criticalDamages: 0x2d },
        },
        {
          id: "6a08bf2e3f7357f1f217e052",
          price: 21.99,
          skills: { criticalDamages: 0x2d },
        },
        {
          id: "6a0cc055218a2fe5f0acc6d8",
          price: 22.799,
          skills: { criticalDamages: 0x2e },
        },
        {
          id: "6a0cb29f751be7d5db46672a",
          price: 22.8,
          skills: { criticalDamages: 0x2e },
        },
        {
          id: "6a0cc4ac42c3954108f55cd9",
          price: 25.247,
          skills: { criticalDamages: 0x2f },
        },
        {
          id: "6a0836263b53e75d80b3dd46",
          price: 25.3,
          skills: { criticalDamages: 0x2f },
        },
        {
          id: "6a07827917bdb004b945c861",
          price: 25.9,
          skills: { criticalDamages: 0x2f },
        },
        {
          id: "6a0cbfedd164a1cfbf506093",
          price: 26.1,
          skills: { criticalDamages: 0x30 },
        },
        {
          id: "6a0cbe69108199b6acc673c2",
          price: 26.23,
          skills: { criticalDamages: 0x30 },
        },
        {
          id: "6a0cb70cfa3d9a79ce74d896",
          price: 26.238,
          skills: { criticalDamages: 0x30 },
        },
        {
          id: "6a0c8d1e505754d69a1e4969",
          price: 26.3,
          skills: { criticalDamages: 0x30 },
        },
        {
          id: "6a0c7f58c5fa963059abca73",
          price: 26.5,
          skills: { criticalDamages: 0x30 },
        },
        {
          id: "6a07466b7ed5957924a0b547",
          price: 0x1b,
          skills: { criticalDamages: 0x2f },
        },
        {
          id: "6a074675d34a300ba19dcddb",
          price: 0x1b,
          skills: { criticalDamages: 0x30 },
        },
        {
          id: "6a074687210b031e3c5ed83e",
          price: 0x1b,
          skills: { criticalDamages: 0x2f },
        },
        {
          id: "69ee7a0fdae2ad07f87892cf",
          price: 28.699,
          skills: { criticalDamages: 0x2f },
        },
        {
          id: "6a0cb3bf662a45b4911dcbeb",
          price: 28.85,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0caed215139e66c9971d72",
          price: 28.877,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0746490ebce41c430b5996",
          price: 0x1d,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0caebe14c0a61282c2fbd6",
          price: 0x1d,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0cb366d4d89c0e917bb078",
          price: 0x1d,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0caedb751be7d5db4495d9",
          price: 29.5,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0ca6dd0450530a9a2eae2d",
          price: 29.9,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0ca6ec662a45b4910c63bf",
          price: 29.9,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0c7dd5f1ffc55224ebf399",
          price: 0x1e,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0c7de742c3954108aa9de7",
          price: 0x1e,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0c91033049671decc126ba",
          price: 0x1e,
          skills: { criticalDamages: 0x31 },
        },
        {
          id: "6a0c9e84751be7d5db288be3",
          price: 0x1e,
          skills: { criticalDamages: 0x32 },
        },
      ],
      fetchedAt: "2026-05-19T20:58:42.447Z",
      passesUsed: 0x5,
    },
    helmet4: {
      n: 0x3c,
      price: {
        n: 0x3c,
        min: 45.99,
        p10: 47.478,
        p50: 0x39,
        p90: 0x45,
        max: 73.49,
        mean: 57.094,
      },
      skills: {
        criticalDamages: {
          n: 0x3c,
          min: 0x47,
          p10: 0x4c,
          p50: 0x53,
          p90: 0x59,
          max: 0x5a,
          mean: 82.5,
        },
      },
      priceByRoll: [
        {
          skills: { criticalDamages: 0x4f },
          n: 0xc,
          minPrice: 50.849,
          p10Price: 50.85,
          p50Price: 0x33,
          sampleOfferId: "6a0cc29b44c156ae4b24746e",
        },
        {
          skills: { criticalDamages: 0x59 },
          n: 0xb,
          minPrice: 65.99,
          p10Price: 66.5,
          p50Price: 0x45,
          sampleOfferId: "6a0caca3d1c0c3cba741e1e0",
        },
        {
          skills: { criticalDamages: 0x53 },
          n: 0xa,
          minPrice: 56.399,
          p10Price: 56.4,
          p50Price: 56.999,
          sampleOfferId: "6a0cca04756ac85957bcc688",
        },
        {
          skills: { criticalDamages: 0x56 },
          n: 0x8,
          minPrice: 59.571,
          p10Price: 59.571,
          p50Price: 59.98,
          sampleOfferId: "6a0cca3b8804e8dcdd6a8528",
        },
        {
          skills: { criticalDamages: 0x4a },
          n: 0x3,
          minPrice: 0x2f,
          p10Price: 0x2f,
          p50Price: 0x2f,
          sampleOfferId: "6a0b26577f695dde2435a4c2",
        },
        {
          skills: { criticalDamages: 0x4c },
          n: 0x3,
          minPrice: 0x2f,
          p10Price: 0x2f,
          p50Price: 0x2f,
          sampleOfferId: "6a0b269b83dba73c6b0dcb59",
        },
        {
          skills: { criticalDamages: 0x4d },
          n: 0x3,
          minPrice: 47.478,
          p10Price: 47.478,
          p50Price: 47.478,
          sampleOfferId: "6a0abed120cb40d68b5ff4e2",
        },
        {
          skills: { criticalDamages: 0x57 },
          n: 0x3,
          minPrice: 59.99,
          p10Price: 59.99,
          p50Price: 0x3c,
          sampleOfferId: "6a0cc85883dea690bb515a07",
        },
        {
          skills: { criticalDamages: 0x47 },
          n: 0x2,
          minPrice: 45.99,
          p10Price: 45.99,
          p50Price: 47.999,
          sampleOfferId: "6a0cac39be10f3a837ebf963",
        },
        {
          skills: { criticalDamages: 0x54 },
          n: 0x2,
          minPrice: 57.99,
          p10Price: 57.99,
          p50Price: 57.99,
          sampleOfferId: "6a0ccb362969bdfe7a772f9e",
        },
        {
          skills: { criticalDamages: 0x4b },
          n: 0x1,
          minPrice: 47.986,
          p10Price: 47.986,
          p50Price: 47.986,
          sampleOfferId: "6a08c70265af4a3542575297",
        },
        {
          skills: { criticalDamages: 0x58 },
          n: 0x1,
          minPrice: 61.4,
          p10Price: 61.4,
          p50Price: 61.4,
          sampleOfferId: "6a0cc9a0966e3be55a580609",
        },
        {
          skills: { criticalDamages: 0x5a },
          n: 0x1,
          minPrice: 73.49,
          p10Price: 73.49,
          p50Price: 73.49,
          sampleOfferId: "6a0cc67a49bcf31f24ec777f",
        },
        {
          skills: { criticalDamages: 0x48 },
          n: 0x0,
          minPrice: 46.33,
          p10Price: 46.33,
          p50Price: 46.33,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x49 },
          n: 0x0,
          minPrice: 46.66,
          p10Price: 46.66,
          p50Price: 46.66,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x4e },
          n: 0x0,
          minPrice: 49.16,
          p10Price: 49.16,
          p50Price: 49.16,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x50 },
          n: 0x0,
          minPrice: 52.24,
          p10Price: 52.24,
          p50Price: 52.24,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x51 },
          n: 0x0,
          minPrice: 53.62,
          p10Price: 53.62,
          p50Price: 53.62,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x52 },
          n: 0x0,
          minPrice: 55.01,
          p10Price: 55.01,
          p50Price: 55.01,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x55 },
          n: 0x0,
          minPrice: 58.78,
          p10Price: 58.78,
          p50Price: 58.78,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0cac39be10f3a837ebf963",
          price: 45.99,
          skills: { criticalDamages: 0x47 },
        },
        {
          id: "6a0b26577f695dde2435a4c2",
          price: 0x2f,
          skills: { criticalDamages: 0x4a },
        },
        {
          id: "6a0b2665fd3e434451cff30c",
          price: 0x2f,
          skills: { criticalDamages: 0x4a },
        },
        {
          id: "6a0b266b83dba73c6b0d954a",
          price: 0x2f,
          skills: { criticalDamages: 0x4a },
        },
        {
          id: "6a0b269b83dba73c6b0dcb59",
          price: 0x2f,
          skills: { criticalDamages: 0x4c },
        },
        {
          id: "6a0b26a08461bd2b665aca8a",
          price: 0x2f,
          skills: { criticalDamages: 0x4c },
        },
        {
          id: "6a0abed120cb40d68b5ff4e2",
          price: 47.478,
          skills: { criticalDamages: 0x4d },
        },
        {
          id: "6a0abee91b6e17c3a38799a8",
          price: 47.478,
          skills: { criticalDamages: 0x4d },
        },
        {
          id: "6a0abf0887ed532c2dbc8a48",
          price: 47.478,
          skills: { criticalDamages: 0x4d },
        },
        {
          id: "6a08c70265af4a3542575297",
          price: 47.986,
          skills: { criticalDamages: 0x4b },
        },
        {
          id: "6a09cf6d65c79f8560fcf4c0",
          price: 47.99,
          skills: { criticalDamages: 0x4c },
        },
        {
          id: "6a0ccbaa43f9544b4e4be47f",
          price: 47.999,
          skills: { criticalDamages: 0x47 },
        },
        {
          id: "6a0cc29b44c156ae4b24746e",
          price: 50.849,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a0cbcbdc60b8bb4ec11c117",
          price: 50.85,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a0ca34fbe10f3a837d9e6fb",
          price: 50.899,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a0c9f00ce82d1aed7cdb7d0",
          price: 50.9,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a0c864bf50f7e1a0c36b2fe",
          price: 50.999,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a0c865308ed149c50d6d393",
          price: 50.999,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a0ba91163197734b1874283",
          price: 0x33,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a0c4447ce82d1aed7390e52",
          price: 0x34,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a09afad8704291254a35cec",
          price: 52.406,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a09bc197891ce55a4d4b6ff",
          price: 52.406,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a09bc3d6966c95148059085",
          price: 52.406,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a09bc430fdddf25aed489d4",
          price: 52.406,
          skills: { criticalDamages: 0x4f },
        },
        {
          id: "6a0cca04756ac85957bcc688",
          price: 56.399,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0cc04a000753ef3eee99fc",
          price: 56.4,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0cc053e6d9cc1268ce0bb3",
          price: 56.4,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0bd24487627b1abc4413fc",
          price: 56.5,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0b4204ca649e72afb36ca4",
          price: 56.599,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0b3bb3d6af95175f69ccfe",
          price: 56.999,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0b336a29e885d076f9de58",
          price: 0x39,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0b288d43d17239ce29b254",
          price: 57.96,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0b2808f5962e054aa8ca6e",
          price: 57.98,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0ccb362969bdfe7a772f9e",
          price: 57.99,
          skills: { criticalDamages: 0x54 },
        },
        {
          id: "6a0ccb3e32cc7eead9d11222",
          price: 57.99,
          skills: { criticalDamages: 0x54 },
        },
        {
          id: "6a0b0c5c9b83fa5368da8dd6",
          price: 0x3a,
          skills: { criticalDamages: 0x53 },
        },
        {
          id: "6a0cca3b8804e8dcdd6a8528",
          price: 59.571,
          skills: { criticalDamages: 0x56 },
        },
        {
          id: "6a0ca76259dc7bdd6fbc42b0",
          price: 59.7,
          skills: { criticalDamages: 0x56 },
        },
        {
          id: "6a0c6b54ae880baa0b85859c",
          price: 59.97,
          skills: { criticalDamages: 0x56 },
        },
        {
          id: "6a0c6b59ce82d1aed78eb1ca",
          price: 59.97,
          skills: { criticalDamages: 0x56 },
        },
        {
          id: "6a0bf909c3823f4ee49b6e45",
          price: 59.98,
          skills: { criticalDamages: 0x56 },
        },
        {
          id: "6a0bf9110aec4d10653e6ec9",
          price: 59.98,
          skills: { criticalDamages: 0x56 },
        },
        {
          id: "6a0cc85883dea690bb515a07",
          price: 59.99,
          skills: { criticalDamages: 0x57 },
        },
        {
          id: "6a0cc4c7108199b6acc87a28",
          price: 0x3c,
          skills: { criticalDamages: 0x57 },
        },
        {
          id: "6a0cc60797b8ca996457cba4",
          price: 0x3c,
          skills: { criticalDamages: 0x56 },
        },
        {
          id: "6a0c7b4e2dd0d0d7e588df40",
          price: 60.5,
          skills: { criticalDamages: 0x57 },
        },
        {
          id: "6a0cc9a0966e3be55a580609",
          price: 61.4,
          skills: { criticalDamages: 0x58 },
        },
        {
          id: "6a0b45f123c82e7304a3eed1",
          price: 61.48,
          skills: { criticalDamages: 0x56 },
        },
        {
          id: "6a0caca3d1c0c3cba741e1e0",
          price: 65.99,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0c86e707822764778c2989",
          price: 66.5,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0c8766e5afba85e78efae3",
          price: 66.999,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0c7ba615139e66c95cac6f",
          price: 0x43,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0bf00905eadb5141d64581",
          price: 0x44,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0b755921650257be38dc5f",
          price: 0x45,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0b90e143417f5479bc5de1",
          price: 0x45,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0c56aa22e727783bd33ec3",
          price: 0x45,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0a376479e713efacd4b8a6",
          price: 71.56,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0a160cf6787fe169feb816",
          price: 0x48,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a07933dd34a300ba10809b1",
          price: 72.8,
          skills: { criticalDamages: 0x59 },
        },
        {
          id: "6a0cc67a49bcf31f24ec777f",
          price: 73.49,
          skills: { criticalDamages: 0x5a },
        },
      ],
      fetchedAt: "2026-05-19T20:59:02.969Z",
      passesUsed: 0x5,
    },
    helmet5: {
      n: 0x30,
      price: {
        n: 0x30,
        min: 0x69,
        p10: 0x6b,
        p50: 113.86,
        p90: 163.499,
        max: 198.899,
        mean: 124.569,
      },
      skills: {
        criticalDamages: {
          n: 0x30,
          min: 0x5b,
          p10: 0x5f,
          p50: 0x69,
          p90: 0x6e,
          max: 0x6e,
          mean: 102.75,
        },
      },
      priceByRoll: [
        {
          skills: { criticalDamages: 0x6e },
          n: 0xc,
          minPrice: 0x94,
          p10Price: 149.99,
          p50Price: 156.99,
          sampleOfferId: "6a0cc812ae0fa0c0e6832b3c",
        },
        {
          skills: { criticalDamages: 0x61 },
          n: 0x6,
          minPrice: 107.8,
          p10Price: 107.8,
          p50Price: 0x6e,
          sampleOfferId: "6a0cce006f6ec9352fb74b95",
        },
        {
          skills: { criticalDamages: 0x6a },
          n: 0x6,
          minPrice: 113.726,
          p10Price: 113.726,
          p50Price: 115.99,
          sampleOfferId: "6a0caa0c0782276477c17524",
        },
        {
          skills: { criticalDamages: 0x65 },
          n: 0x4,
          minPrice: 0x6f,
          p10Price: 0x6f,
          p50Price: 112.991,
          sampleOfferId: "6a0c2dabd164a1cfbf3b9348",
        },
        {
          skills: { criticalDamages: 0x69 },
          n: 0x4,
          minPrice: 113.564,
          p10Price: 113.564,
          p50Price: 116.831,
          sampleOfferId: "6a0cc1d13fd37b4c0b03e3d0",
        },
        {
          skills: { criticalDamages: 0x5f },
          n: 0x3,
          minPrice: 106.93,
          p10Price: 106.93,
          p50Price: 0x6b,
          sampleOfferId: "6a0cbe8ece82d1aed7f6367d",
        },
        {
          skills: { criticalDamages: 0x60 },
          n: 0x2,
          minPrice: 0x6c,
          p10Price: 0x6c,
          p50Price: 0x6f,
          sampleOfferId: "6a0ba9ca43f2a2b8315d028f",
        },
        {
          skills: { criticalDamages: 0x63 },
          n: 0x2,
          minPrice: 0x6c,
          p10Price: 0x6c,
          p50Price: 0x6d,
          sampleOfferId: "6a0bf38abc5490fc6b98c37a",
        },
        {
          skills: { criticalDamages: 0x64 },
          n: 0x2,
          minPrice: 108.9,
          p10Price: 108.9,
          p50Price: 0x70,
          sampleOfferId: "6a0cbb00f1ffc5522439b7d0",
        },
        {
          skills: { criticalDamages: 0x6b },
          n: 0x2,
          minPrice: 0x76,
          p10Price: 0x76,
          p50Price: 0x76,
          sampleOfferId: "6a0bbd55187b008995d354f0",
        },
        {
          skills: { criticalDamages: 0x5c },
          n: 0x1,
          minPrice: 0x69,
          p10Price: 0x69,
          p50Price: 0x69,
          sampleOfferId: "6a0cb65f8a830ebf76640f88",
        },
        {
          skills: { criticalDamages: 0x5d },
          n: 0x1,
          minPrice: 0x6a,
          p10Price: 0x6a,
          p50Price: 0x6a,
          sampleOfferId: "6a0cbb38223c6974211e8902",
        },
        {
          skills: { criticalDamages: 0x5b },
          n: 0x1,
          minPrice: 0x6d,
          p10Price: 0x6d,
          p50Price: 0x6d,
          sampleOfferId: "69f4a6e36c0cd12fc120c491",
        },
        {
          skills: { criticalDamages: 0x67 },
          n: 0x1,
          minPrice: 0x70,
          p10Price: 0x70,
          p50Price: 0x70,
          sampleOfferId: "6a0c67dcf1ffc55224c7b605",
        },
        {
          skills: { criticalDamages: 0x66 },
          n: 0x1,
          minPrice: 0x73,
          p10Price: 0x73,
          p50Price: 0x73,
          sampleOfferId: "69f7b7131aaf1f6c16c4bfda",
        },
        {
          skills: { criticalDamages: 0x5e },
          n: 0x0,
          minPrice: 106.47,
          p10Price: 106.47,
          p50Price: 106.47,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x62 },
          n: 0x0,
          minPrice: 107.9,
          p10Price: 107.9,
          p50Price: 107.9,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x68 },
          n: 0x0,
          minPrice: 112.78,
          p10Price: 112.78,
          p50Price: 112.78,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x6c },
          n: 0x0,
          minPrice: 0x80,
          p10Price: 0x80,
          p50Price: 0x80,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x6d },
          n: 0x0,
          minPrice: 0x8a,
          p10Price: 0x8a,
          p50Price: 0x8a,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0cb65f8a830ebf76640f88",
          price: 0x69,
          skills: { criticalDamages: 0x5c },
        },
        {
          id: "6a0cbb38223c6974211e8902",
          price: 0x6a,
          skills: { criticalDamages: 0x5d },
        },
        {
          id: "6a0cbe8ece82d1aed7f6367d",
          price: 106.93,
          skills: { criticalDamages: 0x5f },
        },
        {
          id: "6a0b34b835aa280c2a07e53e",
          price: 0x6b,
          skills: { criticalDamages: 0x5f },
        },
        {
          id: "6a0cbd57505754d69a4fff14",
          price: 0x6b,
          skills: { criticalDamages: 0x5f },
        },
        {
          id: "6a0cce006f6ec9352fb74b95",
          price: 107.8,
          skills: { criticalDamages: 0x61 },
        },
        {
          id: "6a0ba9ca43f2a2b8315d028f",
          price: 0x6c,
          skills: { criticalDamages: 0x60 },
        },
        {
          id: "6a0bf38abc5490fc6b98c37a",
          price: 0x6c,
          skills: { criticalDamages: 0x63 },
        },
        {
          id: "6a0cbb00f1ffc5522439b7d0",
          price: 108.9,
          skills: { criticalDamages: 0x64 },
        },
        {
          id: "6a0c3ae5662a45b4914aaf84",
          price: 108.911,
          skills: { criticalDamages: 0x61 },
        },
        {
          id: "69f4a6e36c0cd12fc120c491",
          price: 0x6d,
          skills: { criticalDamages: 0x5b },
        },
        {
          id: "6a0add0315fe389e53e00ace",
          price: 0x6d,
          skills: { criticalDamages: 0x63 },
        },
        {
          id: "69f8037c71859317e8e4f5e0",
          price: 109.8,
          skills: { criticalDamages: 0x61 },
        },
        {
          id: "6a0be75363e74c9be4294cc3",
          price: 0x6e,
          skills: { criticalDamages: 0x61 },
        },
        {
          id: "6a0c75fd108199b6ac78f9f6",
          price: 0x6e,
          skills: { criticalDamages: 0x61 },
        },
        {
          id: "6a01bb2024d136d64d892fca",
          price: 0x6f,
          skills: { criticalDamages: 0x61 },
        },
        {
          id: "6a09fdb47891ce55a4f46c75",
          price: 0x6f,
          skills: { criticalDamages: 0x60 },
        },
        {
          id: "6a0c2dabd164a1cfbf3b9348",
          price: 0x6f,
          skills: { criticalDamages: 0x65 },
        },
        {
          id: "6a0b37f8863b65c898133ba8",
          price: 0x70,
          skills: { criticalDamages: 0x64 },
        },
        {
          id: "6a0b5944fce09fd63a87c398",
          price: 0x70,
          skills: { criticalDamages: 0x65 },
        },
        {
          id: "6a0c67dcf1ffc55224c7b605",
          price: 0x70,
          skills: { criticalDamages: 0x67 },
        },
        {
          id: "69f8c8cb2a903d39b63fbbc9",
          price: 112.991,
          skills: { criticalDamages: 0x65 },
        },
        {
          id: "6a0cc1d13fd37b4c0b03e3d0",
          price: 113.564,
          skills: { criticalDamages: 0x69 },
        },
        {
          id: "6a0caa0c0782276477c17524",
          price: 113.726,
          skills: { criticalDamages: 0x6a },
        },
        {
          id: "69fe6183ea0464a34900545c",
          price: 113.86,
          skills: { criticalDamages: 0x65 },
        },
        {
          id: "6a0c64341acc9b089e9f2f74",
          price: 0x72,
          skills: { criticalDamages: 0x6a },
        },
        {
          id: "69f7b7131aaf1f6c16c4bfda",
          price: 0x73,
          skills: { criticalDamages: 0x66 },
        },
        {
          id: "6a0c12e3a136654b36f72e0a",
          price: 0x73,
          skills: { criticalDamages: 0x69 },
        },
        {
          id: "6a0bdcdea615362509baadc8",
          price: 115.99,
          skills: { criticalDamages: 0x6a },
        },
        {
          id: "6a0bdce8b325b2be526ad721",
          price: 115.99,
          skills: { criticalDamages: 0x6a },
        },
        {
          id: "6a0c11a241defd084723fdcb",
          price: 116.831,
          skills: { criticalDamages: 0x69 },
        },
        {
          id: "6a0b9d4d5ca2e6e21cc4fed8",
          price: 116.84,
          skills: { criticalDamages: 0x6a },
        },
        {
          id: "6a0b4e543de0de3be90ce164",
          price: 116.99,
          skills: { criticalDamages: 0x69 },
        },
        {
          id: "6a0b41c49dfac60eac38c68c",
          price: 0x75,
          skills: { criticalDamages: 0x6a },
        },
        {
          id: "6a0bbd55187b008995d354f0",
          price: 0x76,
          skills: { criticalDamages: 0x6b },
        },
        {
          id: "6a0bbd870ee509ace18ffee0",
          price: 0x76,
          skills: { criticalDamages: 0x6b },
        },
        {
          id: "6a0cc812ae0fa0c0e6832b3c",
          price: 0x94,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a0cc1e13fd37b4c0b042602",
          price: 149.99,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a0c9d5340469d638e1b1b48",
          price: 0x96,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a0b854730d0c98139005acb",
          price: 0x9a,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a0b854c30d0c98139006704",
          price: 0x9a,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a0b855030d0c98139007138",
          price: 0x9a,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a0992e30d9787f3fe07243d",
          price: 156.99,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a09b136d2540459b404a4b0",
          price: 163.499,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a06fc07b2829588743c6c2f",
          price: 163.8,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "69f3c7c6d4abaa5598eb8d37",
          price: 0xac,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "6a098e378b8fbe91f6401af5",
          price: 0xbe,
          skills: { criticalDamages: 0x6e },
        },
        {
          id: "69f249bc321a7db59a97383a",
          price: 198.899,
          skills: { criticalDamages: 0x6e },
        },
      ],
      fetchedAt: "2026-05-19T20:59:24.491Z",
      passesUsed: 0x5,
    },
    helmet6: {
      n: 0x1c,
      price: {
        n: 0x1c,
        min: 311.99,
        p10: 0x13d,
        p50: 0x1d6,
        p90: 534.652,
        max: 0x226,
        mean: 445.901,
      },
      skills: {
        criticalDamages: {
          n: 0x1c,
          min: 0x79,
          p10: 0x7b,
          p50: 0x91,
          p90: 0x96,
          max: 0x96,
          mean: 140.357,
        },
      },
      priceByRoll: [
        {
          skills: { criticalDamages: 0x96 },
          n: 0x5,
          minPrice: 0x212,
          p10Price: 0x212,
          p50Price: 0x215,
          sampleOfferId: "6a0c8382d164a1cfbf08513f",
        },
        {
          skills: { criticalDamages: 0x91 },
          n: 0x4,
          minPrice: 0x181,
          p10Price: 0x181,
          p50Price: 0x1d6,
          sampleOfferId: "69ff0f6d6253886e7cf1fdc4",
        },
        {
          skills: { criticalDamages: 0x95 },
          n: 0x3,
          minPrice: 0x201,
          p10Price: 0x201,
          p50Price: 514.85,
          sampleOfferId: "6a0c795714c0a61282869277",
        },
        {
          skills: { criticalDamages: 0x8e },
          n: 0x2,
          minPrice: 0x17b,
          p10Price: 0x17b,
          p50Price: 0x17c,
          sampleOfferId: "6a0cbb1d556106fb6099036b",
        },
        {
          skills: { criticalDamages: 0x79 },
          n: 0x2,
          minPrice: 0x180,
          p10Price: 0x180,
          p50Price: 419.901,
          sampleOfferId: "69ce2b3337d1c03f3127fbb6",
        },
        {
          skills: { criticalDamages: 0x90 },
          n: 0x2,
          minPrice: 0x1a4,
          p10Price: 0x1a4,
          p50Price: 0x1e0,
          sampleOfferId: "69f8b761a48a2b7bac096653",
        },
        {
          skills: { criticalDamages: 0x7b },
          n: 0x1,
          minPrice: 311.99,
          p10Price: 311.99,
          p50Price: 311.99,
          sampleOfferId: "6a017ac4001515c98f65f347",
        },
        {
          skills: { criticalDamages: 0x7c },
          n: 0x1,
          minPrice: 316.832,
          p10Price: 316.832,
          p50Price: 316.832,
          sampleOfferId: "6a0c3ba454f591bf4ed696c7",
        },
        {
          skills: { criticalDamages: 0x81 },
          n: 0x1,
          minPrice: 0x13d,
          p10Price: 0x13d,
          p50Price: 0x13d,
          sampleOfferId: "6a0a010fa29ee51449836a65",
        },
        {
          skills: { criticalDamages: 0x84 },
          n: 0x1,
          minPrice: 0x17c,
          p10Price: 0x17c,
          p50Price: 0x17c,
          sampleOfferId: "69f8276ab6b8b1b7b714d3fa",
        },
        {
          skills: { criticalDamages: 0x80 },
          n: 0x1,
          minPrice: 0x186,
          p10Price: 0x186,
          p50Price: 0x186,
          sampleOfferId: "69f5b53dabec3071c15f1343",
        },
        {
          skills: { criticalDamages: 0x82 },
          n: 0x1,
          minPrice: 0x190,
          p10Price: 0x190,
          p50Price: 0x190,
          sampleOfferId: "69ecac5c6f56b9dec706a226",
        },
        {
          skills: { criticalDamages: 0x8a },
          n: 0x1,
          minPrice: 0x190,
          p10Price: 0x190,
          p50Price: 0x190,
          sampleOfferId: "69f54cbdcfc0e38b71275ca9",
        },
        {
          skills: { criticalDamages: 0x92 },
          n: 0x1,
          minPrice: 0x1e0,
          p10Price: 0x1e0,
          p50Price: 0x1e0,
          sampleOfferId: "6a0457af9683831f14537902",
        },
        {
          skills: { criticalDamages: 0x8d },
          n: 0x1,
          minPrice: 0x1e5,
          p10Price: 0x1e5,
          p50Price: 0x1e5,
          sampleOfferId: "69d247b6edc2da86577df6d7",
        },
        {
          skills: { criticalDamages: 0x94 },
          n: 0x1,
          minPrice: 0x220,
          p10Price: 0x220,
          p50Price: 0x220,
          sampleOfferId: "69ee944cf9eea05a164c0336",
        },
        {
          skills: { criticalDamages: 0x7a },
          n: 0x0,
          minPrice: 0x15c,
          p10Price: 0x15c,
          p50Price: 0x15c,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x7d },
          n: 0x0,
          minPrice: 335.12,
          p10Price: 335.12,
          p50Price: 335.12,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x7e },
          n: 0x0,
          minPrice: 353.42,
          p10Price: 353.42,
          p50Price: 353.42,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x7f },
          n: 0x0,
          minPrice: 371.71,
          p10Price: 371.71,
          p50Price: 371.71,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x83 },
          n: 0x0,
          minPrice: 0x186,
          p10Price: 0x186,
          p50Price: 0x186,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x85 },
          n: 0x0,
          minPrice: 383.33,
          p10Price: 383.33,
          p50Price: 383.33,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x86 },
          n: 0x0,
          minPrice: 386.67,
          p10Price: 386.67,
          p50Price: 386.67,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x87 },
          n: 0x0,
          minPrice: 0x186,
          p10Price: 0x186,
          p50Price: 0x186,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x88 },
          n: 0x0,
          minPrice: 393.33,
          p10Price: 393.33,
          p50Price: 393.33,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x89 },
          n: 0x0,
          minPrice: 396.67,
          p10Price: 396.67,
          p50Price: 396.67,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x8b },
          n: 0x0,
          minPrice: 428.33,
          p10Price: 428.33,
          p50Price: 428.33,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x8c },
          n: 0x0,
          minPrice: 456.67,
          p10Price: 456.67,
          p50Price: 456.67,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x8f },
          n: 0x0,
          minPrice: 399.5,
          p10Price: 399.5,
          p50Price: 399.5,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { criticalDamages: 0x93 },
          n: 0x0,
          minPrice: 0x200,
          p10Price: 0x200,
          p50Price: 0x200,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a017ac4001515c98f65f347",
          price: 311.99,
          skills: { criticalDamages: 0x7b },
        },
        {
          id: "6a0c3ba454f591bf4ed696c7",
          price: 316.832,
          skills: { criticalDamages: 0x7c },
        },
        {
          id: "6a0a010fa29ee51449836a65",
          price: 0x13d,
          skills: { criticalDamages: 0x81 },
        },
        {
          id: "6a0cbb1d556106fb6099036b",
          price: 0x17b,
          skills: { criticalDamages: 0x8e },
        },
        {
          id: "69f8276ab6b8b1b7b714d3fa",
          price: 0x17c,
          skills: { criticalDamages: 0x84 },
        },
        {
          id: "6a0c7155556106fb604e769c",
          price: 0x17c,
          skills: { criticalDamages: 0x8e },
        },
        {
          id: "69ce2b3337d1c03f3127fbb6",
          price: 0x180,
          skills: { criticalDamages: 0x79 },
        },
        {
          id: "69ff0f6d6253886e7cf1fdc4",
          price: 0x181,
          skills: { criticalDamages: 0x91 },
        },
        {
          id: "69f5b53dabec3071c15f1343",
          price: 0x186,
          skills: { criticalDamages: 0x80 },
        },
        {
          id: "69ecac5c6f56b9dec706a226",
          price: 0x190,
          skills: { criticalDamages: 0x82 },
        },
        {
          id: "69f54cbdcfc0e38b71275ca9",
          price: 0x190,
          skills: { criticalDamages: 0x8a },
        },
        {
          id: "6996f2a981d760efe7d4ec6b",
          price: 419.901,
          skills: { criticalDamages: 0x79 },
        },
        {
          id: "69f8b761a48a2b7bac096653",
          price: 0x1a4,
          skills: { criticalDamages: 0x90 },
        },
        {
          id: "69fa4fe3e0ac9fd18cc1b1b4",
          price: 0x1bc,
          skills: { criticalDamages: 0x91 },
        },
        {
          id: "6a05555334984e6fc923e78e",
          price: 0x1d6,
          skills: { criticalDamages: 0x91 },
        },
        {
          id: "6a06a51f632c37fc23a3304c",
          price: 0x1d6,
          skills: { criticalDamages: 0x91 },
        },
        {
          id: "69feece550abe4f82b71d40d",
          price: 0x1e0,
          skills: { criticalDamages: 0x90 },
        },
        {
          id: "6a0457af9683831f14537902",
          price: 0x1e0,
          skills: { criticalDamages: 0x92 },
        },
        {
          id: "69d247b6edc2da86577df6d7",
          price: 0x1e5,
          skills: { criticalDamages: 0x8d },
        },
        {
          id: "6a0c795714c0a61282869277",
          price: 0x201,
          skills: { criticalDamages: 0x95 },
        },
        {
          id: "6a05beda428f1f3693b0cbee",
          price: 514.85,
          skills: { criticalDamages: 0x95 },
        },
        {
          id: "6a04579c2475dd332555cce7",
          price: 0x208,
          skills: { criticalDamages: 0x95 },
        },
        {
          id: "6a0c8382d164a1cfbf08513f",
          price: 0x212,
          skills: { criticalDamages: 0x96 },
        },
        {
          id: "6a0a60662881254fe023a971",
          price: 532.999,
          skills: { criticalDamages: 0x96 },
        },
        {
          id: "6a09e0696785c036a333fa9c",
          price: 0x215,
          skills: { criticalDamages: 0x96 },
        },
        {
          id: "6a06c439cc3c56d5a08bd3ab",
          price: 534.652,
          skills: { criticalDamages: 0x96 },
        },
        {
          id: "69ee944cf9eea05a164c0336",
          price: 0x220,
          skills: { criticalDamages: 0x94 },
        },
        {
          id: "69fb17a3bb1d7d6e7f759da6",
          price: 0x226,
          skills: { criticalDamages: 0x96 },
        },
      ],
      fetchedAt: "2026-05-19T20:59:45.976Z",
      passesUsed: 0x5,
    },
    chest1: {
      n: 0x20,
      price: {
        n: 0x20,
        min: 1.277,
        p10: 1.28,
        p50: 1.349,
        p90: 1.42,
        max: 1.42,
        mean: 1.338,
      },
      skills: {
        armor: {
          n: 0x20,
          min: 0x1,
          p10: 0x1,
          p50: 0x4,
          p90: 0x5,
          max: 0x5,
          mean: 3.469,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x5 },
          n: 0xc,
          minPrice: 1.28,
          p10Price: 1.38,
          p50Price: 1.383,
          sampleOfferId: "6a0ccf29756ac85957bfcbac",
        },
        {
          skills: { armor: 0x1 },
          n: 0x6,
          minPrice: 1.277,
          p10Price: 1.277,
          p50Price: 1.299,
          sampleOfferId: "6a0c9cfe332d5dda7510d54d",
        },
        {
          skills: { armor: 0x4 },
          n: 0x6,
          minPrice: 1.3,
          p10Price: 1.3,
          p50Price: 1.349,
          sampleOfferId: "6a0cc8b754b61a5c094706fa",
        },
        {
          skills: { armor: 0x3 },
          n: 0x5,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.3,
          sampleOfferId: "6a0ccef38c09c5884ef3d3d1",
        },
        {
          skills: { armor: 0x2 },
          n: 0x3,
          minPrice: 1.28,
          p10Price: 1.28,
          p50Price: 1.3,
          sampleOfferId: "6a0c9d0bf1ffc55224130a83",
        },
      ],
      offers: [
        {
          id: "6a0c9cfe332d5dda7510d54d",
          price: 1.277,
          skills: { armor: 0x1 },
        },
        { id: "6a0c9d0bf1ffc55224130a83", price: 1.28, skills: { armor: 0x2 } },
        { id: "6a0cc54e690e0fe480c13484", price: 1.28, skills: { armor: 0x1 } },
        { id: "6a0ccef38c09c5884ef3d3d1", price: 1.28, skills: { armor: 0x3 } },
        { id: "6a0ccf29756ac85957bfcbac", price: 1.28, skills: { armor: 0x5 } },
        { id: "6a0c7f0222e727783b19cdf8", price: 1.29, skills: { armor: 0x1 } },
        {
          id: "6a0c7ed744c156ae4bd6898f",
          price: 1.299,
          skills: { armor: 0x1 },
        },
        {
          id: "6a0c9216751be7d5db1ae6ac",
          price: 1.299,
          skills: { armor: 0x3 },
        },
        { id: "6a0ae33150882ed698b60b4f", price: 1.3, skills: { armor: 0x2 } },
        { id: "6a0af7a6de39913fec2870f4", price: 1.3, skills: { armor: 0x1 } },
        { id: "6a0b08a3e3dda23acde36827", price: 1.3, skills: { armor: 0x1 } },
        { id: "6a0b0adecafe2e1d9395e3f2", price: 1.3, skills: { armor: 0x2 } },
        { id: "6a0ca042c775007f7e3546c8", price: 1.3, skills: { armor: 0x3 } },
        { id: "6a0ca04e256c6c9318ef5c1c", price: 1.3, skills: { armor: 0x3 } },
        { id: "6a0ca053256c6c9318ef6865", price: 1.3, skills: { armor: 0x3 } },
        { id: "6a0cc8b754b61a5c094706fa", price: 1.3, skills: { armor: 0x4 } },
        {
          id: "6a0cbedfa928e04202db12fa",
          price: 1.349,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0cbef20450530a9a48461b",
          price: 1.349,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0cbf01a928e04202db591c",
          price: 1.349,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0cbf0ea928e04202db5fe9",
          price: 1.349,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0cbf217410a291d753d673",
          price: 1.349,
          skills: { armor: 0x4 },
        },
        { id: "6a0c9610ddd9411a1fa75be5", price: 1.38, skills: { armor: 0x5 } },
        {
          id: "6a0c7859d164a1cfbffa7e06",
          price: 1.383,
          skills: { armor: 0x5 },
        },
        {
          id: "6a0c791244c156ae4bd07ee3",
          price: 1.383,
          skills: { armor: 0x5 },
        },
        {
          id: "6a0c7921218a2fe5f04fb700",
          price: 1.383,
          skills: { armor: 0x5 },
        },
        {
          id: "6a0c792e7410a291d7f904fc",
          price: 1.383,
          skills: { armor: 0x5 },
        },
        {
          id: "6a0ca3d91acc9b089efbd999",
          price: 1.383,
          skills: { armor: 0x5 },
        },
        { id: "6a0ca284662a45b491056154", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0ca284f1ffc552241d94ff", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0ca285f1ffc552241dc7c6", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0ca2861acc9b089efa2a3f", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0ca286385386c1e2abddb6", price: 1.42, skills: { armor: 0x5 } },
      ],
      fetchedAt: "2026-05-19T21:00:07.564Z",
      passesUsed: 0x5,
    },
    chest2: {
      n: 0x24,
      price: {
        n: 0x24,
        min: 3.82,
        p10: 3.82,
        p50: 3.875,
        p90: 4.4,
        max: 4.455,
        mean: 4.02,
      },
      skills: {
        armor: {
          n: 0x24,
          min: 0x6,
          p10: 0x7,
          p50: 0x9,
          p90: 0xa,
          max: 0xa,
          mean: 8.806,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x9 },
          n: 0xc,
          minPrice: 3.875,
          p10Price: 3.875,
          p50Price: 3.875,
          sampleOfferId: "6a0ca603de8f16bec47433c3",
        },
        {
          skills: { armor: 0xa },
          n: 0xc,
          minPrice: 4.2,
          p10Price: 4.29,
          p50Price: 4.39,
          sampleOfferId: "6a0caadb256c6c931802a732",
        },
        {
          skills: { armor: 0x8 },
          n: 0x7,
          minPrice: 3.82,
          p10Price: 3.82,
          p50Price: 3.82,
          sampleOfferId: "6a0c82fdf1ffc55224f130ef",
        },
        {
          skills: { armor: 0x7 },
          n: 0x3,
          minPrice: 3.82,
          p10Price: 3.82,
          p50Price: 3.84,
          sampleOfferId: "6a0c9065c59101a560228ee6",
        },
        {
          skills: { armor: 0x6 },
          n: 0x2,
          minPrice: 3.83,
          p10Price: 3.83,
          p50Price: 3.84,
          sampleOfferId: "6a0c9afd3fd37b4c0bd86bec",
        },
      ],
      offers: [
        { id: "6a0c82fdf1ffc55224f130ef", price: 3.82, skills: { armor: 0x8 } },
        { id: "6a0c8300385386c1e287a0c4", price: 3.82, skills: { armor: 0x8 } },
        { id: "6a0c8308d164a1cfbf0753ad", price: 3.82, skills: { armor: 0x8 } },
        { id: "6a0c9065c59101a560228ee6", price: 3.82, skills: { armor: 0x7 } },
        { id: "6a0ca2843049671decd5e7c2", price: 3.82, skills: { armor: 0x8 } },
        { id: "6a0ca285ce82d1aed7d37412", price: 3.82, skills: { armor: 0x8 } },
        { id: "6a0ca285ddd9411a1fbc9963", price: 3.82, skills: { armor: 0x8 } },
        { id: "6a0ca286218a2fe5f087b1e7", price: 3.82, skills: { armor: 0x8 } },
        { id: "6a0c9afd3fd37b4c0bd86bec", price: 3.83, skills: { armor: 0x6 } },
        { id: "6a0c31aa7410a291d74feb7f", price: 3.84, skills: { armor: 0x7 } },
        { id: "6a0c6d9337311e064dbf5112", price: 3.84, skills: { armor: 0x6 } },
        { id: "6a0c1ac49a3390d647d1acbb", price: 3.85, skills: { armor: 0x7 } },
        {
          id: "6a0ca603de8f16bec47433c3",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0ca609576934a156f0ee7a",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cb796d164a1cfbf482313",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cb79a44c156ae4b1e9e6d",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cb79e1acc9b089e16eebf",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cb7a11acc9b089e16f8ba",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cb7a61acc9b089e170486",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cb7a9ddd9411a1fd89222",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cb67ae788b380ec7f90f1",
          price: 3.899,
          skills: { armor: 0x9 },
        },
        { id: "6a0c3a1f218a2fe5f0b30c5f", price: 3.9, skills: { armor: 0x9 } },
        { id: "6a0c603242c395410876b198", price: 3.9, skills: { armor: 0x9 } },
        { id: "6a0c89c8256c6c9318d3773b", price: 3.9, skills: { armor: 0x9 } },
        { id: "6a0caadb256c6c931802a732", price: 4.2, skills: { armor: 0xa } },
        { id: "6a0ca284d4d89c0e9163fb23", price: 4.29, skills: { armor: 0xa } },
        { id: "6a0ca290a0cb19947a607aa8", price: 4.29, skills: { armor: 0xa } },
        { id: "6a0ca29e223c697421031d9b", price: 4.29, skills: { armor: 0xa } },
        { id: "6a0ca9745671c3f647c838c7", price: 4.29, skills: { armor: 0xa } },
        { id: "6a0ca285662a45b491056229", price: 4.35, skills: { armor: 0xa } },
        { id: "6a0c950fde8f16bec45c44a1", price: 4.39, skills: { armor: 0xa } },
        { id: "6a0c9414ae880baa0bb913d0", price: 4.4, skills: { armor: 0xa } },
        { id: "6a0ca25d22e727783b43179d", price: 4.4, skills: { armor: 0xa } },
        { id: "6a0cb2a0332d5dda7535acf2", price: 4.4, skills: { armor: 0xa } },
        { id: "6a0c39cf385386c1e2ec69ad", price: 4.45, skills: { armor: 0xa } },
        {
          id: "6a0c7af9232be789f164dab0",
          price: 4.455,
          skills: { armor: 0xa },
        },
      ],
      fetchedAt: "2026-05-19T21:00:28.138Z",
      passesUsed: 0x5,
    },
    chest3: {
      n: 0x38,
      price: {
        n: 0x38,
        min: 11.396,
        p10: 12.4,
        p50: 15.841,
        p90: 24.5,
        max: 24.5,
        mean: 17.212,
      },
      skills: {
        armor: {
          n: 0x38,
          min: 0xb,
          p10: 0xb,
          p50: 0xd,
          p90: 0xf,
          max: 0xf,
          mean: 13.143,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0xc },
          n: 0xc,
          minPrice: 0xc,
          p10Price: 12.8,
          p50Price: 0xd,
          sampleOfferId: "6a0ccd3cf16ff732f2a1d513",
        },
        {
          skills: { armor: 0xd },
          n: 0xc,
          minPrice: 15.74,
          p10Price: 15.75,
          p50Price: 15.841,
          sampleOfferId: "6a0cc85497401bcd99198224",
        },
        {
          skills: { armor: 0xe },
          n: 0xc,
          minPrice: 18.5,
          p10Price: 18.7,
          p50Price: 19.75,
          sampleOfferId: "6a0ccbdce3a8d77b2206e180",
        },
        {
          skills: { armor: 0xf },
          n: 0xc,
          minPrice: 22.792,
          p10Price: 22.8,
          p50Price: 24.5,
          sampleOfferId: "6a0ccc9605c368167a2a8894",
        },
        {
          skills: { armor: 0xb },
          n: 0x8,
          minPrice: 11.396,
          p10Price: 11.396,
          p50Price: 12.4,
          sampleOfferId: "6a0cca36e3f583c196c47a0a",
        },
      ],
      offers: [
        {
          id: "6a0cca36e3f583c196c47a0a",
          price: 11.396,
          skills: { armor: 0xb },
        },
        { id: "6a0cc9a6396e7531ecc263c0", price: 11.9, skills: { armor: 0xb } },
        { id: "6a0cbf7e4c1c1ac46be05bb6", price: 0xc, skills: { armor: 0xb } },
        { id: "6a0ccd3cf16ff732f2a1d513", price: 0xc, skills: { armor: 0xc } },
        { id: "6a0cb8cf556106fb60983a18", price: 12.3, skills: { armor: 0xb } },
        { id: "6a0cb8f22038bc67f6f453c7", price: 12.4, skills: { armor: 0xb } },
        {
          id: "6a0ca285576934a156eace0a",
          price: 12.44,
          skills: { armor: 0xb },
        },
        {
          id: "6a0c98fd122e7b34da8e97ff",
          price: 12.75,
          skills: { armor: 0xb },
        },
        {
          id: "6a0c9dbad1c0c3cba72d2836",
          price: 12.75,
          skills: { armor: 0xb },
        },
        { id: "6a0cb196809396aab50a2114", price: 12.8, skills: { armor: 0xc } },
        {
          id: "6a0cb1e114c0a61282c47d86",
          price: 12.87,
          skills: { armor: 0xc },
        },
        {
          id: "6a0cb1f95671c3f647d8ba67",
          price: 12.87,
          skills: { armor: 0xc },
        },
        { id: "6a0c98eb15139e66c97a0ab2", price: 12.9, skills: { armor: 0xc } },
        { id: "6a0ccbd845fb467b6a7ddf77", price: 12.9, skills: { armor: 0xc } },
        { id: "6a0cab8d809396aab50047bc", price: 0xd, skills: { armor: 0xc } },
        { id: "6a0cb035223c697421179332", price: 0xd, skills: { armor: 0xc } },
        {
          id: "6a075e6344cf9625ccf9c4e5",
          price: 13.28,
          skills: { armor: 0xc },
        },
        {
          id: "6a088db999fac5a0c1e03ce1",
          price: 13.761,
          skills: { armor: 0xc },
        },
        {
          id: "6a088dbf5a082b1ec35e13fd",
          price: 13.761,
          skills: { armor: 0xc },
        },
        {
          id: "6a088dc6351ad58a8f020ced",
          price: 13.761,
          skills: { armor: 0xc },
        },
        {
          id: "6a0cc85497401bcd99198224",
          price: 15.74,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cc2cd3049671decfc6da7",
          price: 15.75,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cc2d1a928e04202dd805c",
          price: 15.75,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cbe57c775007f7e54bc53",
          price: 15.83,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb728c60b8bb4ec0dd3e5",
          price: 15.839,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb684ddd9411a1fd7d585",
          price: 15.841,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb691576934a1560577eb",
          price: 15.841,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb696ef20adbebd7c74ed",
          price: 15.841,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb69cef20adbebd7c7917",
          price: 15.841,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb6a1ddd9411a1fd80183",
          price: 15.841,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cbc8afc0151746e35ec27",
          price: 15.841,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb2c8b09f9fd3d1d1fcb8",
          price: 15.899,
          skills: { armor: 0xd },
        },
        { id: "6a0ccbdce3a8d77b2206e180", price: 18.5, skills: { armor: 0xe } },
        { id: "6a0cc989bfbcfe6ade59b7da", price: 18.7, skills: { armor: 0xe } },
        { id: "6a0cc99ab22ddf41e9d9f039", price: 18.7, skills: { armor: 0xe } },
        { id: "6a0cc6efa42dc435c02fef3a", price: 18.9, skills: { armor: 0xe } },
        { id: "6a0cc6fb45fb467b6a7ac00d", price: 18.9, skills: { armor: 0xe } },
        { id: "6a0cc5b4a07764620030bc9f", price: 0x13, skills: { armor: 0xe } },
        {
          id: "6a0cc2da297b921deee85a08",
          price: 19.75,
          skills: { armor: 0xe },
        },
        {
          id: "6a0cb9ba122e7b34dab90bd6",
          price: 19.799,
          skills: { armor: 0xe },
        },
        {
          id: "6a0cb6f4c74e15be77883382",
          price: 19.849,
          skills: { armor: 0xe },
        },
        {
          id: "6a0cb651576934a15604dae4",
          price: 19.85,
          skills: { armor: 0xe },
        },
        {
          id: "6a0cb04ede8f16bec4890c6b",
          price: 19.899,
          skills: { armor: 0xe },
        },
        {
          id: "6a0cb15c690e0fe480b665d8",
          price: 19.899,
          skills: { armor: 0xe },
        },
        {
          id: "6a0ccc9605c368167a2a8894",
          price: 22.792,
          skills: { armor: 0xf },
        },
        { id: "6a0cb2315be702db83ea0128", price: 22.8, skills: { armor: 0xf } },
        { id: "6a077bfb38ad0966dea5c418", price: 22.9, skills: { armor: 0xf } },
        { id: "6a08a1b8b77b35ab7a02737d", price: 0x17, skills: { armor: 0xf } },
        {
          id: "6a0cc47e44c156ae4b250b9d",
          price: 24.455,
          skills: { armor: 0xf },
        },
        { id: "6a075e6f3371592191a4eb1a", price: 24.5, skills: { armor: 0xf } },
        { id: "6a075e8fd725935b76c150cf", price: 24.5, skills: { armor: 0xf } },
        { id: "6a075e979a6b113b4182b6b9", price: 24.5, skills: { armor: 0xf } },
        { id: "6a075ea736a3b105e65f7103", price: 24.5, skills: { armor: 0xf } },
        { id: "6a075eb036b85f48f79fc70f", price: 24.5, skills: { armor: 0xf } },
        { id: "6a0839b20af0a118670a4edb", price: 24.5, skills: { armor: 0xf } },
        { id: "6a0839bce1de82fdf8252c04", price: 24.5, skills: { armor: 0xf } },
      ],
      fetchedAt: "2026-05-19T21:00:49.716Z",
      passesUsed: 0x5,
    },
    chest4: {
      n: 0x3c,
      price: {
        n: 0x3c,
        min: 0x27,
        p10: 39.5,
        p50: 46.99,
        p90: 0x38,
        max: 0x39,
        mean: 46.989,
      },
      skills: {
        armor: {
          n: 0x3c,
          min: 0x15,
          p10: 0x16,
          p50: 0x1b,
          p90: 0x1e,
          max: 0x1e,
          mean: 26.75,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x1d },
          n: 0xc,
          minPrice: 50.396,
          p10Price: 50.4,
          p50Price: 50.88,
          sampleOfferId: "6a0ccdab0764f717fe50793d",
        },
        {
          skills: { armor: 0x1e },
          n: 0xc,
          minPrice: 55.71,
          p10Price: 55.75,
          p50Price: 0x38,
          sampleOfferId: "6a0cca6aae0fa0c0e684c5b5",
        },
        {
          skills: { armor: 0x19 },
          n: 0x9,
          minPrice: 40.59,
          p10Price: 40.59,
          p50Price: 41.5,
          sampleOfferId: "6a0ccddabd3cc7006e76a334",
        },
        {
          skills: { armor: 0x1b },
          n: 0x9,
          minPrice: 43.97,
          p10Price: 43.97,
          p50Price: 46.98,
          sampleOfferId: "6a0cbaf3e0bea66b39729e20",
        },
        {
          skills: { armor: 0x16 },
          n: 0x4,
          minPrice: 0x27,
          p10Price: 0x27,
          p50Price: 39.603,
          sampleOfferId: "6a0ccca1756ac85957beefaa",
        },
        {
          skills: { armor: 0x17 },
          n: 0x4,
          minPrice: 39.49,
          p10Price: 39.49,
          p50Price: 39.5,
          sampleOfferId: "6a0ccdeaae0fa0c0e6854727",
        },
        {
          skills: { armor: 0x15 },
          n: 0x3,
          minPrice: 39.472,
          p10Price: 39.472,
          p50Price: 39.5,
          sampleOfferId: "6a0cb2f922e727783b5da23f",
        },
        {
          skills: { armor: 0x1a },
          n: 0x3,
          minPrice: 41.99,
          p10Price: 41.99,
          p50Price: 41.998,
          sampleOfferId: "6a0ccdca32cc7eead9d1d19d",
        },
        {
          skills: { armor: 0x1c },
          n: 0x3,
          minPrice: 0x2f,
          p10Price: 0x2f,
          p50Price: 0x2f,
          sampleOfferId: "6a0c793fddd9411a1f7e892d",
        },
        {
          skills: { armor: 0x18 },
          n: 0x1,
          minPrice: 39.6,
          p10Price: 39.6,
          p50Price: 39.6,
          sampleOfferId: "6a0cb83d7c540e3a2511f1d5",
        },
      ],
      offers: [
        {
          id: "6a0ccca1756ac85957beefaa",
          price: 0x27,
          skills: { armor: 0x16 },
        },
        {
          id: "6a0cb632662a45b4911ec678",
          price: 39.2,
          skills: { armor: 0x16 },
        },
        {
          id: "6a0cb2f922e727783b5da23f",
          price: 39.472,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0ccdeaae0fa0c0e6854727",
          price: 39.49,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0c3d890450530a9a682315",
          price: 39.5,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0c91c5a0cb19947a482405",
          price: 39.5,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0c91c9748370ec8d6200c8",
          price: 39.5,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0c84c244c156ae4bdd052a",
          price: 39.549,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0cb83d7c540e3a2511f1d5",
          price: 39.6,
          skills: { armor: 0x18 },
        },
        {
          id: "6a0ba35bb8a66abeff6bb72c",
          price: 39.603,
          skills: { armor: 0x16 },
        },
        {
          id: "6a0b93d5f34c25bf64326fe4",
          price: 39.604,
          skills: { armor: 0x16 },
        },
        {
          id: "6a0b93e9d1745cf0cb02bb86",
          price: 39.604,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0ccddabd3cc7006e76a334",
          price: 40.59,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0ccc2c05c368167a29815a",
          price: 40.599,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0cae2d232be789f1a89a5b",
          price: 40.96,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0ca788232be789f19a9048",
          price: 40.98,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0c9cfd7410a291d72f085d",
          price: 41.5,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0c8665ddd9411a1f9150f2",
          price: 41.9,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0c8573ede0e7856afaa934",
          price: 41.98,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0c8597108199b6ac82e7f1",
          price: 41.98,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0b7406a38e29b6ddc76f1d",
          price: 41.99,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0ccdca32cc7eead9d1d19d",
          price: 41.99,
          skills: { armor: 0x1a },
        },
        {
          id: "6a0ccc6471a7dc4d0d5d61d8",
          price: 41.998,
          skills: { armor: 0x1a },
        },
        {
          id: "6a0c85875671c3f6479d6d0e",
          price: 41.999,
          skills: { armor: 0x1a },
        },
        {
          id: "6a0cbaf3e0bea66b39729e20",
          price: 43.97,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0cb140232be789f1abaa31",
          price: 44.99,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c5460ddd9411a1f3d8685",
          price: 45.4,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0b23ce92448f0b69ee8c1a",
          price: 46.98,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0b23df8f5d7a3480a92fbb",
          price: 46.98,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0b23ea23395e1953cbc22c",
          price: 46.98,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0b1e533e0e43f59531064f",
          price: 46.99,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c793fddd9411a1f7e892d",
          price: 0x2f,
          skills: { armor: 0x1c },
        },
        {
          id: "6a0cc1d5d164a1cfbf51c72e",
          price: 0x2f,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0cc61bfeede5ffab659e55",
          price: 0x2f,
          skills: { armor: 0x1c },
        },
        {
          id: "6a0cb7a6218a2fe5f0a8d067",
          price: 47.4,
          skills: { armor: 0x1c },
        },
        {
          id: "6a0a60c37891ce55a4138fd6",
          price: 47.498,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0ccdab0764f717fe50793d",
          price: 50.396,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0cc5bc966e3be55a565dc2",
          price: 50.4,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0ca7b9809396aab5f912cf",
          price: 50.69,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0ca30b3687d472c2f689e1",
          price: 50.699,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0ca055256c6c9318ef6d41",
          price: 50.7,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0c9bc459dc7bdd6fa829fc",
          price: 50.75,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0c77ed44c156ae4bcf3e20",
          price: 50.88,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0c044bba7bd6c74650daa9",
          price: 0x33,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0c089e6975ba3e9b90debf",
          price: 0x33,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0be539d90aa82f589e8c5b",
          price: 0x34,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0a79fb38013eb75b1c8d37",
          price: 52.97,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0a7af7df1736d41868563d",
          price: 52.97,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0cca6aae0fa0c0e684c5b5",
          price: 55.71,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c9bb61aca5eb348009cf9",
          price: 55.75,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c9bbb751be7d5db256e56",
          price: 55.75,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c94675cfd025f84f8f4f9",
          price: 55.99,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c85c35be702db83b1c236",
          price: 0x38,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c85cb08ed149c50d5d329",
          price: 0x38,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c8648cb6401cceae40722",
          price: 0x38,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c87c47c540e3a25ddde71",
          price: 56.44,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c11b0ae880baa0bc63494",
          price: 56.45,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c1e6722e727783b484b7d",
          price: 56.55,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c0e36bc32eb0815a770fe",
          price: 56.95,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c0e30bc32eb0815a76a8d",
          price: 0x39,
          skills: { armor: 0x1e },
        },
      ],
      fetchedAt: "2026-05-19T21:01:10.262Z",
      passesUsed: 0x5,
    },
    chest5: {
      n: 0x31,
      price: {
        n: 0x31,
        min: 0x67,
        p10: 0x69,
        p50: 110.98,
        p90: 129.996,
        max: 133.8,
        mean: 114.136,
      },
      skills: {
        armor: {
          n: 0x31,
          min: 0x24,
          p10: 0x25,
          p50: 0x2c,
          p90: 0x31,
          max: 0x32,
          mean: 44.286,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x2b },
          n: 0x8,
          minPrice: 107.99,
          p10Price: 107.99,
          p50Price: 109.9,
          sampleOfferId: "6a0cc2893fd37b4c0b054684",
        },
        {
          skills: { armor: 0x31 },
          n: 0x8,
          minPrice: 119.99,
          p10Price: 119.99,
          p50Price: 0x7b,
          sampleOfferId: "6a0cc1b2f50f7e1a0c765d8a",
        },
        {
          skills: { armor: 0x2c },
          n: 0x4,
          minPrice: 0x6c,
          p10Price: 0x6c,
          p50Price: 0x6e,
          sampleOfferId: "6a0cb631ede0e7856a3a6af3",
        },
        {
          skills: { armor: 0x2f },
          n: 0x4,
          minPrice: 0x72,
          p10Price: 0x72,
          p50Price: 0x73,
          sampleOfferId: "6a0b84455ed78df2c2e3ad44",
        },
        {
          skills: { armor: 0x30 },
          n: 0x4,
          minPrice: 116.535,
          p10Price: 116.535,
          p50Price: 116.8,
          sampleOfferId: "6a0caabd751be7d5db3d5714",
        },
        {
          skills: { armor: 0x32 },
          n: 0x4,
          minPrice: 131.98,
          p10Price: 131.98,
          p50Price: 132.9,
          sampleOfferId: "6a0cc4f5c74e15be778e5e04",
        },
        {
          skills: { armor: 0x24 },
          n: 0x3,
          minPrice: 0x67,
          p10Price: 0x67,
          p50Price: 103.99,
          sampleOfferId: "6a0ca934dc6b2f452a44f4c7",
        },
        {
          skills: { armor: 0x25 },
          n: 0x3,
          minPrice: 0x68,
          p10Price: 0x68,
          p50Price: 0x69,
          sampleOfferId: "6a0b7a9fc6da59e731e98793",
        },
        {
          skills: { armor: 0x26 },
          n: 0x3,
          minPrice: 104.99,
          p10Price: 104.99,
          p50Price: 0x69,
          sampleOfferId: "6a0ca051e5afba85e7a9f274",
        },
        {
          skills: { armor: 0x2a },
          n: 0x3,
          minPrice: 0x6b,
          p10Price: 0x6b,
          p50Price: 108.6,
          sampleOfferId: "6a0cbdf90782276477d49185",
        },
        {
          skills: { armor: 0x2e },
          n: 0x3,
          minPrice: 112.999,
          p10Price: 112.999,
          p50Price: 0x73,
          sampleOfferId: "6a0c2641ddd9411a1fc191d2",
        },
        {
          skills: { armor: 0x28 },
          n: 0x1,
          minPrice: 0x6b,
          p10Price: 0x6b,
          p50Price: 0x6b,
          sampleOfferId: "6a0b5c19440668aba19d7e83",
        },
        {
          skills: { armor: 0x29 },
          n: 0x1,
          minPrice: 108.33,
          p10Price: 108.33,
          p50Price: 108.33,
          sampleOfferId: "6a0b9d356975ba3e9b754569",
        },
        {
          skills: { armor: 0x27 },
          n: 0x0,
          minPrice: 0x6a,
          p10Price: 0x6a,
          p50Price: 0x6a,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { armor: 0x2d },
          n: 0x0,
          minPrice: 110.5,
          p10Price: 110.5,
          p50Price: 110.5,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0ca934dc6b2f452a44f4c7",
          price: 0x67,
          skills: { armor: 0x24 },
        },
        {
          id: "6a0b9cc22fbc884e1ce180e5",
          price: 103.99,
          skills: { armor: 0x24 },
        },
        {
          id: "6a0b7a9fc6da59e731e98793",
          price: 0x68,
          skills: { armor: 0x25 },
        },
        {
          id: "6a0ca051e5afba85e7a9f274",
          price: 104.99,
          skills: { armor: 0x26 },
        },
        {
          id: "6a0a19da69b4910b2581a6a1",
          price: 0x69,
          skills: { armor: 0x25 },
        },
        {
          id: "6a0b243cddf690072673f40a",
          price: 0x69,
          skills: { armor: 0x26 },
        },
        {
          id: "6a0cb5dcede0e7856a39f16b",
          price: 0x69,
          skills: { armor: 0x24 },
        },
        {
          id: "6a0a19d0ca9c9a320f3f6469",
          price: 0x6a,
          skills: { armor: 0x26 },
        },
        {
          id: "6a0cbaeda0cb19947a7b5a0f",
          price: 0x6a,
          skills: { armor: 0x25 },
        },
        {
          id: "6a0b5c19440668aba19d7e83",
          price: 0x6b,
          skills: { armor: 0x28 },
        },
        {
          id: "6a0cbdf90782276477d49185",
          price: 0x6b,
          skills: { armor: 0x2a },
        },
        {
          id: "6a0cc2893fd37b4c0b054684",
          price: 107.99,
          skills: { armor: 0x2b },
        },
        {
          id: "6a0cb631ede0e7856a3a6af3",
          price: 0x6c,
          skills: { armor: 0x2c },
        },
        {
          id: "6a0b9d356975ba3e9b754569",
          price: 108.33,
          skills: { armor: 0x29 },
        },
        {
          id: "6a0b4a35942a392e62431534",
          price: 108.6,
          skills: { armor: 0x2a },
        },
        {
          id: "6a0caa5b000753ef3ed8ee4e",
          price: 109.81,
          skills: { armor: 0x2c },
        },
        {
          id: "6a0c8e47c775007f7e23280c",
          price: 109.88,
          skills: { armor: 0x2b },
        },
        {
          id: "6a0c4750a928e0420216dbe1",
          price: 109.899,
          skills: { armor: 0x2b },
        },
        {
          id: "6a0b8775bc5490fc6b800511",
          price: 109.9,
          skills: { armor: 0x2b },
        },
        {
          id: "6a0b877f187b008995c91901",
          price: 109.9,
          skills: { armor: 0x2b },
        },
        {
          id: "6a0a1325d31b5748ed1ed736",
          price: 0x6e,
          skills: { armor: 0x2a },
        },
        {
          id: "6a0b2c3202790aa725d0ac38",
          price: 0x6e,
          skills: { armor: 0x2b },
        },
        {
          id: "6a0b8fe6c3823f4ee48aef52",
          price: 0x6e,
          skills: { armor: 0x2b },
        },
        {
          id: "6a0c858869769ff850046949",
          price: 0x6e,
          skills: { armor: 0x2c },
        },
        {
          id: "6a0c298a3049671decdefbd0",
          price: 110.98,
          skills: { armor: 0x2c },
        },
        {
          id: "6a0acd9fdf578f58ec75c51b",
          price: 110.99,
          skills: { armor: 0x2b },
        },
        {
          id: "6a0c2641ddd9411a1fc191d2",
          price: 112.999,
          skills: { armor: 0x2e },
        },
        {
          id: "6a0b84455ed78df2c2e3ad44",
          price: 0x72,
          skills: { armor: 0x2f },
        },
        {
          id: "6a0b37b71b5c26c6fa40a10b",
          price: 114.9,
          skills: { armor: 0x2f },
        },
        {
          id: "6a0a13816d5b34b17748c681",
          price: 0x73,
          skills: { armor: 0x2e },
        },
        {
          id: "6a0add261e0e870de8dcc408",
          price: 0x73,
          skills: { armor: 0x2f },
        },
        {
          id: "6a0a0f10d31b5748ed1dc4bf",
          price: 115.99,
          skills: { armor: 0x2e },
        },
        {
          id: "6a0caabd751be7d5db3d5714",
          price: 116.535,
          skills: { armor: 0x30 },
        },
        {
          id: "6a0caac5d1c0c3cba73f2584",
          price: 116.535,
          skills: { armor: 0x30 },
        },
        {
          id: "6a0bc6b20af439fc734dcd42",
          price: 116.8,
          skills: { armor: 0x30 },
        },
        {
          id: "6a0b8433408e51bdfbceaf98",
          price: 0x75,
          skills: { armor: 0x30 },
        },
        {
          id: "6a07f04cfede4068b5962a1f",
          price: 0x76,
          skills: { armor: 0x2f },
        },
        {
          id: "6a0cc1b2f50f7e1a0c765d8a",
          price: 119.99,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0af68b048f8e6e98c90a72",
          price: 0x78,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0a772e2adb948bb2b64d9a",
          price: 122.99,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0a77352adb948bb2b65260",
          price: 122.99,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0a08020fdddf25aeffe57a",
          price: 0x7b,
          skills: { armor: 0x31 },
        },
        {
          id: "6a09c9e3e02e9c4bac270962",
          price: 0x7c,
          skills: { armor: 0x31 },
        },
        {
          id: "6a05806327e5fa236f9b62fd",
          price: 0x7d,
          skills: { armor: 0x31 },
        },
        {
          id: "69fa19a8fb2eb5c95e990cce",
          price: 129.996,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0cc4f5c74e15be778e5e04",
          price: 131.98,
          skills: { armor: 0x32 },
        },
        {
          id: "6a0cc1a38cecb6e111dc052b",
          price: 131.99,
          skills: { armor: 0x32 },
        },
        {
          id: "6a0cbb549d22488fe50261cd",
          price: 132.9,
          skills: { armor: 0x32 },
        },
        {
          id: "6a0c7def42c3954108aab61a",
          price: 133.8,
          skills: { armor: 0x32 },
        },
      ],
      fetchedAt: "2026-05-19T21:01:30.846Z",
      passesUsed: 0x5,
    },
    chest6: {
      n: 0x1a,
      price: {
        n: 0x1a,
        min: 0x140,
        p10: 0x144,
        p50: 0x14f,
        p90: 0x179,
        max: 0x179,
        mean: 340.886,
      },
      skills: {
        armor: {
          n: 0x1a,
          min: 0x38,
          p10: 0x39,
          p50: 0x41,
          p90: 0x45,
          max: 0x46,
          mean: 63.808,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x43 },
          n: 0x3,
          minPrice: 336.9,
          p10Price: 336.9,
          p50Price: 0x151,
          sampleOfferId: "6a0ca0739d22488fe5e2a55b",
        },
        {
          skills: { armor: 0x42 },
          n: 0x3,
          minPrice: 0x152,
          p10Price: 0x152,
          p50Price: 0x158,
          sampleOfferId: "69fe2a541d1a279372e1f0c9",
        },
        {
          skills: { armor: 0x45 },
          n: 0x3,
          minPrice: 0x178,
          p10Price: 0x178,
          p50Price: 0x179,
          sampleOfferId: "6a0b6c2741de31c08ec7e9dc",
        },
        {
          skills: { armor: 0x40 },
          n: 0x2,
          minPrice: 0x140,
          p10Price: 0x140,
          p50Price: 0x14f,
          sampleOfferId: "6a0cb16db1fd467f7065f40c",
        },
        {
          skills: { armor: 0x39 },
          n: 0x2,
          minPrice: 0x142,
          p10Price: 0x142,
          p50Price: 0x144,
          sampleOfferId: "6a0c806a9d22488fe5bc6594",
        },
        {
          skills: { armor: 0x3a },
          n: 0x2,
          minPrice: 0x145,
          p10Price: 0x145,
          p50Price: 326.733,
          sampleOfferId: "6a09ee3b9c3fb9c4eb88c768",
        },
        {
          skills: { armor: 0x38 },
          n: 0x2,
          minPrice: 0x145,
          p10Price: 0x145,
          p50Price: 0x14a,
          sampleOfferId: "6a0c4459332d5dda757644a3",
        },
        {
          skills: { armor: 0x3f },
          n: 0x2,
          minPrice: 0x145,
          p10Price: 0x145,
          p50Price: 329.5,
          sampleOfferId: "6a0cbab0e788b380ec81811e",
        },
        {
          skills: { armor: 0x41 },
          n: 0x2,
          minPrice: 0x148,
          p10Price: 0x148,
          p50Price: 0x14a,
          sampleOfferId: "6a0ccaf9975eb3c31a19f259",
        },
        {
          skills: { armor: 0x44 },
          n: 0x2,
          minPrice: 0x16d,
          p10Price: 0x16d,
          p50Price: 0x179,
          sampleOfferId: "6a05e96fe04da347cef34cf5",
        },
        {
          skills: { armor: 0x3e },
          n: 0x1,
          minPrice: 0x145,
          p10Price: 0x145,
          p50Price: 0x145,
          sampleOfferId: "6a0c68b2ae880baa0b802f2c",
        },
        {
          skills: { armor: 0x3b },
          n: 0x1,
          minPrice: 0x147,
          p10Price: 0x147,
          p50Price: 0x147,
          sampleOfferId: "6a08c23351f29ba569ebd9fe",
        },
        {
          skills: { armor: 0x46 },
          n: 0x1,
          minPrice: 360.396,
          p10Price: 360.396,
          p50Price: 360.396,
          sampleOfferId: "6a0c2f63ce82d1aed7fb02af",
        },
        {
          skills: { armor: 0x3c },
          n: 0x0,
          minPrice: 326.33,
          p10Price: 326.33,
          p50Price: 326.33,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { armor: 0x3d },
          n: 0x0,
          minPrice: 325.67,
          p10Price: 325.67,
          p50Price: 325.67,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0cb16db1fd467f7065f40c",
          price: 0x140,
          skills: { armor: 0x40 },
        },
        {
          id: "6a0c806a9d22488fe5bc6594",
          price: 0x142,
          skills: { armor: 0x39 },
        },
        {
          id: "6a0c797708ed149c50ce1ce0",
          price: 0x144,
          skills: { armor: 0x39 },
        },
        {
          id: "6a09ee3b9c3fb9c4eb88c768",
          price: 0x145,
          skills: { armor: 0x3a },
        },
        {
          id: "6a0c4459332d5dda757644a3",
          price: 0x145,
          skills: { armor: 0x38 },
        },
        {
          id: "6a0c68b2ae880baa0b802f2c",
          price: 0x145,
          skills: { armor: 0x3e },
        },
        {
          id: "6a0cbab0e788b380ec81811e",
          price: 0x145,
          skills: { armor: 0x3f },
        },
        {
          id: "6a0c3b85d164a1cfbf61bf07",
          price: 326.733,
          skills: { armor: 0x3a },
        },
        {
          id: "6a08c23351f29ba569ebd9fe",
          price: 0x147,
          skills: { armor: 0x3b },
        },
        {
          id: "6a0ccaf9975eb3c31a19f259",
          price: 0x148,
          skills: { armor: 0x41 },
        },
        {
          id: "6a0c4c6544c156ae4b7d7f3f",
          price: 329.5,
          skills: { armor: 0x3f },
        },
        {
          id: "69f9bd1c216497557c37779e",
          price: 0x14a,
          skills: { armor: 0x38 },
        },
        {
          id: "6a0c54eca928e0420235680b",
          price: 0x14a,
          skills: { armor: 0x41 },
        },
        {
          id: "6a08c5bfab51bcb83b30cc7f",
          price: 0x14f,
          skills: { armor: 0x40 },
        },
        {
          id: "6a0ca0739d22488fe5e2a55b",
          price: 336.9,
          skills: { armor: 0x43 },
        },
        {
          id: "6a0c316c1acc9b089e1e60d3",
          price: 0x151,
          skills: { armor: 0x43 },
        },
        {
          id: "69fe2a541d1a279372e1f0c9",
          price: 0x152,
          skills: { armor: 0x42 },
        },
        {
          id: "6a09ee19416ba5c0e4819f05",
          price: 342.5,
          skills: { armor: 0x43 },
        },
        {
          id: "69f98b815944837e682cf353",
          price: 0x158,
          skills: { armor: 0x42 },
        },
        {
          id: "6a092561ff59164b5074dbda",
          price: 0x168,
          skills: { armor: 0x42 },
        },
        {
          id: "6a0c2f63ce82d1aed7fb02af",
          price: 360.396,
          skills: { armor: 0x46 },
        },
        {
          id: "6a05e96fe04da347cef34cf5",
          price: 0x16d,
          skills: { armor: 0x44 },
        },
        {
          id: "6a0b6c2741de31c08ec7e9dc",
          price: 0x178,
          skills: { armor: 0x45 },
        },
        {
          id: "6a0586aeb963aedb3ec0a775",
          price: 0x179,
          skills: { armor: 0x44 },
        },
        {
          id: "6a0a2a27f6787fe16909b3ec",
          price: 0x179,
          skills: { armor: 0x45 },
        },
        {
          id: "6a0bf359a615362509bf0987",
          price: 0x179,
          skills: { armor: 0x45 },
        },
      ],
      fetchedAt: "2026-05-19T21:01:51.410Z",
      passesUsed: 0x5,
    },
    pants1: {
      n: 0x27,
      price: {
        n: 0x27,
        min: 1.29,
        p10: 1.29,
        p50: 1.399,
        p90: 1.42,
        max: 1.42,
        mean: 1.367,
      },
      skills: {
        armor: {
          n: 0x27,
          min: 0x1,
          p10: 0x1,
          p50: 0x4,
          p90: 0x5,
          max: 0x5,
          mean: 3.59,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x5 },
          n: 0xd,
          minPrice: 1.299,
          p10Price: 1.42,
          p50Price: 1.42,
          sampleOfferId: "6a0c8300f1ffc55224f15cb1",
        },
        {
          skills: { armor: 0x4 },
          n: 0xc,
          minPrice: 1.32,
          p10Price: 1.32,
          p50Price: 1.399,
          sampleOfferId: "6a0c540c3049671dec569337",
        },
        {
          skills: { armor: 0x2 },
          n: 0x7,
          minPrice: 1.29,
          p10Price: 1.29,
          p50Price: 1.299,
          sampleOfferId: "6a0c7ec522e727783b1961e1",
        },
        {
          skills: { armor: 0x1 },
          n: 0x4,
          minPrice: 1.29,
          p10Price: 1.29,
          p50Price: 1.299,
          sampleOfferId: "6a0ccaea95498dd61da7e468",
        },
        {
          skills: { armor: 0x3 },
          n: 0x3,
          minPrice: 1.29,
          p10Price: 1.29,
          p50Price: 1.4,
          sampleOfferId: "6a0c9967556106fb606ff41c",
        },
      ],
      offers: [
        { id: "6a0c7ec522e727783b1961e1", price: 1.29, skills: { armor: 0x2 } },
        { id: "6a0c7eccd164a1cfbf008f76", price: 1.29, skills: { armor: 0x2 } },
        { id: "6a0c9967556106fb606ff41c", price: 1.29, skills: { armor: 0x3 } },
        { id: "6a0c9972dc6b2f452a2f3ddd", price: 1.29, skills: { armor: 0x2 } },
        { id: "6a0ccaea95498dd61da7e468", price: 1.29, skills: { armor: 0x1 } },
        {
          id: "6a0ac504655449e064b368bd",
          price: 1.299,
          skills: { armor: 0x1 },
        },
        {
          id: "6a0ac5327bf269c157961347",
          price: 1.299,
          skills: { armor: 0x2 },
        },
        {
          id: "6a0bd639408e51bdfbe4e016",
          price: 1.299,
          skills: { armor: 0x2 },
        },
        {
          id: "6a0c897d122e7b34da7cac04",
          price: 1.299,
          skills: { armor: 0x1 },
        },
        {
          id: "6a0c898b14c0a61282916978",
          price: 1.299,
          skills: { armor: 0x1 },
        },
        { id: "6a0a74928492607e0722b5ad", price: 1.3, skills: { armor: 0x2 } },
        { id: "6a0a865cc0fda04bf8d6bfc5", price: 1.3, skills: { armor: 0x2 } },
        { id: "6a0c540c3049671dec569337", price: 1.32, skills: { armor: 0x4 } },
        { id: "6a0c7057223c697421cec295", price: 1.32, skills: { armor: 0x4 } },
        {
          id: "6a0bf315ce961079c37c09a1",
          price: 1.395,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0bf31be6ea6fc5257fcf3e",
          price: 1.395,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0bf3223de0de3be967b26f",
          price: 1.395,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0ad6f116da7c3abc19787e",
          price: 1.399,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0ad6f87bf269c1579fc9a1",
          price: 1.399,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0ad6ff47de864ce423e790",
          price: 1.399,
          skills: { armor: 0x4 },
        },
        {
          id: "6a0ad709d59aaae6b7ce79a1",
          price: 1.399,
          skills: { armor: 0x4 },
        },
        { id: "69fae6e7a9d0219c88fd4157", price: 1.4, skills: { armor: 0x3 } },
        { id: "69fae7a5a1c66aad70561184", price: 1.4, skills: { armor: 0x3 } },
        { id: "69fee15027e4a10fedb6d0b7", price: 1.4, skills: { armor: 0x4 } },
        { id: "69fee16d6a5eb4deed7e9ae5", price: 1.4, skills: { armor: 0x4 } },
        { id: "6a01a71e90bb9a45d2af6740", price: 1.4, skills: { armor: 0x4 } },
        { id: "6a0c8300f1ffc55224f15cb1", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c830144c156ae4bdacb3e", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c8301576934a156c0f75d", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c83023049671decaf2532", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c8302de8f16bec44705e2", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c8305662a45b491dc9f29", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c83063049671decaf3b35", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c830642c3954108af79f0", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c8307ae880baa0ba72227", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0c8308576934a156c0fbe3", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0ca284ddd9411a1fbc989b", price: 1.42, skills: { armor: 0x5 } },
        { id: "6a0ca285576934a156eacdd8", price: 1.42, skills: { armor: 0x5 } },
        {
          id: "6a0ccfd0b142e10437197e99",
          price: 1.299,
          skills: { armor: 0x5 },
        },
      ],
      fetchedAt: "2026-05-19T21:02:11.969Z",
      passesUsed: 0x5,
    },
    pants2: {
      n: 0x23,
      price: {
        n: 0x23,
        min: 3.82,
        p10: 3.86,
        p50: 3.89,
        p90: 4.2,
        max: 4.2,
        mean: 3.967,
      },
      skills: {
        armor: {
          n: 0x23,
          min: 0x6,
          p10: 0x7,
          p50: 0x9,
          p90: 0xa,
          max: 0xa,
          mean: 8.8,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x9 },
          n: 0xc,
          minPrice: 3.87,
          p10Price: 3.874,
          p50Price: 3.89,
          sampleOfferId: "6a0ccc2f4c217f594d567d4d",
        },
        {
          skills: { armor: 0xa },
          n: 0xc,
          minPrice: 4.1,
          p10Price: 4.1,
          p50Price: 4.1,
          sampleOfferId: "6a0cabc32dd0d0d7e5c1a0fe",
        },
        {
          skills: { armor: 0x8 },
          n: 0x6,
          minPrice: 3.86,
          p10Price: 3.86,
          p50Price: 3.88,
          sampleOfferId: "6a0c1c96cecd1bef41e6d024",
        },
        {
          skills: { armor: 0x6 },
          n: 0x3,
          minPrice: 3.82,
          p10Price: 3.82,
          p50Price: 3.83,
          sampleOfferId: "6a0ccf62e3f583c196c77a73",
        },
        {
          skills: { armor: 0x7 },
          n: 0x2,
          minPrice: 3.85,
          p10Price: 3.85,
          p50Price: 3.86,
          sampleOfferId: "6a0c1c7c396e501f2afe0026",
        },
      ],
      offers: [
        { id: "6a0ccf62e3f583c196c77a73", price: 3.82, skills: { armor: 0x6 } },
        { id: "6a0cc67797b8ca9964589e82", price: 3.83, skills: { armor: 0x6 } },
        { id: "6a0c1c7c396e501f2afe0026", price: 3.85, skills: { armor: 0x7 } },
        { id: "6a0c13412af4bde90d469fd1", price: 3.86, skills: { armor: 0x7 } },
        { id: "6a0c1c96cecd1bef41e6d024", price: 3.86, skills: { armor: 0x8 } },
        {
          id: "6a0c4a320450530a9a91a0fc",
          price: 3.868,
          skills: { armor: 0x6 },
        },
        { id: "6a0ccc2f4c217f594d567d4d", price: 3.87, skills: { armor: 0x9 } },
        {
          id: "6a0cc93af16ff732f2a07df1",
          price: 3.874,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cc94c73ff458c4f3bc327",
          price: 3.874,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cc95e97401bcd991a2505",
          price: 3.874,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cb742a928e04202d687fe",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        {
          id: "6a0cba0ba928e04202d8191a",
          price: 3.875,
          skills: { armor: 0x9 },
        },
        { id: "6a0c1356acff46ba09aa3da7", price: 3.88, skills: { armor: 0x8 } },
        { id: "6a0c135cbc5bdb45a0b30801", price: 3.88, skills: { armor: 0x8 } },
        { id: "6a0c13629183a7b495045b20", price: 3.88, skills: { armor: 0x8 } },
        { id: "6a0c9d86ddd9411a1fb42f7d", price: 3.88, skills: { armor: 0x8 } },
        { id: "6a0c022817ef50f647d8fc85", price: 3.89, skills: { armor: 0x8 } },
        { id: "6a0cb57254f591bf4ebe115e", price: 3.89, skills: { armor: 0x9 } },
        {
          id: "6a0cb6386f520a36f616f91d",
          price: 3.899,
          skills: { armor: 0x9 },
        },
        { id: "6a0c32af218a2fe5f095e677", price: 3.9, skills: { armor: 0x9 } },
        { id: "6a0c3964ae880baa0b0952af", price: 3.9, skills: { armor: 0x9 } },
        { id: "6a0c39e0d164a1cfbf5bec77", price: 3.9, skills: { armor: 0x9 } },
        { id: "6a0c4257ce82d1aed7339daf", price: 3.9, skills: { armor: 0x9 } },
        { id: "6a0cabc32dd0d0d7e5c1a0fe", price: 4.1, skills: { armor: 0xa } },
        { id: "6a0cb681fa3d9a79ce74d445", price: 4.1, skills: { armor: 0xa } },
        { id: "6a0cb693223c6974211c14c7", price: 4.1, skills: { armor: 0xa } },
        { id: "6a0cb69f748370ec8d90e9c1", price: 4.1, skills: { armor: 0xa } },
        { id: "6a0cb7dc2038bc67f6f32559", price: 4.1, skills: { armor: 0xa } },
        { id: "6a0cb7e6db9b5f8461e5b426", price: 4.1, skills: { armor: 0xa } },
        { id: "6a0cc4c0e5afba85e7d06091", price: 4.1, skills: { armor: 0xa } },
        {
          id: "6a0caaa7d164a1cfbf3b6483",
          price: 4.199,
          skills: { armor: 0xa },
        },
        { id: "6a0c9bcd40469d638e199321", price: 4.2, skills: { armor: 0xa } },
        { id: "6a0c9bd47410a291d72cefeb", price: 4.2, skills: { armor: 0xa } },
        { id: "6a0c9be7d164a1cfbf23b2ad", price: 4.2, skills: { armor: 0xa } },
        { id: "6a0c9c470450530a9a1c5b48", price: 4.2, skills: { armor: 0xa } },
      ],
      fetchedAt: "2026-05-19T21:02:33.489Z",
      passesUsed: 0x5,
    },
    pants3: {
      n: 0x36,
      price: {
        n: 0x36,
        min: 11.89,
        p10: 11.9,
        p50: 0xf,
        p90: 21.18,
        max: 22.178,
        mean: 16.072,
      },
      skills: {
        armor: {
          n: 0x36,
          min: 0xb,
          p10: 0xb,
          p50: 0xd,
          p90: 0xf,
          max: 0xf,
          mean: 13.204,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0xd },
          n: 0xd,
          minPrice: 11.89,
          p10Price: 0xe,
          p50Price: 14.999,
          sampleOfferId: "6a0ccf978423aa74e2aba54a",
        },
        {
          skills: { armor: 0xc },
          n: 0xc,
          minPrice: 11.89,
          p10Price: 11.89,
          p50Price: 12.5,
          sampleOfferId: "6a0ccf8a8603209743d15123",
        },
        {
          skills: { armor: 0xf },
          n: 0xc,
          minPrice: 19.79,
          p10Price: 19.8,
          p50Price: 21.18,
          sampleOfferId: "6a0ccdd332cc7eead9d1da38",
        },
        {
          skills: { armor: 0xe },
          n: 0xb,
          minPrice: 0x11,
          p10Price: 17.5,
          p50Price: 18.38,
          sampleOfferId: "6a0ccba8bd3cc7006e73ca4d",
        },
        {
          skills: { armor: 0xb },
          n: 0x6,
          minPrice: 11.89,
          p10Price: 11.89,
          p50Price: 0xc,
          sampleOfferId: "6a0ccf79ae0fa0c0e685fadd",
        },
      ],
      offers: [
        {
          id: "6a0ccf79ae0fa0c0e685fadd",
          price: 11.89,
          skills: { armor: 0xb },
        },
        {
          id: "6a0ccf8a8603209743d15123",
          price: 11.89,
          skills: { armor: 0xc },
        },
        {
          id: "6a0ccf90ae0fa0c0e6865023",
          price: 11.89,
          skills: { armor: 0xc },
        },
        {
          id: "6a0ccf978423aa74e2aba54a",
          price: 11.89,
          skills: { armor: 0xd },
        },
        { id: "6a0cc7086f6ec9352fb35e98", price: 11.9, skills: { armor: 0xb } },
        { id: "6a0cc7f973ff458c4f3ad9a6", price: 11.9, skills: { armor: 0xb } },
        { id: "6a0cbf54000753ef3eee105e", price: 0xc, skills: { armor: 0xb } },
        { id: "6a0cc09fce82d1aed7f6ea7f", price: 0xc, skills: { armor: 0xb } },
        { id: "6a0cc1d33fd37b4c0b03e6d6", price: 0xc, skills: { armor: 0xb } },
        { id: "6a0cceb4a42dc435c032d251", price: 0xc, skills: { armor: 0xc } },
        { id: "6a0ccebc214927d5b775a180", price: 0xc, skills: { armor: 0xc } },
        {
          id: "6a0ccd4f8c09c5884ef1dbcf",
          price: 12.09,
          skills: { armor: 0xc },
        },
        { id: "6a0cbb16556106fb6098fdcd", price: 12.5, skills: { armor: 0xc } },
        { id: "6a0cbcf9385386c1e2cb6405", price: 12.5, skills: { armor: 0xc } },
        { id: "6a0cb8c86f520a36f61833b5", price: 12.7, skills: { armor: 0xc } },
        {
          id: "6a0cb4a8dc6b2f452a51c938",
          price: 12.87,
          skills: { armor: 0xc },
        },
        {
          id: "6a0b805df3a82d5c05b25d36",
          price: 12.871,
          skills: { armor: 0xc },
        },
        { id: "6a0a6225e0a2c66bb998dab7", price: 0xd, skills: { armor: 0xc } },
        { id: "6a0af01e209d0e2de912fe00", price: 0xd, skills: { armor: 0xc } },
        { id: "6a0cce9e45fb467b6a7fe4d3", price: 0xe, skills: { armor: 0xd } },
        {
          id: "6a0cb95d7410a291d74fee22",
          price: 14.75,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb6bc0450530a9a42e78a",
          price: 14.85,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb6c8297b921deee13e14",
          price: 14.85,
          skills: { armor: 0xd },
        },
        {
          id: "6a0cb6cf3049671decf29cb0",
          price: 14.85,
          skills: { armor: 0xd },
        },
        {
          id: "6a0754447b6ec482de44dcb4",
          price: 14.999,
          skills: { armor: 0xd },
        },
        {
          id: "6a07544e7b6ec482de4511d3",
          price: 14.999,
          skills: { armor: 0xd },
        },
        {
          id: "6a075456c35a9bf230de43ba",
          price: 14.999,
          skills: { armor: 0xd },
        },
        { id: "6a0aa7556cbb40c0370fb4f3", price: 0xf, skills: { armor: 0xd } },
        { id: "6a0b0dafd59aaae6b7e96c3b", price: 0xf, skills: { armor: 0xd } },
        { id: "6a0cb5140450530a9a4154ea", price: 0xf, skills: { armor: 0xd } },
        { id: "6a096a69e7e399d1ed5a23ba", price: 15.5, skills: { armor: 0xd } },
        { id: "6a0ccba8bd3cc7006e73ca4d", price: 0x11, skills: { armor: 0xe } },
        { id: "6a0ccfa4214927d5b7771d6c", price: 17.5, skills: { armor: 0xe } },
        {
          id: "6a0c9c6a122e7b34da924dfb",
          price: 17.75,
          skills: { armor: 0xe },
        },
        { id: "6a0c9c23fc0151746e0da2db", price: 0x12, skills: { armor: 0xe } },
        { id: "6a0c9c2b218a2fe5f07f0efe", price: 0x12, skills: { armor: 0xe } },
        {
          id: "6a0809bf7ed5957924479e6a",
          price: 18.38,
          skills: { armor: 0xe },
        },
        { id: "6a08286a0b669a20cad16d2b", price: 18.5, skills: { armor: 0xe } },
        { id: "6a074ae11f60645ae46c7ac9", price: 0x13, skills: { armor: 0xe } },
        { id: "6a074ae57ed5957924a89c9e", price: 0x13, skills: { armor: 0xe } },
        { id: "6a06e314a4caabd6195e4805", price: 19.7, skills: { armor: 0xe } },
        { id: "6a06e58e1f747605c01ab989", price: 19.7, skills: { armor: 0xe } },
        {
          id: "6a0ccdd332cc7eead9d1da38",
          price: 19.79,
          skills: { armor: 0xf },
        },
        { id: "6a0ccd8343d331534b3aeee7", price: 19.8, skills: { armor: 0xf } },
        { id: "6a0ccbb345fb467b6a7d2b89", price: 19.9, skills: { armor: 0xf } },
        {
          id: "6a0cb96944c156ae4b1f575b",
          price: 20.75,
          skills: { armor: 0xf },
        },
        { id: "6a0cb1ea5671c3f647d8a454", price: 21.1, skills: { armor: 0xf } },
        {
          id: "6a0c9c34751be7d5db261e5f",
          price: 21.178,
          skills: { armor: 0xf },
        },
        {
          id: "6a0c70ae44c156ae4bc7b14d",
          price: 21.18,
          skills: { armor: 0xf },
        },
        {
          id: "6a0c70bf662a45b491c45f90",
          price: 21.27,
          skills: { armor: 0xf },
        },
        {
          id: "6a0cbd933049671decfa1051",
          price: 22.176,
          skills: { armor: 0xf },
        },
        {
          id: "6a0c98d5a928e04202a888ef",
          price: 22.177,
          skills: { armor: 0xf },
        },
        {
          id: "6a0c7ffffc0151746ee86a59",
          price: 22.178,
          skills: { armor: 0xf },
        },
        {
          id: "6a0c8007d164a1cfbf0162db",
          price: 22.178,
          skills: { armor: 0xf },
        },
      ],
      fetchedAt: "2026-05-19T21:02:53.982Z",
      passesUsed: 0x5,
    },
    pants4: {
      n: 0x3c,
      price: {
        n: 0x3c,
        min: 35.99,
        p10: 36.95,
        p50: 42.999,
        p90: 55.9,
        max: 55.96,
        mean: 45.062,
      },
      skills: {
        armor: {
          n: 0x3c,
          min: 0x15,
          p10: 0x16,
          p50: 0x1b,
          p90: 0x1e,
          max: 0x1e,
          mean: 26.583,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x19 },
          n: 0xc,
          minPrice: 0x27,
          p10Price: 0x27,
          p50Price: 39.899,
          sampleOfferId: "6a0cb07d5be702db83e8d32d",
        },
        {
          skills: { armor: 0x1b },
          n: 0xc,
          minPrice: 42.8,
          p10Price: 42.9,
          p50Price: 42.999,
          sampleOfferId: "6a0cccf805c368167a2b65a1",
        },
        {
          skills: { armor: 0x1d },
          n: 0xc,
          minPrice: 48.866,
          p10Price: 48.889,
          p50Price: 49.998,
          sampleOfferId: "6a0cce1854b61a5c0949bbd5",
        },
        {
          skills: { armor: 0x1e },
          n: 0xc,
          minPrice: 0x37,
          p10Price: 55.5,
          p50Price: 55.9,
          sampleOfferId: "6a0cb26d6f520a36f6142b6a",
        },
        {
          skills: { armor: 0x15 },
          n: 0x6,
          minPrice: 35.99,
          p10Price: 35.99,
          p50Price: 0x24,
          sampleOfferId: "6a0c8d59ce82d1aed7b739bc",
        },
        {
          skills: { armor: 0x17 },
          n: 0x5,
          minPrice: 36.4,
          p10Price: 36.4,
          p50Price: 0x25,
          sampleOfferId: "6a0cc9e5c23414860265817d",
        },
        {
          skills: { armor: 0x16 },
          n: 0x1,
          minPrice: 37.591,
          p10Price: 37.591,
          p50Price: 37.591,
          sampleOfferId: "6a0c13e6fa5b17e89a6321d8",
        },
        {
          skills: { armor: 0x18 },
          n: 0x0,
          minPrice: 37.7,
          p10Price: 37.7,
          p50Price: 37.7,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { armor: 0x1a },
          n: 0x0,
          minPrice: 40.9,
          p10Price: 40.9,
          p50Price: 40.9,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { armor: 0x1c },
          n: 0x0,
          minPrice: 45.83,
          p10Price: 45.83,
          p50Price: 45.83,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0c8d59ce82d1aed7b739bc",
          price: 35.99,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0c85e1ede0e7856afad83b",
          price: 35.999,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0c6c33218a2fe5f03c6176",
          price: 0x24,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0c6c8ccb6401cceacf8f49",
          price: 0x24,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0cc9e5c23414860265817d",
          price: 36.4,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0cad85ea6f64b76760a612",
          price: 36.499,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0c256040469d638e1fa3f8",
          price: 36.95,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0c2756218a2fe5f0771c24",
          price: 36.95,
          skills: { armor: 0x15 },
        },
        {
          id: "6a0c971942c3954108c1b7a1",
          price: 0x25,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0cc1940782276477d6b73e",
          price: 0x25,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0c86fc54f591bf4e7dbcf0",
          price: 37.5,
          skills: { armor: 0x17 },
        },
        {
          id: "6a0c13e6fa5b17e89a6321d8",
          price: 37.591,
          skills: { armor: 0x16 },
        },
        {
          id: "6a0cb07d5be702db83e8d32d",
          price: 0x27,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0ccdcf8a21a75b5dee968d",
          price: 0x27,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0caece42c3954108e76400",
          price: 39.898,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0cad8ec59101a5604cca22",
          price: 39.899,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0cad960a1870c04d5a4f9b",
          price: 39.899,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0cada6a0cb19947a72b800",
          price: 39.899,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0cadb0223c69742115e2ba",
          price: 39.899,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0cadb7748370ec8d87ef0d",
          price: 39.899,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0cacfa14c0a61282c0b920",
          price: 39.9,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0ca327be10f3a837d8efa1",
          price: 39.95,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0ca20d690e0fe480a149fe",
          price: 39.98,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0c9497cb6401cceaf6f739",
          price: 39.99,
          skills: { armor: 0x19 },
        },
        {
          id: "6a0cccf805c368167a2b65a1",
          price: 42.8,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0cbe4dde8f16bec49222fe",
          price: 42.9,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0cba9b2038bc67f6f56431",
          price: 42.95,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0cadbf809396aab504f3f5",
          price: 42.99,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c85fa12a79ff23743cb5f",
          price: 42.999,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c8fcbc59101a56020837e",
          price: 42.999,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c8fd0a0cb19947a45c32e",
          price: 42.999,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c91d8b1fd467f70325cd0",
          price: 42.999,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c8586c59101a560170879",
          price: 0x2b,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c84e207822764778ad9e9",
          price: 43.6,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0c4d01ef20adbebddc379c",
          price: 43.69,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0bed0af34c25bf64439370",
          price: 43.999,
          skills: { armor: 0x1b },
        },
        {
          id: "6a0cce1854b61a5c0949bbd5",
          price: 48.866,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0cade3b09f9fd3d1cdc0d2",
          price: 48.889,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0cadeb232be789f1a80604",
          price: 48.889,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0c8fbe690e0fe4808faa85",
          price: 48.999,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0c8ae2e5afba85e7925307",
          price: 0x31,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0c7ffb0450530a9afb340f",
          price: 49.99,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0c7be68cecb6e11190deb8",
          price: 49.998,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0b240435578e687fbf4aae",
          price: 49.999,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0a5ec82881254fe020fd1e",
          price: 50.5,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0a7d1d0997de81fb0b70a3",
          price: 51.3,
          skills: { armor: 0x1d },
        },
        {
          id: "6a09ad3c6d5b34b177174ce5",
          price: 51.399,
          skills: { armor: 0x1d },
        },
        {
          id: "6a09b4d53d8cc85a13d53dd8",
          price: 51.45,
          skills: { armor: 0x1d },
        },
        {
          id: "6a0cb26d6f520a36f6142b6a",
          price: 0x37,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0cb8aec60b8bb4ec0e610e",
          price: 55.5,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0cae9e256c6c93180998b8",
          price: 55.77,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c94d48cecb6e111ac8132",
          price: 55.779,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c866937311e064dd3bc1f",
          price: 55.8,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c7f6e54f591bf4e74c9b8",
          price: 55.899,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c7d46751be7d5db060909",
          price: 55.9,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c17f9d0d4f98277eb53c6",
          price: 55.96,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c18144f0052a8b43e655a",
          price: 55.96,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c181ad0d4f98277eba082",
          price: 55.96,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c181e269398eb518f325d",
          price: 55.96,
          skills: { armor: 0x1e },
        },
        {
          id: "6a0c182737c89c70e84671b2",
          price: 55.96,
          skills: { armor: 0x1e },
        },
      ],
      fetchedAt: "2026-05-19T21:03:15.577Z",
      passesUsed: 0x5,
    },
    pants5: {
      n: 0x2e,
      price: {
        n: 0x2e,
        min: 0x68,
        p10: 0x69,
        p50: 111.88,
        p90: 0x78,
        max: 0x81,
        mean: 112.108,
      },
      skills: {
        armor: {
          n: 0x2e,
          min: 0x24,
          p10: 0x26,
          p50: 0x2f,
          p90: 0x31,
          max: 0x32,
          mean: 44.761,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x31 },
          n: 0xb,
          minPrice: 0x73,
          p10Price: 0x74,
          p50Price: 0x77,
          sampleOfferId: "6a0cb6d8ede0e7856a3aa65a",
        },
        {
          skills: { armor: 0x2f },
          n: 0x6,
          minPrice: 109.55,
          p10Price: 109.55,
          p50Price: 113.85,
          sampleOfferId: "6a0c8934108199b6ac856395",
        },
        {
          skills: { armor: 0x30 },
          n: 0x5,
          minPrice: 0x70,
          p10Price: 0x70,
          p50Price: 112.871,
          sampleOfferId: "6a0b840a408e51bdfbce77d3",
        },
        {
          skills: { armor: 0x2e },
          n: 0x4,
          minPrice: 0x69,
          p10Price: 0x69,
          p50Price: 0x6e,
          sampleOfferId: "6a0cca1764444f4a6273abe8",
        },
        {
          skills: { armor: 0x2a },
          n: 0x3,
          minPrice: 0x68,
          p10Price: 0x68,
          p50Price: 106.5,
          sampleOfferId: "6a0ccb8690c844f6a32da502",
        },
        {
          skills: { armor: 0x27 },
          n: 0x3,
          minPrice: 0x69,
          p10Price: 0x69,
          p50Price: 0x69,
          sampleOfferId: "6a0caf6f122e7b34dab26352",
        },
        {
          skills: { armor: 0x28 },
          n: 0x3,
          minPrice: 106.999,
          p10Price: 106.999,
          p50Price: 0x6b,
          sampleOfferId: "6a0cb06ba0cb19947a75e03b",
        },
        {
          skills: { armor: 0x25 },
          n: 0x2,
          minPrice: 104.99,
          p10Price: 104.99,
          p50Price: 0x69,
          sampleOfferId: "6a0b0ee8d71df1812a7cabdf",
        },
        {
          skills: { armor: 0x26 },
          n: 0x2,
          minPrice: 0x69,
          p10Price: 0x69,
          p50Price: 0x6a,
          sampleOfferId: "6a0cb6a959dc7bdd6fcc5deb",
        },
        {
          skills: { armor: 0x29 },
          n: 0x2,
          minPrice: 108.333,
          p10Price: 108.333,
          p50Price: 109.9,
          sampleOfferId: "6a0caaac69769ff850329050",
        },
        {
          skills: { armor: 0x2c },
          n: 0x2,
          minPrice: 0x6e,
          p10Price: 0x6e,
          p50Price: 0x70,
          sampleOfferId: "6a0ac13fe3dda23acdcb0b05",
        },
        {
          skills: { armor: 0x2d },
          n: 0x1,
          minPrice: 0x69,
          p10Price: 0x69,
          p50Price: 0x69,
          sampleOfferId: "6a0ccd2f18e314a921f923c6",
        },
        {
          skills: { armor: 0x24 },
          n: 0x1,
          minPrice: 105.5,
          p10Price: 105.5,
          p50Price: 105.5,
          sampleOfferId: "6a0cbb024c1c1ac46bddd1a5",
        },
        {
          skills: { armor: 0x32 },
          n: 0x1,
          minPrice: 0x81,
          p10Price: 0x81,
          p50Price: 0x81,
          sampleOfferId: "6a0cc31412a79ff2377bc0ee",
        },
        {
          skills: { armor: 0x2b },
          n: 0x0,
          minPrice: 0x6b,
          p10Price: 0x6b,
          p50Price: 0x6b,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0ccb8690c844f6a32da502",
          price: 0x68,
          skills: { armor: 0x2a },
        },
        {
          id: "6a0b0ee8d71df1812a7cabdf",
          price: 104.99,
          skills: { armor: 0x25 },
        },
        {
          id: "6a0c62997410a291d7d32e12",
          price: 0x69,
          skills: { armor: 0x25 },
        },
        {
          id: "6a0caf6f122e7b34dab26352",
          price: 0x69,
          skills: { armor: 0x27 },
        },
        {
          id: "6a0cb6a959dc7bdd6fcc5deb",
          price: 0x69,
          skills: { armor: 0x26 },
        },
        {
          id: "6a0cc1e36f520a36f61b4264",
          price: 0x69,
          skills: { armor: 0x27 },
        },
        {
          id: "6a0cca1764444f4a6273abe8",
          price: 0x69,
          skills: { armor: 0x2e },
        },
        {
          id: "6a0ccd2f18e314a921f923c6",
          price: 0x69,
          skills: { armor: 0x2d },
        },
        {
          id: "6a0cbb024c1c1ac46bddd1a5",
          price: 105.5,
          skills: { armor: 0x24 },
        },
        {
          id: "6a0ca2a697b18103803a70d0",
          price: 0x6a,
          skills: { armor: 0x26 },
        },
        {
          id: "6a0cbaecd164a1cfbf4c3348",
          price: 106.5,
          skills: { armor: 0x2a },
        },
        {
          id: "6a0ba8d42fbc884e1ce5606f",
          price: 106.989,
          skills: { armor: 0x27 },
        },
        {
          id: "6a0cb06ba0cb19947a75e03b",
          price: 106.999,
          skills: { armor: 0x28 },
        },
        {
          id: "6a0ca0ce4ed4e285c717048c",
          price: 0x6b,
          skills: { armor: 0x28 },
        },
        {
          id: "6a0cb249108199b6acbd1f4c",
          price: 0x6b,
          skills: { armor: 0x28 },
        },
        {
          id: "6a0caaac69769ff850329050",
          price: 108.333,
          skills: { armor: 0x29 },
        },
        {
          id: "6a0b3345ce36ac79a19bd034",
          price: 108.91,
          skills: { armor: 0x2e },
        },
        {
          id: "6a0c8934108199b6ac856395",
          price: 109.55,
          skills: { armor: 0x2f },
        },
        {
          id: "69f8fd13877f57fc0f3037c0",
          price: 109.9,
          skills: { armor: 0x29 },
        },
        {
          id: "6a0ad2ec17c315931b40b0a9",
          price: 109.99,
          skills: { armor: 0x2a },
        },
        {
          id: "6a0ac13fe3dda23acdcb0b05",
          price: 0x6e,
          skills: { armor: 0x2c },
        },
        {
          id: "6a0aeb2054f8d8ce3bf4b4e0",
          price: 0x6e,
          skills: { armor: 0x2e },
        },
        {
          id: "6a0b4775df580bbfb0077128",
          price: 110.999,
          skills: { armor: 0x2e },
        },
        {
          id: "6a0c26e6ae880baa0bd596ec",
          price: 111.88,
          skills: { armor: 0x2f },
        },
        {
          id: "6a0916112d2872ef55b56b1b",
          price: 0x70,
          skills: { armor: 0x2c },
        },
        {
          id: "6a0b5a6543f2a2b8313c4229",
          price: 0x70,
          skills: { armor: 0x2f },
        },
        {
          id: "6a0b840a408e51bdfbce77d3",
          price: 0x70,
          skills: { armor: 0x30 },
        },
        {
          id: "6a0c749d6f520a36f6c31944",
          price: 0x70,
          skills: { armor: 0x30 },
        },
        {
          id: "6a0b5ddde6ea6fc5253b4f9b",
          price: 112.871,
          skills: { armor: 0x30 },
        },
        {
          id: "6a0ae42fdc1d79f4ca3c1367",
          price: 113.761,
          skills: { armor: 0x30 },
        },
        {
          id: "6a09060317eb3bc746772045",
          price: 113.85,
          skills: { armor: 0x2f },
        },
        {
          id: "6a04b07b6ee46b6379a3dfb3",
          price: 113.9,
          skills: { armor: 0x2f },
        },
        {
          id: "69ffc31858f29c02aa5d8ed1",
          price: 0x73,
          skills: { armor: 0x2f },
        },
        {
          id: "6a0cb6d8ede0e7856a3aa65a",
          price: 0x73,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0a0ef9279099d3488aa4e9",
          price: 115.599,
          skills: { armor: 0x30 },
        },
        {
          id: "6a0cb6e914c0a61282c72651",
          price: 0x74,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0c9ee1e5afba85e7a84884",
          price: 0x75,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0c298aa928e04202bb0069",
          price: 0x76,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0a52ec4d77949a31548f3a",
          price: 118.999,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0be4225ed78df2c2f9d908",
          price: 0x77,
          skills: { armor: 0x31 },
        },
        {
          id: "6a094dfa9a1ffb1d13ad5a76",
          price: 0x78,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0be7136a85c92f53485701",
          price: 0x78,
          skills: { armor: 0x31 },
        },
        {
          id: "6a022a7eb3634959d10a1ef9",
          price: 122.999,
          skills: { armor: 0x31 },
        },
        {
          id: "69fe61088308c7f42e311358",
          price: 124.751,
          skills: { armor: 0x31 },
        },
        {
          id: "69f9c883a4dfd208e12fd72d",
          price: 128.712,
          skills: { armor: 0x31 },
        },
        {
          id: "6a0cc31412a79ff2377bc0ee",
          price: 0x81,
          skills: { armor: 0x32 },
        },
      ],
      fetchedAt: "2026-05-19T21:03:36.187Z",
      passesUsed: 0x5,
    },
    pants6: {
      n: 0x21,
      price: {
        n: 0x21,
        min: 0x138,
        p10: 0x13b,
        p50: 0x154,
        p90: 0x1d6,
        max: 0x2bc,
        mean: 369.31,
      },
      skills: {
        armor: {
          n: 0x21,
          min: 0x38,
          p10: 0x3d,
          p50: 0x44,
          p90: 0x46,
          max: 0x46,
          mean: 66.061,
        },
      },
      priceByRoll: [
        {
          skills: { armor: 0x46 },
          n: 0x8,
          minPrice: 0x168,
          p10Price: 0x168,
          p50Price: 428.99,
          sampleOfferId: "6a0abd2f6105cef530bf2790",
        },
        {
          skills: { armor: 0x44 },
          n: 0x6,
          minPrice: 0x14a,
          p10Price: 0x14a,
          p50Price: 0x159,
          sampleOfferId: "6a09418f73b88cc8e3a2b447",
        },
        {
          skills: { armor: 0x3d },
          n: 0x4,
          minPrice: 0x138,
          p10Price: 0x138,
          p50Price: 0x13b,
          sampleOfferId: "6a09c882470ee144a1821613",
        },
        {
          skills: { armor: 0x45 },
          n: 0x4,
          minPrice: 0x159,
          p10Price: 0x159,
          p50Price: 0x1d6,
          sampleOfferId: "6a0cb00997b1810380558e0b",
        },
        {
          skills: { armor: 0x3f },
          n: 0x2,
          minPrice: 0x13b,
          p10Price: 0x13b,
          p50Price: 0x144,
          sampleOfferId: "6a0858ae205aab551b2bb0ba",
        },
        {
          skills: { armor: 0x40 },
          n: 0x2,
          minPrice: 0x142,
          p10Price: 0x142,
          p50Price: 0x143,
          sampleOfferId: "6a0cb05a97b1810380565609",
        },
        {
          skills: { armor: 0x3e },
          n: 0x2,
          minPrice: 0x154,
          p10Price: 0x154,
          p50Price: 0x159,
          sampleOfferId: "69f9acbe2627ed92f71d5bc0",
        },
        {
          skills: { armor: 0x3c },
          n: 0x1,
          minPrice: 315.555,
          p10Price: 315.555,
          p50Price: 315.555,
          sampleOfferId: "6a0788a13f98d88864617f43",
        },
        {
          skills: { armor: 0x38 },
          n: 0x1,
          minPrice: 0x13d,
          p10Price: 0x13d,
          p50Price: 0x13d,
          sampleOfferId: "69fe11ad02cc47cde94d3720",
        },
        {
          skills: { armor: 0x41 },
          n: 0x1,
          minPrice: 0x145,
          p10Price: 0x145,
          p50Price: 0x145,
          sampleOfferId: "6a06f65bb8fe423589742e21",
        },
        {
          skills: { armor: 0x42 },
          n: 0x1,
          minPrice: 325.9,
          p10Price: 325.9,
          p50Price: 325.9,
          sampleOfferId: "6a0a00118058731b23adfad5",
        },
        {
          skills: { armor: 0x43 },
          n: 0x1,
          minPrice: 0x14a,
          p10Price: 0x14a,
          p50Price: 0x14a,
          sampleOfferId: "6a0b3a1705766a4341c970eb",
        },
        {
          skills: { armor: 0x39 },
          n: 0x0,
          minPrice: 316.64,
          p10Price: 316.64,
          p50Price: 316.64,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { armor: 0x3a },
          n: 0x0,
          minPrice: 316.28,
          p10Price: 316.28,
          p50Price: 316.28,
          sampleOfferId: null,
          _interpolated: !![],
        },
        {
          skills: { armor: 0x3b },
          n: 0x0,
          minPrice: 315.92,
          p10Price: 315.92,
          p50Price: 315.92,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a09c882470ee144a1821613",
          price: 0x138,
          skills: { armor: 0x3d },
        },
        {
          id: "6a0858ae205aab551b2bb0ba",
          price: 0x13b,
          skills: { armor: 0x3f },
        },
        {
          id: "6a08e451a1b2d434b1128766",
          price: 0x13b,
          skills: { armor: 0x3d },
        },
        {
          id: "6a0add146b2415b646589a06",
          price: 0x13b,
          skills: { armor: 0x3d },
        },
        {
          id: "6a0788a13f98d88864617f43",
          price: 315.555,
          skills: { armor: 0x3c },
        },
        {
          id: "69fe11ad02cc47cde94d3720",
          price: 0x13d,
          skills: { armor: 0x38 },
        },
        {
          id: "6a0a6815f6787fe1691f023a",
          price: 0x140,
          skills: { armor: 0x3d },
        },
        {
          id: "6a0cb05a97b1810380565609",
          price: 0x142,
          skills: { armor: 0x40 },
        },
        {
          id: "6a0c939cc5fa963059c32bfe",
          price: 0x143,
          skills: { armor: 0x40 },
        },
        {
          id: "6a07b878798f955ca8c123e4",
          price: 0x144,
          skills: { armor: 0x3f },
        },
        {
          id: "6a06f65bb8fe423589742e21",
          price: 0x145,
          skills: { armor: 0x41 },
        },
        {
          id: "6a0a00118058731b23adfad5",
          price: 325.9,
          skills: { armor: 0x42 },
        },
        {
          id: "6a09418f73b88cc8e3a2b447",
          price: 0x14a,
          skills: { armor: 0x44 },
        },
        {
          id: "6a0b3a1705766a4341c970eb",
          price: 0x14a,
          skills: { armor: 0x43 },
        },
        {
          id: "6a08e426b55d05f0eb185d44",
          price: 0x14f,
          skills: { armor: 0x44 },
        },
        {
          id: "6a0c64c842c3954108802f9d",
          price: 336.634,
          skills: { armor: 0x44 },
        },
        {
          id: "69f9acbe2627ed92f71d5bc0",
          price: 0x154,
          skills: { armor: 0x3e },
        },
        {
          id: "69fc74df40d20c449b67b628",
          price: 0x159,
          skills: { armor: 0x3e },
        },
        {
          id: "6a0aa96463ae307ab4b5e970",
          price: 0x159,
          skills: { armor: 0x44 },
        },
        {
          id: "6a0cb00997b1810380558e0b",
          price: 0x159,
          skills: { armor: 0x45 },
        },
        {
          id: "6a0a60d72881254fe023b4fb",
          price: 349.999,
          skills: { armor: 0x44 },
        },
        {
          id: "6a072a8fecf442d9e74e6c31",
          price: 0x15e,
          skills: { armor: 0x45 },
        },
        {
          id: "6a07dda295006cace851d3f4",
          price: 0x15e,
          skills: { armor: 0x44 },
        },
        {
          id: "6a0abd2f6105cef530bf2790",
          price: 0x168,
          skills: { armor: 0x46 },
        },
        {
          id: "6a09baa02f572744b7372c69",
          price: 384.157,
          skills: { armor: 0x46 },
        },
        {
          id: "6a08e415d7ad881db58e5aaa",
          price: 0x185,
          skills: { armor: 0x46 },
        },
        {
          id: "69ff8ea2390e2dcf30f8560f",
          price: 0x190,
          skills: { armor: 0x46 },
        },
        {
          id: "69feac6e07ebcd5b029144a3",
          price: 428.99,
          skills: { armor: 0x46 },
        },
        {
          id: "69f54d16dd31104a9dcb3101",
          price: 0x1c2,
          skills: { armor: 0x46 },
        },
        {
          id: "69f8ddd8428135080baf5936",
          price: 0x1d6,
          skills: { armor: 0x45 },
        },
        {
          id: "69edab40f9e4af2fc30de050",
          price: 0x1e0,
          skills: { armor: 0x45 },
        },
        {
          id: "6a06a4eb4e66ebc10fbe4e7d",
          price: 0x21b,
          skills: { armor: 0x46 },
        },
        {
          id: "69d7540d0fda012ada1db495",
          price: 0x2bc,
          skills: { armor: 0x46 },
        },
      ],
      fetchedAt: "2026-05-19T21:04:04.075Z",
      passesUsed: 0x5,
    },
    gloves1: {
      n: 0x1f,
      price: {
        n: 0x1f,
        min: 1.278,
        p10: 1.28,
        p50: 1.3,
        p90: 1.383,
        max: 1.384,
        mean: 1.329,
      },
      skills: {
        precision: {
          n: 0x1f,
          min: 0x1,
          p10: 0x2,
          p50: 0x4,
          p90: 0x5,
          max: 0x5,
          mean: 3.742,
        },
      },
      priceByRoll: [
        {
          skills: { precision: 0x5 },
          n: 0xc,
          minPrice: 1.379,
          p10Price: 1.38,
          p50Price: 1.383,
          sampleOfferId: "6a0ccc2297401bcd991b1627",
        },
        {
          skills: { precision: 0x3 },
          n: 0xa,
          minPrice: 1.28,
          p10Price: 1.285,
          p50Price: 1.29,
          sampleOfferId: "6a0cc56fc74e15be778eddf9",
        },
        {
          skills: { precision: 0x4 },
          n: 0x5,
          minPrice: 1.29,
          p10Price: 1.29,
          p50Price: 1.3,
          sampleOfferId: "6a0b5d2a0587ae35a6afe72a",
        },
        {
          skills: { precision: 0x1 },
          n: 0x2,
          minPrice: 1.278,
          p10Price: 1.278,
          p50Price: 1.28,
          sampleOfferId: "6a0c4203a928e0420201fa70",
        },
        {
          skills: { precision: 0x2 },
          n: 0x2,
          minPrice: 1.279,
          p10Price: 1.279,
          p50Price: 1.282,
          sampleOfferId: "6a0c38c754f591bf4ecb4025",
        },
      ],
      offers: [
        {
          id: "6a0c4203a928e0420201fa70",
          price: 1.278,
          skills: { precision: 0x1 },
        },
        {
          id: "6a0c38c754f591bf4ecb4025",
          price: 1.279,
          skills: { precision: 0x2 },
        },
        {
          id: "6a0c49f854f591bf4e0d80c2",
          price: 1.28,
          skills: { precision: 0x1 },
        },
        {
          id: "6a0cc56fc74e15be778eddf9",
          price: 1.28,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0cad4f0782276477c6c307",
          price: 1.282,
          skills: { precision: 0x2 },
        },
        {
          id: "6a0cc4c8c74e15be778e01e3",
          price: 1.285,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0cb4e2218a2fe5f0a73055",
          price: 1.286,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0be491187b008995d91fd9",
          price: 1.287,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0b1964427f90f99108a8bc",
          price: 1.29,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0b349c8227194fde9816eb",
          price: 1.29,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0b5d2a0587ae35a6afe72a",
          price: 1.29,
          skills: { precision: 0x4 },
        },
        {
          id: "6a0b76efc6da59e731e800b6",
          price: 1.29,
          skills: { precision: 0x4 },
        },
        {
          id: "6a0a6dad454366280541b57f",
          price: 1.3,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0a9cf7eb30554c2a74ec26",
          price: 1.3,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0ac5b35fb2842f2d2e894f",
          price: 1.3,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0ad22f50882ed698b0a1b2",
          price: 1.3,
          skills: { precision: 0x3 },
        },
        {
          id: "6a0ad27557a773a0e0f29010",
          price: 1.3,
          skills: { precision: 0x4 },
        },
        {
          id: "6a0c15f82e9948d0a6914b48",
          price: 1.3,
          skills: { precision: 0x4 },
        },
        {
          id: "6a0ccc2297401bcd991b1627",
          price: 1.379,
          skills: { precision: 0x5 },
        },
        {
          id: "6a09ed9c6a9b06f6145bc904",
          price: 1.38,
          skills: { precision: 0x4 },
        },
        {
          id: "6a0c96c6de8f16bec45e28a4",
          price: 1.38,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0ccfac214927d5b7773ddc",
          price: 1.382,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0c7810d164a1cfbffa2126",
          price: 1.383,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0c781642c3954108a56213",
          price: 1.383,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0c791740469d638eed1245",
          price: 1.383,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0c7927ef20adbebd2f310a",
          price: 1.383,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0ca3dd22e727783b452be4",
          price: 1.383,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0ca3e2ef20adbebd65ce26",
          price: 1.383,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0c34bd218a2fe5f09d3e36",
          price: 1.384,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0c34c11acc9b089e26c7ef",
          price: 1.384,
          skills: { precision: 0x5 },
        },
        {
          id: "6a0c34d1fc0151746e401d3d",
          price: 1.384,
          skills: { precision: 0x5 },
        },
      ],
      fetchedAt: "2026-05-19T21:04:25.482Z",
      passesUsed: 0x5,
    },
    gloves2: {
      n: 0x27,
      price: {
        n: 0x27,
        min: 3.75,
        p10: 3.84,
        p50: 3.899,
        p90: 3.95,
        max: 3.95,
        mean: 3.891,
      },
      skills: {
        precision: {
          n: 0x27,
          min: 0x6,
          p10: 0x6,
          p50: 0x9,
          p90: 0xa,
          max: 0xa,
          mean: 8.641,
        },
      },
      priceByRoll: [
        {
          skills: { precision: 0xa },
          n: 0xd,
          minPrice: 3.75,
          p10Price: 3.939,
          p50Price: 3.94,
          sampleOfferId: "6a0cd047f16ff732f2a31f0b",
        },
        {
          skills: { precision: 0x9 },
          n: 0xb,
          minPrice: 3.859,
          p10Price: 3.859,
          p50Price: 3.9,
          sampleOfferId: "6a0cc98da143bc2223197f47",
        },
        {
          skills: { precision: 0x8 },
          n: 0x7,
          minPrice: 3.85,
          p10Price: 3.85,
          p50Price: 3.86,
          sampleOfferId: "6a0c7d878cecb6e11191fce0",
        },
        {
          skills: { precision: 0x7 },
          n: 0x4,
          minPrice: 3.84,
          p10Price: 3.84,
          p50Price: 3.85,
          sampleOfferId: "6a0c00ef63e74c9be42f90f4",
        },
        {
          skills: { precision: 0x6 },
          n: 0x4,
          minPrice: 3.84,
          p10Price: 3.84,
          p50Price: 3.85,
          sampleOfferId: "6a0c618f3049671dec71d059",
        },
      ],
      offers: [
        {
          id: "6a0cd047f16ff732f2a31f0b",
          price: 3.75,
          skills: { precision: 0xa },
        },
        {
          id: "6a0c00ef63e74c9be42f90f4",
          price: 3.84,
          skills: { precision: 0x7 },
        },
        {
          id: "6a0c618f3049671dec71d059",
          price: 3.84,
          skills: { precision: 0x6 },
        },
        {
          id: "6a0c93c754f591bf4e8c2120",
          price: 3.84,
          skills: { precision: 0x6 },
        },
        {
          id: "6a0b8a49a615362509a2debd",
          price: 3.85,
          skills: { precision: 0x7 },
        },
        {
          id: "6a0be8710587ae35a6dfa2fa",
          price: 3.85,
          skills: { precision: 0x7 },
        },
        {
          id: "6a0c46a67410a291d7945d28",
          price: 3.85,
          skills: { precision: 0x6 },
        },
        {
          id: "6a0c7d878cecb6e11191fce0",
          price: 3.85,
          skills: { precision: 0x8 },
        },
        {
          id: "6a0b76be17ef50f647b3b6fc",
          price: 3.857,
          skills: { precision: 0x7 },
        },
        {
          id: "6a0a9ea0131f415fb0d1ca37",
          price: 3.859,
          skills: { precision: 0x6 },
        },
        {
          id: "6a0cc98da143bc2223197f47",
          price: 3.859,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0cc9afc2341486026550a1",
          price: 3.859,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0c4cad662a45b49181b989",
          price: 3.86,
          skills: { precision: 0x8 },
        },
        {
          id: "6a0c4cbeef20adbebddb5458",
          price: 3.86,
          skills: { precision: 0x8 },
        },
        {
          id: "6a0c90a2ea6f64b76735e429",
          price: 3.86,
          skills: { precision: 0x8 },
        },
        {
          id: "6a0cb5e2d4d89c0e917dc5d1",
          price: 3.86,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0c01630587ae35a6e6b8b3",
          price: 3.89,
          skills: { precision: 0x8 },
        },
        {
          id: "6a0c017bb325b2be5272f356",
          price: 3.89,
          skills: { precision: 0x8 },
        },
        {
          id: "6a0c5ab0de8f16bec4ffc6d5",
          price: 3.895,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0b5f77edd9ab85e7f2b1cc",
          price: 3.899,
          skills: { precision: 0x8 },
        },
        {
          id: "6a0c00ff87fc98056e8b3634",
          price: 3.9,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0c016e6a85c92f534f7b73",
          price: 3.9,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0c2058385386c1e2ae8dff",
          price: 3.9,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0c858437311e064dd2d3bb",
          price: 3.9,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0c8dd912a79ff237488d4f",
          price: 3.9,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0cb788ea6f64b76769a8e3",
          price: 3.9,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0cb879809396aab50dfba6",
          price: 3.9,
          skills: { precision: 0x9 },
        },
        {
          id: "6a0cc079f50f7e1a0c7519a2",
          price: 3.939,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cc09f5671c3f647e20945",
          price: 3.939,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cc0bb5cfd025f8431a5dd",
          price: 3.939,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cc0d5dba93000ace8ebcc",
          price: 3.939,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cc0f159dc7bdd6fd242bb",
          price: 3.939,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cb9d5ae880baa0bee39b3",
          price: 3.94,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cabe92038bc67f6e78fdf",
          price: 3.95,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cabef232be789f1a4c069",
          price: 3.95,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cabf9db9b5f8461d9ca52",
          price: 3.95,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cabff2038bc67f6e7f1a2",
          price: 3.95,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cac05b09f9fd3d1cac4f8",
          price: 3.95,
          skills: { precision: 0xa },
        },
        {
          id: "6a0cac0ba0cb19947a711178",
          price: 3.95,
          skills: { precision: 0xa },
        },
      ],
      fetchedAt: "2026-05-19T21:04:45.799Z",
      passesUsed: 0x5,
    },
    gloves3: {
      n: 0x35,
      price: {
        n: 0x35,
        min: 12.5,
        p10: 13.599,
        p50: 16.149,
        p90: 25.7,
        max: 25.9,
        mean: 17.79,
      },
      skills: {
        precision: {
          n: 0x35,
          min: 0xb,
          p10: 0xc,
          p50: 0xd,
          p90: 0xf,
          max: 0xf,
          mean: 13.264,
        },
      },
      priceByRoll: [
        {
          skills: { precision: 0xc },
          n: 0xc,
          minPrice: 13.599,
          p10Price: 13.599,
          p50Price: 13.69,
          sampleOfferId: "6a0cc9ce90c844f6a32c56d2",
        },
        {
          skills: { precision: 0xd },
          n: 0xc,
          minPrice: 14.9,
          p10Price: 0xf,
          p50Price: 16.1,
          sampleOfferId: "6a0ccbcf4043a510844e9959",
        },
        {
          skills: { precision: 0xe },
          n: 0xc,
          minPrice: 18.1,
          p10Price: 18.1,
          p50Price: 18.198,
          sampleOfferId: "6a0cc3b7576934a1560e2da0",
        },
        {
          skills: { precision: 0xf },
          n: 0xc,
          minPrice: 23.989,
          p10Price: 23.99,
          p50Price: 25.7,
          sampleOfferId: "6a0ccacc97401bcd991a90e7",
        },
        {
          skills: { precision: 0xb },
          n: 0x5,
          minPrice: 12.5,
          p10Price: 12.5,
          p50Price: 12.8,
          sampleOfferId: "6a0ca1d13049671decd4e9e4",
        },
      ],
      offers: [
        {
          id: "6a0ca1d13049671decd4e9e4",
          price: 12.5,
          skills: { precision: 0xb },
        },
        {
          id: "6a0c9c8f019f0226b9ab6328",
          price: 12.75,
          skills: { precision: 0xb },
        },
        {
          id: "6a0c9914809396aab5e24199",
          price: 12.8,
          skills: { precision: 0xb },
        },
        {
          id: "6a0c43c8ef20adbebdc26f21",
          price: 12.87,
          skills: { precision: 0xb },
        },
        {
          id: "6a04d7ed5929e31ef8fa44b2",
          price: 13.4,
          skills: { precision: 0xb },
        },
        {
          id: "6a0cc9ce90c844f6a32c56d2",
          price: 13.599,
          skills: { precision: 0xc },
        },
        {
          id: "6a0cc9d777ca45b457b8aeaf",
          price: 13.599,
          skills: { precision: 0xc },
        },
        {
          id: "6a0cc9dfa143bc222319df62",
          price: 13.599,
          skills: { precision: 0xc },
        },
        {
          id: "6a0c788bc59101a5600d58f4",
          price: 13.65,
          skills: { precision: 0xc },
        },
        {
          id: "6a0c5bc242c39541086e1730",
          price: 13.656,
          skills: { precision: 0xc },
        },
        {
          id: "6a0c5b9f576934a156781c48",
          price: 13.662,
          skills: { precision: 0xc },
        },
        {
          id: "6a0c494f218a2fe5f0e9d49a",
          price: 13.69,
          skills: { precision: 0xc },
        },
        {
          id: "6a0755723ff8dc0846284778",
          price: 13.7,
          skills: { precision: 0xc },
        },
        {
          id: "6a0bb96bf44607696042ccc0",
          price: 13.7,
          skills: { precision: 0xc },
        },
        {
          id: "6a07333280bb71a720f55635",
          price: 13.8,
          skills: { precision: 0xc },
        },
        {
          id: "6a07333d80bb71a720f55cae",
          price: 13.8,
          skills: { precision: 0xc },
        },
        {
          id: "6a07335a1a0f481fa5168e81",
          price: 13.8,
          skills: { precision: 0xc },
        },
        {
          id: "6a0ccbcf4043a510844e9959",
          price: 14.9,
          skills: { precision: 0xd },
        },
        {
          id: "6a0cc80d8423aa74e2a83a8d",
          price: 0xf,
          skills: { precision: 0xd },
        },
        {
          id: "6a0cb14059dc7bdd6fc86dd5",
          price: 15.99,
          skills: { precision: 0xd },
        },
        {
          id: "6a0a5b6b444773f62fe3b027",
          price: 0x10,
          skills: { precision: 0xd },
        },
        {
          id: "6a0a5b7479e713efacdd46c8",
          price: 0x10,
          skills: { precision: 0xd },
        },
        {
          id: "6a0cbfefd164a1cfbf5064dc",
          price: 0x10,
          skills: { precision: 0xd },
        },
        {
          id: "6a053b3d8f2612879dd29b2a",
          price: 16.1,
          skills: { precision: 0xd },
        },
        {
          id: "6a053b43a017b43766cf2937",
          price: 16.1,
          skills: { precision: 0xd },
        },
        {
          id: "6a0371d7127dcfc84c55d92a",
          price: 16.139,
          skills: { precision: 0xd },
        },
        {
          id: "6a036f0f19e20e56deed1c7d",
          price: 16.149,
          skills: { precision: 0xd },
        },
        {
          id: "6a0357892c0b0e8c9715d959",
          price: 16.8,
          skills: { precision: 0xd },
        },
        {
          id: "6a0c50c00450530a9a9cfe40",
          price: 17.98,
          skills: { precision: 0xd },
        },
        {
          id: "6a0cc3b7576934a1560e2da0",
          price: 18.1,
          skills: { precision: 0xe },
        },
        {
          id: "6a0cc3f542c3954108f4dc8e",
          price: 18.1,
          skills: { precision: 0xe },
        },
        {
          id: "6a0cbcd6de8f16bec4913926",
          price: 18.188,
          skills: { precision: 0xe },
        },
        {
          id: "6a0cbcdd42c3954108f16d86",
          price: 18.188,
          skills: { precision: 0xe },
        },
        {
          id: "6a0cbced385386c1e2cb562e",
          price: 18.188,
          skills: { precision: 0xe },
        },
        {
          id: "6a0cb9fdfc0151746e334c6b",
          price: 18.189,
          skills: { precision: 0xe },
        },
        {
          id: "6a08bd9900c1690730b5fc34",
          price: 18.198,
          skills: { precision: 0xe },
        },
        {
          id: "6a08bda400c1690730b60a02",
          price: 18.198,
          skills: { precision: 0xe },
        },
        {
          id: "6a08bdabaf8906888b071c11",
          price: 18.198,
          skills: { precision: 0xe },
        },
        {
          id: "6a08bdb2f3514ab1215e1a04",
          price: 18.198,
          skills: { precision: 0xe },
        },
        {
          id: "6a08bdb94e4673d395623629",
          price: 18.198,
          skills: { precision: 0xe },
        },
        {
          id: "6a08bdc0f557fc81fbcc784a",
          price: 18.198,
          skills: { precision: 0xe },
        },
        {
          id: "6a0ccacc97401bcd991a90e7",
          price: 23.989,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cc304218a2fe5f0ae8e84",
          price: 23.99,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cbfb2385386c1e2cc0d77",
          price: 0x18,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cbb08d164a1cfbf4c5871",
          price: 0x19,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cba2e576934a15608332d",
          price: 25.695,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cb0dc8cecb6e111d340e1",
          price: 25.7,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cb0e9505754d69a4800cd",
          price: 25.7,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cb0f18cecb6e111d36d14",
          price: 25.7,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cb0f8dba93000ace1a268",
          price: 25.7,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cb107122e7b34dab450ca",
          price: 25.7,
          skills: { precision: 0xf },
        },
        {
          id: "6a0cad680782276477c70f8d",
          price: 25.899,
          skills: { precision: 0xf },
        },
        {
          id: "6a0ca63b5cfd025f84170e40",
          price: 25.9,
          skills: { precision: 0xf },
        },
      ],
      fetchedAt: "2026-05-19T21:05:05.077Z",
      passesUsed: 0x5,
    },
    gloves4: {
      n: 0x3b,
      price: {
        n: 0x3b,
        min: 46.403,
        p10: 46.499,
        p50: 52.599,
        p90: 64.99,
        max: 0x43,
        mean: 54.057,
      },
      skills: {
        precision: {
          n: 0x3b,
          min: 0x15,
          p10: 0x15,
          p50: 0x17,
          p90: 0x19,
          max: 0x19,
          mean: 23.034,
        },
      },
      priceByRoll: [
        {
          skills: { precision: 0x16 },
          n: 0xc,
          minPrice: 47.8,
          p10Price: 47.9,
          p50Price: 49.48,
          sampleOfferId: "6a0cd07bd0e257e130a669c6",
        },
        {
          skills: { precision: 0x17 },
          n: 0xc,
          minPrice: 50.495,
          p10Price: 0x33,
          p50Price: 52.599,
          sampleOfferId: "6a0ccf40966e3be55a5b17d7",
        },
        {
          skills: { precision: 0x18 },
          n: 0xc,
          minPrice: 56.74,
          p10Price: 56.8,
          p50Price: 0x39,
          sampleOfferId: "6a0c9102e788b380ec48f039",
        },
        {
          skills: { precision: 0x19 },
          n: 0xc,
          minPrice: 0x3e,
          p10Price: 62.99,
          p50Price: 64.99,
          sampleOfferId: "6a0cb6789d22488fe5ffba69",
        },
        {
          skills: { precision: 0x15 },
          n: 0xb,
          minPrice: 46.403,
          p10Price: 46.489,
          p50Price: 46.499,
          sampleOfferId: "6a0ccbfebd3cc7006e746d92",
        },
      ],
      offers: [
        {
          id: "6a0ccbfebd3cc7006e746d92",
          price: 46.403,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0cbdf9ae880baa0bf06c85",
          price: 46.489,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0cbe057410a291d7539fae",
          price: 46.489,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0cbe0d42c3954108f1afc3",
          price: 46.489,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0cae51122e7b34dab0f0bd",
          price: 46.49,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0cacbb7c540e3a250bb3d5",
          price: 46.499,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0cacc64c1c1ac46bd2129c",
          price: 46.499,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0c97c742c3954108c228b0",
          price: 47.3,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0cd07bd0e257e130a669c6",
          price: 47.8,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0c96c507822764779bff13",
          price: 47.85,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0c934ec775007f7e271fd7",
          price: 47.899,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0c93568a830ebf763505d5",
          price: 47.899,
          skills: { precision: 0x15 },
        },
        {
          id: "6a0cc43b4c1c1ac46be1a13b",
          price: 47.9,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0cbd47f50f7e1a0c73f24c",
          price: 47.98,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0cc87290c844f6a32bdbff",
          price: 0x30,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0cc085ea6f64b7676df7e6",
          price: 49.3,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0caea60782276477c9f51d",
          price: 49.4,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0ca37a3687d472c2f7b6a6",
          price: 49.48,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0ca38015139e66c9850e0d",
          price: 49.48,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0ca24eb1fd467f70492b7f",
          price: 49.488,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0c932637311e064de194d6",
          price: 49.489,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0c932e3fd37b4c0bcef23f",
          price: 49.489,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0c93368a830ebf7634bb3f",
          price: 49.489,
          skills: { precision: 0x16 },
        },
        {
          id: "6a0ccf40966e3be55a5b17d7",
          price: 50.495,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c8a9dcb6401cceae9d14f",
          price: 0x33,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c8aa3e5afba85e790d82c",
          price: 0x33,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0cc85ee3f583c196c3dba6",
          price: 0x33,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c882e69769ff85005995d",
          price: 0x34,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c86c0ede0e7856afcbd1d",
          price: 52.599,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c86c6d1c0c3cba710288e",
          price: 52.599,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c6ae5fc0151746ec8f7e0",
          price: 52.6,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c6aa054f591bf4e575f8e",
          price: 52.68,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c5cd90450530a9ab5b234",
          price: 52.7,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0b95159d8ae14340075d9a",
          price: 0x35,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c5ef4218a2fe5f01f9653",
          price: 0x35,
          skills: { precision: 0x17 },
        },
        {
          id: "6a0c9102e788b380ec48f039",
          price: 56.74,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c87a28cecb6e1119a3539",
          price: 56.8,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c8774232be789f170afad",
          price: 56.899,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c846940469d638efa353e",
          price: 56.9,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c86d108ed149c50d7c768",
          price: 56.999,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c86d7d1c0c3cba71054a6",
          price: 56.999,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c83f6b09f9fd3d195c40e",
          price: 0x39,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c9d8a37311e064dea87bc",
          price: 0x39,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c72c0256c6c9318c44914",
          price: 57.5,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c6ab7662a45b491b87004",
          price: 57.9,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c6ac144c156ae4bbc8bea",
          price: 57.9,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0c6ac5662a45b491b8ae85",
          price: 57.9,
          skills: { precision: 0x18 },
        },
        {
          id: "6a0cb6789d22488fe5ffba69",
          price: 0x3e,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0cad02b09f9fd3d1cbde4a",
          price: 62.99,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0cae08b1fd467f70620389",
          price: 0x3f,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0ca00e8a830ebf76470f6e",
          price: 63.6,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0c72d35cfd025f84d68731",
          price: 0x40,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0abbd9427f90f991e22013",
          price: 64.99,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0abbe28bc6b38436e974f4",
          price: 64.99,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0abbecd84c1f927cae22af",
          price: 64.99,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0abbf18bc6b38436e98cbf",
          price: 64.99,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0abbfa0eeed666f79f79b0",
          price: 64.99,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0a3d9648f99bd80caebb3d",
          price: 0x43,
          skills: { precision: 0x19 },
        },
        {
          id: "6a0a3dbf5e54ae5dfdb3450b",
          price: 0x43,
          skills: { precision: 0x19 },
        },
      ],
      fetchedAt: "2026-05-19T21:05:24.023Z",
      passesUsed: 0x5,
    },
    gloves5: {
      n: 0x3a,
      price: {
        n: 0x3a,
        min: 0x88,
        p10: 0x8c,
        p50: 166.782,
        p90: 199.99,
        max: 0xfa,
        mean: 168.567,
      },
      skills: {
        precision: {
          n: 0x3a,
          min: 0x1f,
          p10: 0x20,
          p50: 0x25,
          p90: 0x28,
          max: 0x28,
          mean: 36.793,
        },
      },
      priceByRoll: [
        {
          skills: { precision: 0x28 },
          n: 0xc,
          minPrice: 0xb9,
          p10Price: 186.5,
          p50Price: 199.99,
          sampleOfferId: "6a0be7d087627b1abc48f8c5",
        },
        {
          skills: { precision: 0x27 },
          n: 0xa,
          minPrice: 171.1,
          p10Price: 0xae,
          p50Price: 183.86,
          sampleOfferId: "6a0ba7d5d496f39c784e5972",
        },
        {
          skills: { precision: 0x23 },
          n: 0x9,
          minPrice: 150.99,
          p10Price: 150.99,
          p50Price: 153.9,
          sampleOfferId: "6a0ca963f50f7e1a0c64a307",
        },
        {
          skills: { precision: 0x25 },
          n: 0x6,
          minPrice: 0xa2,
          p10Price: 0xa2,
          p50Price: 0xa3,
          sampleOfferId: "6a0c919ed1c0c3cba71c9c34",
        },
        {
          skills: { precision: 0x26 },
          n: 0x6,
          minPrice: 166.782,
          p10Price: 166.782,
          p50Price: 0xa8,
          sampleOfferId: "6a0cd0116fbde312c05ce724",
        },
        {
          skills: { precision: 0x20 },
          n: 0x5,
          minPrice: 0x88,
          p10Price: 0x88,
          p50Price: 0x8c,
          sampleOfferId: "6a0ccb527c60f9df8e0ee823",
        },
        {
          skills: { precision: 0x21 },
          n: 0x4,
          minPrice: 0x89,
          p10Price: 0x89,
          p50Price: 0x8c,
          sampleOfferId: "6a0bba8b09b61f5776a9131d",
        },
        {
          skills: { precision: 0x24 },
          n: 0x3,
          minPrice: 157.99,
          p10Price: 157.99,
          p50Price: 0x9e,
          sampleOfferId: "6a0c3c8442c3954108160651",
        },
        {
          skills: { precision: 0x22 },
          n: 0x2,
          minPrice: 0x8c,
          p10Price: 0x8c,
          p50Price: 0x8c,
          sampleOfferId: "6a0bbf0963197734b18d7f2d",
        },
        {
          skills: { precision: 0x1f },
          n: 0x1,
          minPrice: 0x8a,
          p10Price: 0x8a,
          p50Price: 0x8a,
          sampleOfferId: "6a0525a67d7a3ca20abbe01e",
        },
      ],
      offers: [
        {
          id: "6a0ccb527c60f9df8e0ee823",
          price: 0x88,
          skills: { precision: 0x20 },
        },
        {
          id: "6a0bba8b09b61f5776a9131d",
          price: 0x89,
          skills: { precision: 0x21 },
        },
        {
          id: "6a0525a67d7a3ca20abbe01e",
          price: 0x8a,
          skills: { precision: 0x1f },
        },
        {
          id: "6a0aea9d1bb21c876a21d290",
          price: 0x8b,
          skills: { precision: 0x21 },
        },
        {
          id: "6a04eb3ecdbffaf4e8b69983",
          price: 0x8c,
          skills: { precision: 0x20 },
        },
        {
          id: "6a04eb42cdbffaf4e8b6d565",
          price: 0x8c,
          skills: { precision: 0x20 },
        },
        {
          id: "6a088ad6d5788ed89f64f7ed",
          price: 0x8c,
          skills: { precision: 0x20 },
        },
        {
          id: "6a0a68f32d2872ef5545385b",
          price: 0x8c,
          skills: { precision: 0x21 },
        },
        {
          id: "6a0b8a6a05eadb5141accc83",
          price: 0x8c,
          skills: { precision: 0x21 },
        },
        {
          id: "6a0bbf0963197734b18d7f2d",
          price: 0x8c,
          skills: { precision: 0x22 },
        },
        {
          id: "6a0be7300587ae35a6df46b5",
          price: 0x8c,
          skills: { precision: 0x22 },
        },
        {
          id: "6a069f4aecacfb6aee9a00c4",
          price: 0x8e,
          skills: { precision: 0x20 },
        },
        {
          id: "6a0ca963f50f7e1a0c64a307",
          price: 150.99,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c9d7af1ffc55224138e1f",
          price: 0x97,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c98b9240c05c97f38b8aa",
          price: 0x98,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c8f011aca5eb348f2ef73",
          price: 0x99,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c8e76f50f7e1a0c3db992",
          price: 153.9,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c8d357410a291d717cc6f",
          price: 0x9a,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c6e60ef20adbebd1bbb8a",
          price: 154.014,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c1ddae15b757e7e865acb",
          price: 156.436,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c3c8442c3954108160651",
          price: 157.99,
          skills: { precision: 0x24 },
        },
        {
          id: "6a0bbf35eb47db9b216f4845",
          price: 0x9e,
          skills: { precision: 0x24 },
        },
        {
          id: "6a0c62a0218a2fe5f0283144",
          price: 0x9e,
          skills: { precision: 0x24 },
        },
        {
          id: "6a0b577260e45770e64041ce",
          price: 158.5,
          skills: { precision: 0x23 },
        },
        {
          id: "6a0c919ed1c0c3cba71c9c34",
          price: 0xa2,
          skills: { precision: 0x25 },
        },
        {
          id: "6a0c0bd954f591bf4e80472c",
          price: 0xa3,
          skills: { precision: 0x25 },
        },
        {
          id: "6a0c7059ef20adbebd2067c2",
          price: 0xa3,
          skills: { precision: 0x25 },
        },
        {
          id: "6a0c71acb09f9fd3d187309e",
          price: 0xa3,
          skills: { precision: 0x25 },
        },
        {
          id: "6a0be6d3e091457aed7e2be1",
          price: 0xa4,
          skills: { precision: 0x25 },
        },
        {
          id: "6a0cd0116fbde312c05ce724",
          price: 166.782,
          skills: { precision: 0x26 },
        },
        {
          id: "6a0cb67908ed149c5012ad20",
          price: 166.891,
          skills: { precision: 0x26 },
        },
        {
          id: "6a0c2ce7ce82d1aed7f4b917",
          price: 0xa7,
          skills: { precision: 0x26 },
        },
        {
          id: "6a0bfd1a63197734b19a3671",
          price: 0xa8,
          skills: { precision: 0x26 },
        },
        {
          id: "6a0bf84c43f2a2b8316c8d22",
          price: 0xa9,
          skills: { precision: 0x26 },
        },
        {
          id: "6a0bdbd587fc98056e7fbc99",
          price: 169.999,
          skills: { precision: 0x26 },
        },
        {
          id: "6a0b3cb3e4eeba3a0d5df9b8",
          price: 0xaa,
          skills: { precision: 0x25 },
        },
        {
          id: "6a0ba7d5d496f39c784e5972",
          price: 171.1,
          skills: { precision: 0x27 },
        },
        {
          id: "6a0b85aee99b20ccf3acb02e",
          price: 0xae,
          skills: { precision: 0x27 },
        },
        {
          id: "6a0b85b322d618f6e55c4b65",
          price: 0xae,
          skills: { precision: 0x27 },
        },
        {
          id: "6a0aea7f1aae8a2132212a15",
          price: 0xb1,
          skills: { precision: 0x27 },
        },
        {
          id: "6a0ac9633b59ae797f1cf01e",
          price: 178.99,
          skills: { precision: 0x27 },
        },
        {
          id: "6a08f940f1181aeef61a1f85",
          price: 183.86,
          skills: { precision: 0x27 },
        },
        {
          id: "6a088d3b1e921a2ce6a0bedd",
          price: 183.897,
          skills: { precision: 0x27 },
        },
        {
          id: "6a0765da79d56f18a929e33a",
          price: 183.9,
          skills: { precision: 0x27 },
        },
        {
          id: "6a085abae58aa9d3cf03aad5",
          price: 0xb9,
          skills: { precision: 0x27 },
        },
        {
          id: "6a0be7d087627b1abc48f8c5",
          price: 0xb9,
          skills: { precision: 0x28 },
        },
        {
          id: "6a08860d3661363164cc911a",
          price: 185.148,
          skills: { precision: 0x27 },
        },
        {
          id: "6a069f8b56cbd81a6a33a20b",
          price: 186.5,
          skills: { precision: 0x28 },
        },
        {
          id: "6a0859859c298a707b02c63b",
          price: 0xbc,
          skills: { precision: 0x28 },
        },
        {
          id: "6a079adb9a6b113b41d943f5",
          price: 198.019,
          skills: { precision: 0x28 },
        },
        {
          id: "6a079ae017bdb004b96e709e",
          price: 198.019,
          skills: { precision: 0x28 },
        },
        {
          id: "6a00e69d67f3eb9a1bf90060",
          price: 199.99,
          skills: { precision: 0x28 },
        },
        {
          id: "6a00e6a94ae86115bc1f495e",
          price: 199.99,
          skills: { precision: 0x28 },
        },
        {
          id: "69eed1373b7ec79e0c95f737",
          price: 0xc8,
          skills: { precision: 0x28 },
        },
        {
          id: "69f38a179cb66a901cf3e2cf",
          price: 0xc8,
          skills: { precision: 0x28 },
        },
        {
          id: "69f34fe0ceda3e338b1cbccd",
          price: 0xcf,
          skills: { precision: 0x28 },
        },
        {
          id: "697f24b291974c7d1dc3a5ae",
          price: 0xf5,
          skills: { precision: 0x28 },
        },
        {
          id: "69795dfe5d0216bdbf92bace",
          price: 0xfa,
          skills: { precision: 0x28 },
        },
      ],
      fetchedAt: "2026-05-19T21:05:42.580Z",
      passesUsed: 0x5,
    },
    gloves6: {
      n: 0x19,
      price: {
        n: 0x19,
        min: 0x149,
        p10: 0x14e,
        p50: 0x17f,
        p90: 495.05,
        max: 0x1f4,
        mean: 400.195,
      },
      skills: {
        precision: {
          n: 0x19,
          min: 0x33,
          p10: 0x34,
          p50: 0x39,
          p90: 0x3c,
          max: 0x3c,
          mean: 56.32,
        },
      },
      priceByRoll: [
        {
          skills: { precision: 0x3a },
          n: 0x5,
          minPrice: 0x184,
          p10Price: 0x184,
          p50Price: 0x190,
          sampleOfferId: "6a0bfc7222d618f6e579dd3c",
        },
        {
          skills: { precision: 0x37 },
          n: 0x4,
          minPrice: 0x16e,
          p10Price: 0x16e,
          p50Price: 0x177,
          sampleOfferId: "6a0ca4e6be10f3a837dc2c48",
        },
        {
          skills: { precision: 0x3c },
          n: 0x4,
          minPrice: 0x1c7,
          p10Price: 0x1c7,
          p50Price: 499.999,
          sampleOfferId: "6a0c4a48a928e0420221fadd",
        },
        {
          skills: { precision: 0x3b },
          n: 0x3,
          minPrice: 420.791,
          p10Price: 420.791,
          p50Price: 0x1e0,
          sampleOfferId: "6a079a2abbb9193210108208",
        },
        {
          skills: { precision: 0x33 },
          n: 0x2,
          minPrice: 0x149,
          p10Price: 0x149,
          p50Price: 0x159,
          sampleOfferId: "6a0c851cf1ffc55224f2749e",
        },
        {
          skills: { precision: 0x34 },
          n: 0x2,
          minPrice: 0x14a,
          p10Price: 0x14a,
          p50Price: 0x14e,
          sampleOfferId: "6a0ca92397b18103804bd725",
        },
        {
          skills: { precision: 0x35 },
          n: 0x2,
          minPrice: 0x14f,
          p10Price: 0x14f,
          p50Price: 0x15e,
          sampleOfferId: "6a0cb7ba809396aab50da331",
        },
        {
          skills: { precision: 0x38 },
          n: 0x2,
          minPrice: 0x17a,
          p10Price: 0x17a,
          p50Price: 0x17c,
          sampleOfferId: "6a0a9e3642494c1398eb60aa",
        },
        {
          skills: { precision: 0x39 },
          n: 0x1,
          minPrice: 0x17f,
          p10Price: 0x17f,
          p50Price: 0x17f,
          sampleOfferId: "6a0c1fe9ce82d1aed7de9936",
        },
        {
          skills: { precision: 0x36 },
          n: 0x0,
          minPrice: 350.5,
          p10Price: 350.5,
          p50Price: 350.5,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0c851cf1ffc55224f2749e",
          price: 0x149,
          skills: { precision: 0x33 },
        },
        {
          id: "6a0ca92397b18103804bd725",
          price: 0x14a,
          skills: { precision: 0x34 },
        },
        {
          id: "6a0c8528218a2fe5f060020c",
          price: 0x14e,
          skills: { precision: 0x34 },
        },
        {
          id: "6a0cb7ba809396aab50da331",
          price: 0x14f,
          skills: { precision: 0x35 },
        },
        {
          id: "6a087da8a6ab1e57ec78bed5",
          price: 0x159,
          skills: { precision: 0x33 },
        },
        {
          id: "69ff485237bfd544c7134e5a",
          price: 0x15e,
          skills: { precision: 0x35 },
        },
        {
          id: "6a0ca4e6be10f3a837dc2c48",
          price: 0x16e,
          skills: { precision: 0x37 },
        },
        {
          id: "6a0ca087e0bea66b3952d05e",
          price: 369.9,
          skills: { precision: 0x37 },
        },
        {
          id: "6a0b7c0c1e4d64d1196f46af",
          price: 0x177,
          skills: { precision: 0x37 },
        },
        {
          id: "6a0b0e22048f8e6e98d4c4ac",
          price: 377.228,
          skills: { precision: 0x37 },
        },
        {
          id: "6a0a9e3642494c1398eb60aa",
          price: 0x17a,
          skills: { precision: 0x38 },
        },
        {
          id: "6a075697c9d5a0e25bd4e983",
          price: 0x17c,
          skills: { precision: 0x38 },
        },
        {
          id: "6a0c1fe9ce82d1aed7de9936",
          price: 0x17f,
          skills: { precision: 0x39 },
        },
        {
          id: "6a0bfc7222d618f6e579dd3c",
          price: 0x184,
          skills: { precision: 0x3a },
        },
        {
          id: "6a085b2bf202ba4d699221b6",
          price: 399.999,
          skills: { precision: 0x3a },
        },
        {
          id: "6a04c062618655eb34b9fcc0",
          price: 0x190,
          skills: { precision: 0x3a },
        },
        {
          id: "6a04c06eb963aedb3e513f02",
          price: 0x190,
          skills: { precision: 0x3a },
        },
        {
          id: "6a079a2abbb9193210108208",
          price: 420.791,
          skills: { precision: 0x3b },
        },
        {
          id: "69fc91d97beeb457f31f126f",
          price: 424.9,
          skills: { precision: 0x3a },
        },
        {
          id: "6a0c4a48a928e0420221fadd",
          price: 0x1c7,
          skills: { precision: 0x3c },
        },
        {
          id: "6a09786ce02e9c4bacfd467f",
          price: 0x1e0,
          skills: { precision: 0x3b },
        },
        {
          id: "6a09a0d0d8adc981db4e55db",
          price: 0x1e9,
          skills: { precision: 0x3c },
        },
        {
          id: "6a0330fa7b9a710062288445",
          price: 495.05,
          skills: { precision: 0x3b },
        },
        {
          id: "6a0a60f5764047cdced57fd9",
          price: 499.999,
          skills: { precision: 0x3c },
        },
        {
          id: "6a06f2a61a0f481fa5da6167",
          price: 0x1f4,
          skills: { precision: 0x3c },
        },
      ],
      fetchedAt: "2026-05-19T21:06:02.317Z",
      passesUsed: 0x5,
    },
    boots1: {
      n: 0x1d,
      price: {
        n: 0x1d,
        min: 1.278,
        p10: 1.278,
        p50: 1.294,
        p90: 1.38,
        max: 1.38,
        mean: 1.308,
      },
      skills: {
        dodge: {
          n: 0x1d,
          min: 0x1,
          p10: 0x2,
          p50: 0x4,
          p90: 0x5,
          max: 0x5,
          mean: 3.793,
        },
      },
      priceByRoll: [
        {
          skills: { dodge: 0x5 },
          n: 0xd,
          minPrice: 1.294,
          p10Price: 1.294,
          p50Price: 1.294,
          sampleOfferId: "6a0c8371ae880baa0ba808b6",
        },
        {
          skills: { dodge: 0x3 },
          n: 0x5,
          minPrice: 1.285,
          p10Price: 1.285,
          p50Price: 1.286,
          sampleOfferId: "6a0cc4b1e5afba85e7d03824",
        },
        {
          skills: { dodge: 0x4 },
          n: 0x5,
          minPrice: 1.289,
          p10Price: 1.289,
          p50Price: 1.29,
          sampleOfferId: "6a0c409e297b921dee13da37",
        },
        {
          skills: { dodge: 0x2 },
          n: 0x4,
          minPrice: 1.278,
          p10Price: 1.278,
          p50Price: 1.279,
          sampleOfferId: "6a0c8d75108199b6ac88c0f4",
        },
        {
          skills: { dodge: 0x1 },
          n: 0x2,
          minPrice: 1.278,
          p10Price: 1.278,
          p50Price: 1.289,
          sampleOfferId: "6a0bd5f16a85c92f5344d30a",
        },
      ],
      offers: [
        {
          id: "6a0bd5f16a85c92f5344d30a",
          price: 1.278,
          skills: { dodge: 0x1 },
        },
        {
          id: "6a0c8d75108199b6ac88c0f4",
          price: 1.278,
          skills: { dodge: 0x2 },
        },
        {
          id: "6a0c8d9ccb6401cceaee3d8c",
          price: 1.278,
          skills: { dodge: 0x2 },
        },
        {
          id: "6a0b79dcb325b2be52579c8d",
          price: 1.279,
          skills: { dodge: 0x2 },
        },
        { id: "6a0c1597ef20adbebd5bb6ec", price: 1.28, skills: { dodge: 0x2 } },
        {
          id: "6a0cc4b1e5afba85e7d03824",
          price: 1.285,
          skills: { dodge: 0x3 },
        },
        {
          id: "6a0cc4b79d22488fe5071f28",
          price: 1.285,
          skills: { dodge: 0x3 },
        },
        {
          id: "6a0cb4c9297b921deedfed27",
          price: 1.286,
          skills: { dodge: 0x3 },
        },
        {
          id: "6a0c4072662a45b4915dcad3",
          price: 1.289,
          skills: { dodge: 0x3 },
        },
        {
          id: "6a0c409e297b921dee13da37",
          price: 1.289,
          skills: { dodge: 0x4 },
        },
        {
          id: "6a0ccfb64b92c91c60f420d5",
          price: 1.289,
          skills: { dodge: 0x1 },
        },
        { id: "6a0b54684c1b5c9f066c6b9c", price: 1.29, skills: { dodge: 0x3 } },
        { id: "6a0bfa327849346b830ff318", price: 1.29, skills: { dodge: 0x4 } },
        { id: "6a0bfa393fa1a1a742227ade", price: 1.29, skills: { dodge: 0x4 } },
        {
          id: "6a0c8371ae880baa0ba808b6",
          price: 1.294,
          skills: { dodge: 0x5 },
        },
        {
          id: "6a0c83723049671decaf89e1",
          price: 1.294,
          skills: { dodge: 0x5 },
        },
        {
          id: "6a0c8373de8f16bec4472228",
          price: 1.294,
          skills: { dodge: 0x5 },
        },
        {
          id: "6a0c8374385386c1e2882777",
          price: 1.294,
          skills: { dodge: 0x5 },
        },
        {
          id: "6a0c8375385386c1e2882a20",
          price: 1.294,
          skills: { dodge: 0x5 },
        },
        {
          id: "6a0c8376576934a156c2a212",
          price: 1.294,
          skills: { dodge: 0x5 },
        },
        {
          id: "6a0c8377332d5dda75efc611",
          price: 1.294,
          skills: { dodge: 0x5 },
        },
        { id: "6a0b3ab50c476ad017fc54ba", price: 1.3, skills: { dodge: 0x4 } },
        { id: "6a0b6f4843417f5479a96e7f", price: 1.3, skills: { dodge: 0x4 } },
        { id: "6a0c83033049671decaf25f0", price: 1.38, skills: { dodge: 0x5 } },
        { id: "6a0c96a8f1ffc5522409182a", price: 1.38, skills: { dodge: 0x5 } },
        { id: "6a0c96b0a928e04202a67354", price: 1.38, skills: { dodge: 0x5 } },
        { id: "6a0c96b5662a45b491f16575", price: 1.38, skills: { dodge: 0x5 } },
        { id: "6a0c96bcce82d1aed7c29d4a", price: 1.38, skills: { dodge: 0x5 } },
        { id: "6a0c96c2a928e04202a6ad4a", price: 1.38, skills: { dodge: 0x5 } },
      ],
      fetchedAt: "2026-05-19T21:06:22.771Z",
      passesUsed: 0x5,
    },
    boots2: {
      n: 0x27,
      price: {
        n: 0x27,
        min: 3.82,
        p10: 3.83,
        p50: 3.891,
        p90: 0x4,
        max: 0x4,
        mean: 3.907,
      },
      skills: {
        dodge: {
          n: 0x27,
          min: 0x6,
          p10: 0x6,
          p50: 0x9,
          p90: 0xa,
          max: 0xa,
          mean: 8.41,
        },
      },
      priceByRoll: [
        {
          skills: { dodge: 0x9 },
          n: 0xc,
          minPrice: 3.869,
          p10Price: 3.87,
          p50Price: 3.891,
          sampleOfferId: "6a0cc51159dc7bdd6fd4ab59",
        },
        {
          skills: { dodge: 0xa },
          n: 0xc,
          minPrice: 0x4,
          p10Price: 0x4,
          p50Price: 0x4,
          sampleOfferId: "6a0b91d70af439fc733f5df4",
        },
        {
          skills: { dodge: 0x6 },
          n: 0x8,
          minPrice: 3.82,
          p10Price: 3.82,
          p50Price: 3.83,
          sampleOfferId: "6a0c45d40450530a9a7e24b0",
        },
        {
          skills: { dodge: 0x7 },
          n: 0x4,
          minPrice: 3.82,
          p10Price: 3.82,
          p50Price: 3.859,
          sampleOfferId: "6a0c53a1ddd9411a1f3ca762",
        },
        {
          skills: { dodge: 0x8 },
          n: 0x3,
          minPrice: 3.88,
          p10Price: 3.88,
          p50Price: 3.9,
          sampleOfferId: "6a0bcaf822d618f6e56f5f88",
        },
      ],
      offers: [
        { id: "6a0c45d40450530a9a7e24b0", price: 3.82, skills: { dodge: 0x6 } },
        { id: "6a0c53a1ddd9411a1f3ca762", price: 3.82, skills: { dodge: 0x7 } },
        { id: "6a0c458d297b921dee25b1d1", price: 3.83, skills: { dodge: 0x6 } },
        { id: "6a0c4598ae880baa0b2bc21e", price: 3.83, skills: { dodge: 0x6 } },
        { id: "6a0c45a2d164a1cfbf899ab1", price: 3.83, skills: { dodge: 0x6 } },
        { id: "6a0c45ab332d5dda757c446c", price: 3.83, skills: { dodge: 0x6 } },
        {
          id: "6a0c91ff122e7b34da85d78f",
          price: 3.837,
          skills: { dodge: 0x6 },
        },
        {
          id: "6a0c4456332d5dda757629a5",
          price: 3.839,
          skills: { dodge: 0x6 },
        },
        { id: "6a0c43f7218a2fe5f0d64daa", price: 3.84, skills: { dodge: 0x6 } },
        { id: "6a0bd5fe77a6636d257a777e", price: 3.85, skills: { dodge: 0x7 } },
        {
          id: "6a0a9f75c9c2daa3b9f2435b",
          price: 3.859,
          skills: { dodge: 0x7 },
        },
        { id: "6a0a9753ca1b7d6d17041ce4", price: 3.86, skills: { dodge: 0x7 } },
        {
          id: "6a0cc51159dc7bdd6fd4ab59",
          price: 3.869,
          skills: { dodge: 0x9 },
        },
        { id: "6a0b8e4477a6636d25694a3d", price: 3.87, skills: { dodge: 0x9 } },
        { id: "6a0b8e7b43f2a2b831571bf2", price: 3.87, skills: { dodge: 0x9 } },
        { id: "6a0b4c3fb8a66abeff4807cf", price: 3.88, skills: { dodge: 0x9 } },
        { id: "6a0bcaf822d618f6e56f5f88", price: 3.88, skills: { dodge: 0x8 } },
        { id: "6a0c45bcddd9411a1f19dedc", price: 3.89, skills: { dodge: 0x9 } },
        {
          id: "6a0ac261b999f9af32915550",
          price: 3.891,
          skills: { dodge: 0x9 },
        },
        {
          id: "6a0ac278209d0e2de901415f",
          price: 3.891,
          skills: { dodge: 0x9 },
        },
        {
          id: "6a0cbe5c0450530a9a480c64",
          price: 3.898,
          skills: { dodge: 0x9 },
        },
        { id: "6a0a324430081d7357d6ba6c", price: 3.9, skills: { dodge: 0x8 } },
        { id: "6a0a32645713eb2565c601c6", price: 3.9, skills: { dodge: 0x8 } },
        { id: "6a0b0d0f7602a6e527bb983b", price: 3.9, skills: { dodge: 0x9 } },
        { id: "6a0bad9b17ef50f647c62bcb", price: 3.9, skills: { dodge: 0x9 } },
        { id: "6a0bf9162fbc884e1cf3f6b1", price: 3.9, skills: { dodge: 0x9 } },
        { id: "6a0c196090df8dd8e36fb500", price: 3.9, skills: { dodge: 0x9 } },
        { id: "6a0b91d70af439fc733f5df4", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c280a332d5dda751a4f75", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c440654f591bf4ef3fbe7", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c6a3042c39541088ad855", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c6c4bef20adbebd190ed3", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c71ca1c81298e4a062eef", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c7242f1ffc55224e03341", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c777fa928e04202814d3d", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c89b9019f0226b996b240", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c9a00f1ffc552240e9b5d", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0c9f90662a45b491fee3fb", price: 0x4, skills: { dodge: 0xa } },
        { id: "6a0ca080de8f16bec469c084", price: 0x4, skills: { dodge: 0xa } },
      ],
      fetchedAt: "2026-05-19T21:06:44.470Z",
      passesUsed: 0x5,
    },
    boots3: {
      n: 0x2f,
      price: {
        n: 0x2f,
        min: 11.782,
        p10: 0xc,
        p50: 16.85,
        p90: 22.375,
        max: 22.375,
        mean: 16.098,
      },
      skills: {
        dodge: {
          n: 0x2f,
          min: 0xb,
          p10: 0xb,
          p50: 0xe,
          p90: 0xf,
          max: 0xf,
          mean: 13.362,
        },
      },
      priceByRoll: [
        {
          skills: { dodge: 0xd },
          n: 0xc,
          minPrice: 12.45,
          p10Price: 12.75,
          p50Price: 0xd,
          sampleOfferId: "6a0cc29f385386c1e2ce2525",
        },
        {
          skills: { dodge: 0xe },
          n: 0xc,
          minPrice: 16.85,
          p10Price: 16.85,
          p50Price: 0x11,
          sampleOfferId: "6a0c9bfec775007f7e30bfe9",
        },
        {
          skills: { dodge: 0xf },
          n: 0xc,
          minPrice: 20.6,
          p10Price: 20.7,
          p50Price: 22.375,
          sampleOfferId: "6a0cb0613fd37b4c0bfa2939",
        },
        {
          skills: { dodge: 0xb },
          n: 0x8,
          minPrice: 11.782,
          p10Price: 11.782,
          p50Price: 0xc,
          sampleOfferId: "6a0ccb8c45fb467b6a7cdb0a",
        },
        {
          skills: { dodge: 0xc },
          n: 0x3,
          minPrice: 12.32,
          p10Price: 12.32,
          p50Price: 12.399,
          sampleOfferId: "6a0a6c5910dad01bb2dda48e",
        },
      ],
      offers: [
        {
          id: "6a0ccb8c45fb467b6a7cdb0a",
          price: 11.782,
          skills: { dodge: 0xb },
        },
        { id: "6a0cc6fa396e7531ecc12769", price: 11.8, skills: { dodge: 0xb } },
        {
          id: "6a0ccc0c4c217f594d5643a1",
          price: 11.948,
          skills: { dodge: 0xb },
        },
        { id: "6a0cbf5b2dd0d0d7e5cec0aa", price: 0xc, skills: { dodge: 0xb } },
        { id: "6a0cc095576934a1560c7abb", price: 0xc, skills: { dodge: 0xb } },
        {
          id: "6a0a6c5910dad01bb2dda48e",
          price: 12.32,
          skills: { dodge: 0xc },
        },
        {
          id: "6a0a64650e42a5f827f81b10",
          price: 12.39,
          skills: { dodge: 0xb },
        },
        {
          id: "6a0a5998925f76ec1a2fa691",
          price: 12.399,
          skills: { dodge: 0xc },
        },
        {
          id: "6a0a599fff802aad40a07a3e",
          price: 12.399,
          skills: { dodge: 0xc },
        },
        { id: "6a0b7d58ce961079c34e5c72", price: 12.4, skills: { dodge: 0xb } },
        {
          id: "6a0cc29f385386c1e2ce2525",
          price: 12.45,
          skills: { dodge: 0xd },
        },
        { id: "6a093b1a0479ffb09a8aa6f0", price: 12.5, skills: { dodge: 0xb } },
        {
          id: "6a0cb6a2fc0151746e30ddbb",
          price: 12.75,
          skills: { dodge: 0xd },
        },
        {
          id: "6a0ba5e322d618f6e5657e08",
          price: 12.798,
          skills: { dodge: 0xd },
        },
        {
          id: "6a0bb1004c1b5c9f0695b2be",
          price: 12.798,
          skills: { dodge: 0xd },
        },
        {
          id: "6a0ae3505fb2842f2d3b25ae",
          price: 12.85,
          skills: { dodge: 0xd },
        },
        {
          id: "6a0ac8d6dc1d79f4ca2ef15c",
          price: 12.87,
          skills: { dodge: 0xd },
        },
        { id: "6a0ac2d457a773a0e0ebf356", price: 0xd, skills: { dodge: 0xd } },
        { id: "6a0ac3cf7821292f6bea3033", price: 0xd, skills: { dodge: 0xd } },
        { id: "6a0acb1df83549922f3f2dee", price: 0xd, skills: { dodge: 0xd } },
        { id: "6a0ace7e1bb21c876a16ae31", price: 0xd, skills: { dodge: 0xd } },
        { id: "6a0c1b47bd1cf1118af67a0a", price: 0xd, skills: { dodge: 0xd } },
        { id: "6a0c3906332d5dda75561bc5", price: 0xd, skills: { dodge: 0xd } },
        {
          id: "6a0c9bfec775007f7e30bfe9",
          price: 16.85,
          skills: { dodge: 0xe },
        },
        {
          id: "6a0c9c02f50f7e1a0c51bead",
          price: 16.85,
          skills: { dodge: 0xe },
        },
        {
          id: "6a0c9c0837311e064de9e96e",
          price: 16.85,
          skills: { dodge: 0xe },
        },
        {
          id: "6a0c9c0d751be7d5db259f44",
          price: 16.85,
          skills: { dodge: 0xe },
        },
        {
          id: "6a0c9c143fd37b4c0bd95c0c",
          price: 16.85,
          skills: { dodge: 0xe },
        },
        { id: "6a0c9bb444c156ae4bf90f44", price: 0x11, skills: { dodge: 0xe } },
        { id: "6a0cc37ba928e04202de12ed", price: 0x11, skills: { dodge: 0xe } },
        {
          id: "6a0c848e40469d638efadeb4",
          price: 17.197,
          skills: { dodge: 0xe },
        },
        {
          id: "6a0cbd0d297b921deee6a907",
          price: 17.197,
          skills: { dodge: 0xe },
        },
        {
          id: "6a0cc3fef1ffc552243f3ee2",
          price: 17.197,
          skills: { dodge: 0xe },
        },
        {
          id: "6a0c85285be702db83b1419b",
          price: 17.198,
          skills: { dodge: 0xe },
        },
        {
          id: "6a0c85369d22488fe5bf46d9",
          price: 17.198,
          skills: { dodge: 0xe },
        },
        { id: "6a0cb0613fd37b4c0bfa2939", price: 20.6, skills: { dodge: 0xf } },
        { id: "6a0caee0297b921deedbe64c", price: 20.7, skills: { dodge: 0xf } },
        { id: "6a0c99b8232be789f186d6be", price: 0x16, skills: { dodge: 0xf } },
        { id: "6a0c99bfc59101a5602ef46d", price: 0x16, skills: { dodge: 0xf } },
        { id: "6a0c99c5c59101a5602f2b77", price: 0x16, skills: { dodge: 0xf } },
        {
          id: "6a0c724e332d5dda75daddfe",
          price: 22.375,
          skills: { dodge: 0xf },
        },
        {
          id: "6a0c7253385386c1e272bb26",
          price: 22.375,
          skills: { dodge: 0xf },
        },
        {
          id: "6a0c725bae880baa0b92d2ac",
          price: 22.375,
          skills: { dodge: 0xf },
        },
        {
          id: "6a0c726340469d638ee38e24",
          price: 22.375,
          skills: { dodge: 0xf },
        },
        {
          id: "6a0c92fed164a1cfbf18fad9",
          price: 22.375,
          skills: { dodge: 0xf },
        },
        {
          id: "6a0c930440469d638e0e7e35",
          price: 22.375,
          skills: { dodge: 0xf },
        },
        {
          id: "6a0cb6353049671decf1adda",
          price: 22.375,
          skills: { dodge: 0xf },
        },
      ],
      fetchedAt: "2026-05-19T21:07:04.924Z",
      passesUsed: 0x5,
    },
    boots4: {
      n: 0x3c,
      price: {
        n: 0x3c,
        min: 54.898,
        p10: 0x38,
        p50: 0x3e,
        p90: 0x45,
        max: 0x46,
        mean: 62.138,
      },
      skills: {
        dodge: {
          n: 0x3c,
          min: 0x15,
          p10: 0x15,
          p50: 0x17,
          p90: 0x19,
          max: 0x19,
          mean: 0x17,
        },
      },
      priceByRoll: [
        {
          skills: { dodge: 0x15 },
          n: 0xc,
          minPrice: 54.898,
          p10Price: 54.918,
          p50Price: 0x38,
          sampleOfferId: "6a0ccf8995498dd61da9c380",
        },
        {
          skills: { dodge: 0x16 },
          n: 0xc,
          minPrice: 57.425,
          p10Price: 57.425,
          p50Price: 57.499,
          sampleOfferId: "6a0cba9dce82d1aed7f2b6d2",
        },
        {
          skills: { dodge: 0x17 },
          n: 0xc,
          minPrice: 0x3c,
          p10Price: 60.395,
          p50Price: 0x3e,
          sampleOfferId: "6a0cb67ca928e04202d58806",
        },
        {
          skills: { dodge: 0x18 },
          n: 0xc,
          minPrice: 65.2,
          p10Price: 65.75,
          p50Price: 0x43,
          sampleOfferId: "6a0cc277e6d9cc1268cf8ee0",
        },
        {
          skills: { dodge: 0x19 },
          n: 0xc,
          minPrice: 68.39,
          p10Price: 68.39,
          p50Price: 0x45,
          sampleOfferId: "6a0cc8506fbde312c0590def",
        },
      ],
      offers: [
        {
          id: "6a0ccf8995498dd61da9c380",
          price: 54.898,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0ccbef32cc7eead9d18e03",
          price: 54.918,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0cba60240c05c97f5f92bf",
          price: 0x37,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0caf51de8f16bec4879d75",
          price: 0x38,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0cb32cd4d89c0e917b8da1",
          price: 0x38,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0cb3ee690e0fe480b82746",
          price: 0x38,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0cb4e1385386c1e2c6d817",
          price: 0x38,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0c9373505754d69a24d704",
          price: 56.299,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0c937b1c81298e4a29f886",
          price: 56.299,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0c9383751be7d5db1d482c",
          price: 56.299,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0c901db09f9fd3d1a0ce22",
          price: 56.369,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0c8628ddd9411a1f9040b3",
          price: 56.38,
          skills: { dodge: 0x15 },
        },
        {
          id: "6a0cba9dce82d1aed7f2b6d2",
          price: 57.425,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0cbaa9297b921deee4854c",
          price: 57.425,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0cbaaf22e727783b650d37",
          price: 57.425,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0cbac1fc0151746e33ed3e",
          price: 57.425,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0ccc4e0aef30d74a42f23c",
          price: 57.425,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0cb9eaede0e7856a3d3103",
          price: 57.49,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0cb12942c3954108e8b37e",
          price: 57.499,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0c902dbe10f3a837c27e97",
          price: 57.59,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0a374e4543662805346cef",
          price: 57.99,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a09a776a29ee514495ce74b",
          price: 0x3a,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a09a78c252fd0ed36085d24",
          price: 0x3a,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a09ba2601317866bdfbd0c2",
          price: 58.42,
          skills: { dodge: 0x16 },
        },
        {
          id: "6a0cb67ca928e04202d58806",
          price: 0x3c,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cbae70450530a9a464421",
          price: 60.395,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cba43e5afba85e7cb59a4",
          price: 60.49,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cb688f1ffc552243704e4",
          price: 60.5,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cb2a66f520a36f614ae83",
          price: 0x3d,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cb28df1ffc55224335f33",
          price: 61.9,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cb0ff019f0226b9caa266",
          price: 0x3e,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cae71240c05c97f570524",
          price: 62.1,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cad1215139e66c993bbb4",
          price: 62.199,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cad19240c05c97f54d600",
          price: 62.199,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cad2e556106fb60910707",
          price: 62.199,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0caa06d1c0c3cba73e31d9",
          price: 62.4,
          skills: { dodge: 0x17 },
        },
        {
          id: "6a0cc277e6d9cc1268cf8ee0",
          price: 65.2,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0cc10b505754d69a512f17",
          price: 65.75,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0cc07a748370ec8d951d3d",
          price: 65.759,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0cbc5614c0a61282ca1a49",
          price: 65.8,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0cbf9222e727783b68846e",
          price: 65.99,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0cb5e7f1ffc5522435f8c3",
          price: 0x42,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0cb34e223c6974211975bf",
          price: 0x43,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0cb3544c1c1ac46bd83d1a",
          price: 0x43,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0ca29e4c1c1ac46bbb4dc7",
          price: 67.54,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0caf43c5fa963059f0b68a",
          price: 67.545,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0ca2b242c3954108d222ba",
          price: 67.549,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a07709eec02247456097bac",
          price: 67.55,
          skills: { dodge: 0x18 },
        },
        {
          id: "6a0cc8506fbde312c0590def",
          price: 68.39,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0cc85e0aef30d74a413a48",
          price: 68.39,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0ca2b50450530a9a276488",
          price: 68.4,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0c82878cecb6e11196ab65",
          price: 0x45,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0c9ae81aca5eb348ffac76",
          price: 0x45,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0c9b29c74e15be77653600",
          price: 0x45,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0ca24bcb6401ccea07ac64",
          price: 0x45,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0cc6c83e4f52241e4ee8ad",
          price: 0x45,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0c76ab332d5dda75dfd369",
          price: 69.49,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0bed83b8a66abeff7c040c",
          price: 69.999,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a0bed9db8321e90e358c3c6",
          price: 69.999,
          skills: { dodge: 0x19 },
        },
        {
          id: "6a07e04933715921910cfd38",
          price: 0x46,
          skills: { dodge: 0x19 },
        },
      ],
      fetchedAt: "2026-05-19T21:07:25.368Z",
      passesUsed: 0x5,
    },
    boots5: {
      n: 0x32,
      price: {
        n: 0x32,
        min: 0x8c,
        p10: 144.97,
        p50: 163.99,
        p90: 0xbc,
        max: 189.99,
        mean: 162.937,
      },
      skills: {
        dodge: {
          n: 0x32,
          min: 0x1f,
          p10: 0x1f,
          p50: 0x25,
          p90: 0x27,
          max: 0x28,
          mean: 35.74,
        },
      },
      priceByRoll: [
        {
          skills: { dodge: 0x26 },
          n: 0x9,
          minPrice: 0xa7,
          p10Price: 0xa7,
          p50Price: 171.99,
          sampleOfferId: "6a0c7c77019f0226b98ffb85",
        },
        {
          skills: { dodge: 0x27 },
          n: 0x9,
          minPrice: 0xaf,
          p10Price: 0xaf,
          p50Price: 178.218,
          sampleOfferId: "6a0c7c9059dc7bdd6f86bdca",
        },
        {
          skills: { dodge: 0x1f },
          n: 0x8,
          minPrice: 0x8c,
          p10Price: 0x8c,
          p50Price: 0x90,
          sampleOfferId: "6a0cc842a3508529f3b0cdf9",
        },
        {
          skills: { dodge: 0x22 },
          n: 0x8,
          minPrice: 152.986,
          p10Price: 152.986,
          p50Price: 153.465,
          sampleOfferId: "6a0ccef4f0b60a4260e517d5",
        },
        {
          skills: { dodge: 0x25 },
          n: 0x5,
          minPrice: 163.99,
          p10Price: 163.99,
          p50Price: 0xa4,
          sampleOfferId: "6a0cc3fbe5afba85e7cf97fd",
        },
        {
          skills: { dodge: 0x23 },
          n: 0x4,
          minPrice: 152.9,
          p10Price: 152.9,
          p50Price: 0x9a,
          sampleOfferId: "6a0ccdafd02ec0ec5dd306f2",
        },
        {
          skills: { dodge: 0x20 },
          n: 0x3,
          minPrice: 144.97,
          p10Price: 144.97,
          p50Price: 144.98,
          sampleOfferId: "6a0cc4c9e788b380ec883915",
        },
        {
          skills: { dodge: 0x28 },
          n: 0x3,
          minPrice: 189.5,
          p10Price: 189.5,
          p50Price: 189.99,
          sampleOfferId: "6a0ca4a1e5afba85e7b271b6",
        },
        {
          skills: { dodge: 0x21 },
          n: 0x1,
          minPrice: 0x95,
          p10Price: 0x95,
          p50Price: 0x95,
          sampleOfferId: "6a0c1155b56a2e4e14e0ebbb",
        },
        {
          skills: { dodge: 0x24 },
          n: 0x0,
          minPrice: 158.44,
          p10Price: 158.44,
          p50Price: 158.44,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0cc842a3508529f3b0cdf9",
          price: 0x8c,
          skills: { dodge: 0x1f },
        },
        {
          id: "6a0b3943ecfac9a57b200639",
          price: 143.99,
          skills: { dodge: 0x1f },
        },
        {
          id: "6a0af72bdf578f58ec877679",
          price: 0x90,
          skills: { dodge: 0x1f },
        },
        {
          id: "6a0af731b0bd00103870a34e",
          price: 0x90,
          skills: { dodge: 0x1f },
        },
        {
          id: "6a0b959663e74c9be41a3ea0",
          price: 0x90,
          skills: { dodge: 0x1f },
        },
        {
          id: "6a0cc4c9e788b380ec883915",
          price: 144.97,
          skills: { dodge: 0x20 },
        },
        {
          id: "6a0cc209ede0e7856a3ff7a3",
          price: 144.98,
          skills: { dodge: 0x20 },
        },
        {
          id: "6a0ca64837311e064df7f339",
          price: 0x91,
          skills: { dodge: 0x20 },
        },
        {
          id: "6a0a1c130843a459072df891",
          price: 145.006,
          skills: { dodge: 0x1f },
        },
        {
          id: "6a0a15083e5d65bf5d79e1a9",
          price: 146.7,
          skills: { dodge: 0x1f },
        },
        {
          id: "6a0c1155b56a2e4e14e0ebbb",
          price: 0x95,
          skills: { dodge: 0x21 },
        },
        {
          id: "69f24e5ebe903ba7331453a3",
          price: 149.999,
          skills: { dodge: 0x1f },
        },
        {
          id: "6a0ccdafd02ec0ec5dd306f2",
          price: 152.9,
          skills: { dodge: 0x23 },
        },
        {
          id: "6a0ccef4f0b60a4260e517d5",
          price: 152.986,
          skills: { dodge: 0x22 },
        },
        {
          id: "6a0cc1e8218a2fe5f0adb688",
          price: 152.99,
          skills: { dodge: 0x22 },
        },
        {
          id: "6a0c91b5dba93000acb842ec",
          price: 0x99,
          skills: { dodge: 0x22 },
        },
        {
          id: "6a0c91d95cfd025f84f70367",
          price: 0x99,
          skills: { dodge: 0x22 },
        },
        {
          id: "6a0ca4383fd37b4c0be2f1ef",
          price: 0x99,
          skills: { dodge: 0x23 },
        },
        {
          id: "6a0c5df8a928e0420249d7eb",
          price: 153.465,
          skills: { dodge: 0x22 },
        },
        {
          id: "6a0c8e0408ed149c50de984b",
          price: 153.9,
          skills: { dodge: 0x22 },
        },
        {
          id: "6a0c5af7fc0151746e9e2a77",
          price: 0x9a,
          skills: { dodge: 0x22 },
        },
        {
          id: "6a0ca1fc42c3954108d195c3",
          price: 0x9a,
          skills: { dodge: 0x23 },
        },
        {
          id: "6a0c3c52297b921dee0796ec",
          price: 0x9b,
          skills: { dodge: 0x22 },
        },
        {
          id: "6a0c6e42078227647775eef4",
          price: 0x9b,
          skills: { dodge: 0x23 },
        },
        {
          id: "6a0cc3fbe5afba85e7cf97fd",
          price: 163.99,
          skills: { dodge: 0x25 },
        },
        {
          id: "6a0cc99e396e7531ecc259af",
          price: 163.99,
          skills: { dodge: 0x25 },
        },
        {
          id: "6a0b84c96975ba3e9b6c72b2",
          price: 0xa4,
          skills: { dodge: 0x25 },
        },
        {
          id: "6a0b21ba1bb21c876a3c7691",
          price: 0xa5,
          skills: { dodge: 0x25 },
        },
        {
          id: "6a0cb7673fd37b4c0bff8bf9",
          price: 0xa5,
          skills: { dodge: 0x25 },
        },
        {
          id: "6a0c7c77019f0226b98ffb85",
          price: 0xa7,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0c71ea0a1870c04d14b28a",
          price: 0xa8,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0c7137dc6b2f452a0c33e9",
          price: 0xa9,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0c17ecde8f16bec4686fd2",
          price: 0xaa,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0bd724eb47db9b21744074",
          price: 171.99,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0bab671e4d64d1197ea760",
          price: 0xad,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0b84e2f446076960359d39",
          price: 0xae,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0c7c9059dc7bdd6f86bdca",
          price: 0xaf,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a0b8499b325b2be525c58b5",
          price: 0xb0,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a0b84a863e74c9be416577c",
          price: 0xb0,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a0b3486ca649e72afad4726",
          price: 0xb1,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0afa7a57a773a0e005ecdc",
          price: 177.97,
          skills: { dodge: 0x26 },
        },
        {
          id: "6a0bc6960af439fc734d79b6",
          price: 0xb2,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a0c5e8b0450530a9abb2469",
          price: 178.218,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a0c5e931acc9b089e92d383",
          price: 178.218,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a0a23459c3fb9c4eb9e1a08",
          price: 185.1,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a087ca7e9305f91c32f307a",
          price: 0xbc,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a089b05d959b9c327da9138",
          price: 0xbc,
          skills: { dodge: 0x27 },
        },
        {
          id: "6a0ca4a1e5afba85e7b271b6",
          price: 189.5,
          skills: { dodge: 0x28 },
        },
        {
          id: "6a0a76bffae46d460105c8a9",
          price: 189.99,
          skills: { dodge: 0x28 },
        },
        {
          id: "6a0b0e91f93a2c9eaa7a303c",
          price: 189.99,
          skills: { dodge: 0x28 },
        },
      ],
      fetchedAt: "2026-05-19T21:07:46.844Z",
      passesUsed: 0x5,
    },
    boots6: {
      n: 0x1f,
      price: {
        n: 0x1f,
        min: 0x17d,
        p10: 389.216,
        p50: 445.5,
        p90: 0x280,
        max: 0x8e679c2f5e450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
        mean: 0x497fcc7b8b7e740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
      },
      skills: {
        dodge: {
          n: 0x1f,
          min: 0x33,
          p10: 0x35,
          p50: 0x3a,
          p90: 0x3c,
          max: 0x3c,
          mean: 57.29,
        },
      },
      priceByRoll: [
        {
          skills: { dodge: 0x3c },
          n: 0x9,
          minPrice: 0x1e4,
          p10Price: 0x1e4,
          p50Price: 0x1ef,
          sampleOfferId: "6a0c98b1be10f3a837cba683",
        },
        {
          skills: { dodge: 0x3b },
          n: 0x5,
          minPrice: 443.5,
          p10Price: 443.5,
          p50Price: 0x1bd,
          sampleOfferId: "6a0cbe231acc9b089e1c4c94",
        },
        {
          skills: { dodge: 0x38 },
          n: 0x4,
          minPrice: 0x18c,
          p10Price: 0x18c,
          p50Price: 445.5,
          sampleOfferId: "6a0c946aa928e04202a37547",
        },
        {
          skills: { dodge: 0x3a },
          n: 0x4,
          minPrice: 441.7,
          p10Price: 441.7,
          p50Price: 0x1f4,
          sampleOfferId: "6a0ca1776f520a36f6f62eb3",
        },
        {
          skills: { dodge: 0x39 },
          n: 0x3,
          minPrice: 424.999,
          p10Price: 424.999,
          p50Price: 0x1a9,
          sampleOfferId: "6a0ca15efa3d9a79ce56b0c6",
        },
        {
          skills: { dodge: 0x33 },
          n: 0x2,
          minPrice: 382.353,
          p10Price: 382.353,
          p50Price: 0x1b8,
          sampleOfferId: "6a0cac8269769ff850365f0a",
        },
        {
          skills: { dodge: 0x35 },
          n: 0x2,
          minPrice: 389.216,
          p10Price: 389.216,
          p50Price: 0x186,
          sampleOfferId: "6a0cac22748370ec8d85576e",
        },
        {
          skills: { dodge: 0x34 },
          n: 0x1,
          minPrice: 0x17d,
          p10Price: 0x17d,
          p50Price: 0x17d,
          sampleOfferId: "6a0cba1244c156ae4b1fc5d7",
        },
        {
          skills: { dodge: 0x36 },
          n: 0x1,
          minPrice: 0x185,
          p10Price: 0x185,
          p50Price: 0x185,
          sampleOfferId: "6a0cac06ae880baa0bde3018",
        },
        {
          skills: { dodge: 0x37 },
          n: 0x0,
          minPrice: 392.5,
          p10Price: 392.5,
          p50Price: 392.5,
          sampleOfferId: null,
          _interpolated: !![],
        },
      ],
      offers: [
        {
          id: "6a0cba1244c156ae4b1fc5d7",
          price: 0x17d,
          skills: { dodge: 0x34 },
        },
        {
          id: "6a0cac8269769ff850365f0a",
          price: 382.353,
          skills: { dodge: 0x33 },
        },
        {
          id: "6a0cac06ae880baa0bde3018",
          price: 0x185,
          skills: { dodge: 0x36 },
        },
        {
          id: "6a0cac22748370ec8d85576e",
          price: 389.216,
          skills: { dodge: 0x35 },
        },
        {
          id: "6a0c210c269398eb51938f78",
          price: 0x186,
          skills: { dodge: 0x35 },
        },
        {
          id: "6a0c946aa928e04202a37547",
          price: 0x18c,
          skills: { dodge: 0x38 },
        },
        {
          id: "6a088dc2b5661813d5d6a6b0",
          price: 0x190,
          skills: { dodge: 0x38 },
        },
        {
          id: "6a0ca15efa3d9a79ce56b0c6",
          price: 424.999,
          skills: { dodge: 0x39 },
        },
        {
          id: "6a074bae52867fa1135d9e70",
          price: 0x1a9,
          skills: { dodge: 0x39 },
        },
        {
          id: "6a00e91244200790e0ebd699",
          price: 0x1aa,
          skills: { dodge: 0x39 },
        },
        {
          id: "69ee8c14c4966e7e1569a6c1",
          price: 0x1b8,
          skills: { dodge: 0x33 },
        },
        {
          id: "6a0ca1776f520a36f6f62eb3",
          price: 441.7,
          skills: { dodge: 0x3a },
        },
        {
          id: "6a0cbe231acc9b089e1c4c94",
          price: 443.5,
          skills: { dodge: 0x3b },
        },
        {
          id: "6a099b03c9df992962ccd48e",
          price: 0x1bc,
          skills: { dodge: 0x3b },
        },
        {
          id: "6a0182c21495f85fa3ac0121",
          price: 0x1bd,
          skills: { dodge: 0x3b },
        },
        {
          id: "69f7c5f5b8f4ff5ca2646d5d",
          price: 445.5,
          skills: { dodge: 0x38 },
        },
        {
          id: "69f21c05d6e4a3f6385c7ce9",
          price: 0x1db,
          skills: { dodge: 0x38 },
        },
        {
          id: "69fa533a464906e076e69f2e",
          price: 0x1db,
          skills: { dodge: 0x3a },
        },
        {
          id: "6a0c98b1be10f3a837cba683",
          price: 0x1e4,
          skills: { dodge: 0x3c },
        },
        {
          id: "6a08ead7ac2928d068fd2819",
          price: 0x1e5,
          skills: { dodge: 0x3c },
        },
        {
          id: "6a0506179f08158ad4a0b712",
          price: 0x1ea,
          skills: { dodge: 0x3c },
        },
        {
          id: "6a037c36a11574bdb8a078fb",
          price: 0x1ed,
          skills: { dodge: 0x3c },
        },
        {
          id: "69feda0faf6d84b1f7c6fd29",
          price: 0x1ef,
          skills: { dodge: 0x3c },
        },
        {
          id: "69f71f0fa4044fbdfcefd0aa",
          price: 0x1f4,
          skills: { dodge: 0x3a },
        },
        {
          id: "69dc69ebb088fc9a0ec2dda3",
          price: 514.85,
          skills: { dodge: 0x3a },
        },
        {
          id: "69f54af27e6cea98e2f307e2",
          price: 0x21c,
          skills: { dodge: 0x3b },
        },
        {
          id: "6a075c3e9993ebdf339b2fff",
          price: 0x226,
          skills: { dodge: 0x3c },
        },
        {
          id: "69b58c1a86bf16ada06ad20d",
          price: 0x280,
          skills: { dodge: 0x3b },
        },
        {
          id: "69fc100a46384987b6c3b936",
          price: 0x2d8,
          skills: { dodge: 0x3c },
        },
        {
          id: "69b58c2b59b132366aadedf3",
          price: 0x2f8,
          skills: { dodge: 0x3c },
        },
        {
          id: "693fd31212e6c7b20c90534b",
          price: 0x8e679c2f5e450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
          skills: { dodge: 0x3c },
        },
      ],
      fetchedAt: "2026-05-19T21:08:08.404Z",
      passesUsed: 0x5,
    },
  },
  errors: {},
  gearRangesGeneratedAt: "2026-05-13T07:41:39.482Z",
  stats: {
    codesAttempted: 0x24,
    ok: 0x24,
    errors: 0x0,
    totalOffers: 0x66e,
    totalCalls: 0xb4,
    passesPerCode: 0x5,
    elapsedSec: 742.7,
    pacingMinSec: 3.3,
    pacingMaxSec: 4.1,
    interpolated: !![],
    upstreamHosts:
      "api2.warera.io,api5.warera.io,api6.warera.io,api4.warera.io",
  },
};
// Local mirror — kept in sync via the api.js listener so existing build-panel
// code can still reference _gearSnapshot directly.
let _gearSnapshot = null;
function refreshMinMaxButtonState() {
  const { snapshot, error } = getGearSnapshotState();
  _gearSnapshot = snapshot;
  document.querySelectorAll('.build-btn[data-build="minmax"], .build-btn[data-build="loot"], .build-btn[data-build="lvlup"]')
    .forEach(btn => {
      if (snapshot) {
        btn.disabled = false;
        btn.title = `Market snapshot loaded · ${snapshot.transactionsScanned} txns · generated ${snapshot.generatedAt}`;
      } else if (error) {
        btn.disabled = true;
        btn.title = 'Market snapshot unavailable: ' + error.message;
      } else {
        btn.disabled = true;
        btn.title = 'Loading market snapshot…';
      }
    });
}
setGearSnapshotListener(refreshMinMaxButtonState);
loadGearSnapshot().catch(() => {});
function showDropdownMessage(_0x27dac2, _0x5c3612 = ![]) {
  const _0x5a0e97 = $("usernameDropdown");
  ((_0x5a0e97["innerHTML"] =
    '<li class="username-dropdown-msg' +
    (_0x5c3612 ? " error" : "") +
    '">' +
    escapeHtml(_0x27dac2) +
    "</li>"),
    (_0x5a0e97["hidden"] = ![]));
}
function renderUsernameDropdown(_0x1acf5d) {
  const _0x43ab4f = $("usernameDropdown");
  if (!_0x1acf5d["length"]) {
    showDropdownMessage("No matches");
    return;
  }
  ((_0x43ab4f["innerHTML"] = _0x1acf5d["map"](
    (_0x1024e3) =>
      '\n        <li class="username-dropdown-item" data-id="' +
      escapeHtml(_0x1024e3["id"]) +
      '" data-name="' +
      escapeHtml(_0x1024e3["username"]) +
      '">\n            <span class="ud-name">' +
      escapeHtml(_0x1024e3["username"]) +
      '</span>\n            <span class="ud-lvl">lvl ' +
      _0x1024e3["level"] +
      "</span>\n        </li>",
  )["join"]("")),
    (_0x43ab4f["hidden"] = ![]),
    _0x43ab4f["querySelectorAll"](".username-dropdown-item")["forEach"](
      (_0x7fcc70) => {
        _0x7fcc70["addEventListener"]("mousedown", (_0x321e93) => {
          (_0x321e93["preventDefault"](),
            ($("username")["value"] = _0x7fcc70["dataset"]["name"]),
            (_0x43ab4f["hidden"] = !![]),
            analyze(_0x7fcc70["dataset"]["id"], _0x7fcc70["dataset"]["name"]));
        });
      },
    ));
}
let _usernameDebounce = null,
  _usernameSearchId = 0x0;
($("username")["addEventListener"]("input", () => {
  if (_usernameDebounce) clearTimeout(_usernameDebounce);
  const _0x53b3bc = $("username")["value"]["trim"]();
  if (_0x53b3bc["length"] < 0x2) {
    $("usernameDropdown")["hidden"] = !![];
    return;
  }
  const _0x1d6232 = ++_usernameSearchId;
  (showDropdownMessage("Searching…"),
    (_usernameDebounce = setTimeout(async () => {
      let _0xd8fdb1;
      try {
        _0xd8fdb1 = await searchUsernames(_0x53b3bc);
      } catch (_0x15fb4c) {
        if (_0x1d6232 !== _usernameSearchId) return;
        const _0x540484 =
          _0x15fb4c?.["kind"] === "network"
            ? "Search failed — WarEra API unreachable"
            : _0x15fb4c?.["status"] === 0x1ad
              ? "Rate-limited — wait a few seconds and try again"
              : "Search failed" +
                (_0x15fb4c?.["status"]
                  ? " (HTTP " + _0x15fb4c["status"] + ")"
                  : "");
        showDropdownMessage(_0x540484, !![]);
        return;
      }
      if (_0x1d6232 !== _usernameSearchId) return;
      renderUsernameDropdown(_0xd8fdb1);
    }, 0x1c2)));
}),
  $("username")["addEventListener"]("blur", () =>
    setTimeout(() => {
      $("usernameDropdown")["hidden"] = !![];
    }, 0xc8),
  ),
  $("username")["addEventListener"]("focus", () => {
    if ($("usernameDropdown")["children"]["length"] > 0x0)
      $("usernameDropdown")["hidden"] = ![];
  }),
  document["addEventListener"]("click", (_0x595cf4) => {
    if (!_0x595cf4["target"]["closest"](".username-wrap"))
      $("usernameDropdown")["hidden"] = !![];
  }),
  $("username")["addEventListener"]("keydown", (_0x3ae2d8) => {
    if (_0x3ae2d8["key"] === "Enter") analyze();
  }));
function mapMarketPrices(_0x6c2565) {
  const _0x38aa4b = OPT["DEFAULT_MARKET_PRICES"];
  return {
    scrapPrice: _0x6c2565?.["scraps"] ?? _0x38aa4b["scrapPrice"],
    casePrice: _0x6c2565?.["case1"] ?? _0x38aa4b["casePrice"],
    redCasePrice: _0x6c2565?.["case2"] ?? _0x38aa4b["redCasePrice"],
    bulletPrice: _0x6c2565?.["lightAmmo"] ?? _0x38aa4b["bulletPrice"],
    pillPrice: _0x6c2565?.["cocain"] ?? _0x38aa4b["pillPrice"],
    breadPrice: _0x6c2565?.["bread"] ?? _0x38aa4b["breadPrice"],
    meatPrice: _0x6c2565?.["steak"] ?? _0x38aa4b["meatPrice"],
    fishPrice: _0x6c2565?.["cookedFish"] ?? _0x38aa4b["fishPrice"],
  };
}
function buildOptimizerUserData(_0x1fa024) {
  const _0x53efed = _0x1fa024["user"],
    _0x2cb29a =
      _0x53efed?.["skills"]?.["attack"]?.["militaryRankPercent"] ?? 0x14;
  return {
    lvl: _0x53efed?.["leveling"]?.["level"] || 0x1,
    marketPrices: mapMarketPrices(_0x1fa024["prices"]),
    rankBonus: 0x1 + _0x2cb29a / 0x64,
    countryBonus: 1.9,
    companyCount: _0x1fa024["totals"]["companyCount"],
    avgAePerCompany: _0x1fa024["totals"]["avgAePerCompany"],
    workersProfit: _0x1fa024["totals"]["workersNet"] ?? 0x0,
    entrep: _0x1fa024["totals"]["entrep"],
    energy: _0x1fa024["totals"]["energy"],
    aeNet: _0x1fa024["totals"]["aeNet"],
    employer: _0x1fa024["employer"]
      ? {
          netWage: _0x1fa024["employer"]["netWage"],
          productionBonus: _0x1fa024["employer"]["productionBonus"],
        }
      : null,
  };
}
let _optWorker = null,
  _optRunId = 0x0;
const _buildOverrides = { sustainable: {}, warEco: {} },
  _lastBuilds = { sustainable: null, warEco: null },
  _gearCheck = { bounty: 0.15, countryBonus: 0x5a, targetNet: 0xf },
  _pillDebuff = { bounty: 0.15, hours: 0x10, includeNone: !![] };
let _warEcoStarted = ![],
  _sustainableStarted = ![];
export const _buildCache = new Map();
function _buildCacheKey(_0x4bab63, _0x4db51d) {
  return JSON["stringify"]({
    p: _0x4bab63,
    l: _0x4db51d["lvl"],
    sl: _0x4db51d["spentLimitOverride"],
    fs: _0x4db51d["fixedSkills"],
    gt: _0x4db51d["gearTiersOverride"],
    ft: _0x4db51d["foodTypeOverride"],
    up: _0x4db51d["usePillOverride"],
    b: _0x4db51d["bountyOverride"],
    h: _0x4db51d["hoursOverride"],
    dm: _0x4db51d["dmgMultiplierOverride"],
    ed: _0x4db51d["excludeDailyIncomeOverride"],
    ei: _0x4db51d["excludeItemLootOverride"],
    o: _0x4db51d["objectiveOverride"],
    rm: _0x4db51d["rollMultiplier"],
    cb: _0x4db51d["countryBonus"],
    ms: _0x4db51d["minSkillsOverride"],
    xs: _0x4db51d["maxSkillsOverride"],
    nc: _0x4db51d["noStructuralCapsOverride"],
    rs: _0x4db51d["reservedSPOverride"],
    go: _0x4db51d["gearOverrides"] ? _0x4db51d["_gearOverridesKey"] : null,
  });
}
function _ensureOptWorker() {
  if (_optWorker) return _optWorker;
  const _0x5c2e31 =
      "\n        const OPT = " +
      _OPT_SOURCE +
      ";\n        self.onmessage = (e) => {\n            const { runId, presetName, userData } = e.data;\n            const t0 = Date.now();\n            const result = OPT.optimize(presetName, userData, (g, total, dmg) => {\n                self.postMessage({ runId, type: 'progress', g, total, dmg, elapsed: Date.now() - t0 });\n            });\n            self.postMessage({ runId, type: 'result', result });\n        };\n    ",
    _0x3c9caf = URL["createObjectURL"](
      new Blob([_0x5c2e31], { type: "application/javascript" }),
    );
  return ((_optWorker = new Worker(_0x3c9caf)), _optWorker);
}
function _terminateOptWorker() {
  _optWorker && (_optWorker["terminate"](), (_optWorker = null));
}
function _spawnEnvelopeWorker(_0x5a7dff, _0x290506, _0x1218f5) {
  return new Promise((_0x53c4a4, _0x19f11c) => {
    const _0xd0051 =
        "\n            const OPT = " +
        _OPT_SOURCE +
        ";\n            self.onmessage = (e) => {\n                const { presetName, userData } = e.data;\n                try {\n                    const result = OPT.optimize(presetName, userData, (g, total, dmg) => {\n                        self.postMessage({ type: 'progress', g, total, dmg });\n                    });\n                    self.postMessage({ type: 'result', result });\n                } catch (err) {\n                    self.postMessage({ type: 'error', message: err.message });\n                }\n            };\n        ",
      _0x2053a8 = URL["createObjectURL"](
        new Blob([_0xd0051], { type: "application/javascript" }),
      ),
      _0x12a11e = new Worker(_0x2053a8);
    ((_0x12a11e["onmessage"] = (_0x1f1e9b) => {
      const _0x1fabb6 = _0x1f1e9b["data"];
      if (_0x1fabb6["type"] === "progress" && _0x1218f5)
        _0x1218f5(_0x1fabb6["g"], _0x1fabb6["total"], _0x1fabb6["dmg"]);
      else {
        if (_0x1fabb6["type"] === "result")
          (_0x12a11e["terminate"](),
            URL["revokeObjectURL"](_0x2053a8),
            _0x53c4a4(_0x1fabb6["result"]));
        else
          _0x1fabb6["type"] === "error" &&
            (_0x12a11e["terminate"](),
            URL["revokeObjectURL"](_0x2053a8),
            _0x19f11c(new Error(_0x1fabb6["message"])));
      }
    }),
      (_0x12a11e["onerror"] = (_0x3281fb) => {
        (_0x12a11e["terminate"](),
          URL["revokeObjectURL"](_0x2053a8),
          _0x19f11c(new Error(_0x3281fb["message"] || "worker error")));
      }),
      _0x12a11e["postMessage"]({ presetName: _0x5a7dff, userData: _0x290506 }));
  });
}
export function renderBuildPanel() {
  const _0x1b9df5 = $("buildPanel");
  if (!state.activeBuild || !state.lastAnalysis) {
    (_terminateOptWorker(), (_0x1b9df5["innerHTML"] = ""));
    return;
  }
  if (state.activeBuild === "gear-check") return renderGearCheckForm();
  if (state.activeBuild === "pill-debuff") return renderPillDebuffForm();
  if (state.activeBuild === "war-eco" && !_warEcoStarted) return renderWarEcoForm();
  if (state.activeBuild === "sustainable" && !_sustainableStarted)
    return renderSustainableForm();
  if (state.activeBuild === "minmax" && !_minMaxStarted) return renderMinMaxForm();
  if (state.activeBuild === "minmax") return runMinMaxBuild();
  if (state.activeBuild === "loot" && !_lootStarted) return renderLootForm();
  if (state.activeBuild === "loot") return runLootBuild();
  if (state.activeBuild === "lvlup" && !_lvlUpStarted) return renderLvlUpForm();
  if (state.activeBuild === "lvlup") return runLvlUpBuild();
  const _0x425f6a = state.activeBuild === "sustainable" ? "sustainable" : "warEco",
    _0x57e80c = OPT["PRESET_DEFS"][_0x425f6a]["label"],
    _0x5f3c27 = buildOptimizerUserData(state.lastAnalysis),
    _0x380280 = _buildOverrides[_0x425f6a];
  if (_0x380280["spentLimitOverride"] !== undefined)
    _0x5f3c27["spentLimitOverride"] = _0x380280["spentLimitOverride"];
  if (_0x380280["fixedSkills"])
    _0x5f3c27["fixedSkills"] = _0x380280["fixedSkills"];
  if (_0x380280["lvl"]) _0x5f3c27["lvl"] = _0x380280["lvl"];
  const _0x2c87c3 = _buildCacheKey(_0x425f6a, _0x5f3c27);
  if (_buildCache["has"](_0x2c87c3)) {
    renderBuildResult(_0x425f6a, _0x5f3c27, _buildCache["get"](_0x2c87c3));
    return;
  }
  const _0x17d8b2 = ++_optRunId;
  ((_0x1b9df5["innerHTML"] = wrapForWarEco(
    '\n        <div class="build-panel">\n            <h3>' +
      _0x57e80c +
      '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting optimizer…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n        </div>',
    _0x425f6a,
  )),
    document["getElementById"]("optCancelBtn")["addEventListener"](
      "click",
      () => {
        _terminateOptWorker();
        const _0x49cfbe = document["getElementById"]("optProgressLabel");
        if (_0x49cfbe) _0x49cfbe["textContent"] = "Cancelled.";
      },
    ),
    _terminateOptWorker());
  const _0x219309 = _ensureOptWorker();
  ((_0x219309["onmessage"] = (_0xe0a562) => {
    const _0x3ed577 = _0xe0a562["data"];
    if (_0x3ed577["runId"] !== _0x17d8b2) return;
    if (_0x3ed577["type"] === "progress") {
      const _0x477dda = Math["round"](
          (_0x3ed577["g"] / _0x3ed577["total"]) * 0x64,
        ),
        _0x557d8e = document["getElementById"]("optProgressBar"),
        _0x5607ca = document["getElementById"]("optProgressLabel");
      if (_0x557d8e) _0x557d8e["style"]["width"] = _0x477dda + "%";
      if (_0x5607ca)
        _0x5607ca["textContent"] =
          "Optimizing " +
          _0x3ed577["g"] +
          "/" +
          _0x3ed577["total"] +
          " gear sets · " +
          (_0x3ed577["elapsed"] / 0x3e8)["toFixed"](0x1) +
          "s" +
          (_0x3ed577["dmg"]
            ? " · best dmg " +
              Math["round"](_0x3ed577["dmg"])["toLocaleString"]()
            : "");
    } else
      _0x3ed577["type"] === "result" &&
        (_buildCache["set"](_0x2c87c3, _0x3ed577["result"]),
        (function () {
          let _res = _0x3ed577["result"];
          if (!_res.bestBuild && _0x5f3c27.gearOverrides) {
            const _fp = Object.assign({}, _0x5f3c27, {
              gearOverrides: null,
              useLiveOffers: false,
            });
            const _fk = _buildCacheKey(_0x425f6a, _fp);
            if (!_buildCache.has(_fk))
              _buildCache.set(_fk, OPT.runOptimizer(_fp, null));
            _res = _buildCache.get(_fk);
          }
          _buildCache["set"](_0x2c87c3, _res);
          renderBuildResult(_0x425f6a, _0x5f3c27, _res);
        })());
  }),
    (_0x219309["onerror"] = (_0x1ebfec) => {
      _0x1b9df5["innerHTML"] = wrapForWarEco(
        '<div class="build-panel"><h3>' +
          _0x57e80c +
          '</h3>\n            <div class="build-loading">Optimizer error: ' +
          (_0x1ebfec["message"] || "unknown") +
          ".</div></div>",
        _0x425f6a,
      );
    }),
    _0x219309["postMessage"]({
      runId: _0x17d8b2,
      presetName: _0x425f6a,
      userData: _0x5f3c27,
    }));
}
function renderBuildResult(_0x13c858, _0x556fc8, _0x4c8511) {
  const _0x2752c1 = $("buildPanel"),
    _0x3fb149 = OPT["PRESET_DEFS"][_0x13c858],
    _0x47b711 = _0x4c8511["bestBuild"];
  if (!_0x47b711) {
    const _0x1f1ee7 =
      _0x556fc8["spentLimitOverride"] !== undefined
        ? _0x556fc8["spentLimitOverride"]
        : _0x3fb149["spentLimit"]({
            entrep: _0x556fc8["entrep"],
            energy: _0x556fc8["energy"],
            aeNet: _0x556fc8["aeNet"],
          });
    _0x2752c1["innerHTML"] = wrapForWarEco(
      '\n            <div class="build-panel">\n                <h3>' +
        _0x3fb149["label"] +
        '</h3>\n                <div class="build-loading">No feasible build under this preset\'s constraints\n                (spent limit $' +
        _0x1f1ee7["toFixed"](0x2) +
        "). Try the other preset or raise your company count / target net.</div>\n            </div>",
      _0x13c858,
    );
    return;
  }
  _lastBuilds[_0x13c858] = _0x47b711;
  const _0x234a1b = (_0x340fa6) =>
      (_0x340fa6 >= 0x0 ? "+$" : "-$") + Math["abs"](_0x340fa6)["toFixed"](0x2),
    _0x163dc2 = (_0x301c85) => (_0x301c85 >= 0x0 ? "positive" : "negative"),
    _0x86ed81 = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      ["map"]((_0x39fba9) => {
        const _0x4b9ec2 = _0x47b711["gear"][_0x39fba9],
          _0x1678e0 = Object["entries"](_0x4b9ec2)
            ["filter"](
              ([_0x360d37]) =>
                _0x360d37 !== "type" &&
                _0x360d37 !== "price" &&
                _0x360d37 !== "buyPrice",
            )
            ["map"](([_0x4bd2a9, _0x470d8]) => _0x4bd2a9 + ": " + _0x470d8)
            ["join"](", ");
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          _0x39fba9 +
          '</td>\n            <td><span class="opt-tier ' +
          _0x4b9ec2["type"] +
          '">' +
          _0x4b9ec2["type"] +
          "</span></td>\n            <td>" +
          _0x1678e0 +
          "</td>\n            <td>$" +
          _0x4b9ec2["buyPrice"]["toFixed"](0x2) +
          "</td>\n        </tr>"
        );
      })
      ["join"](""),
    _0x4d2676 = SKILL_DISPLAY["map"](([_0x7e3e82, _0x30ca3f]) => {
      const _0x42dcc5 = _0x47b711["skills"][_0x7e3e82],
        _0x3079f4 = _0x47b711["skillValues"][_0x7e3e82],
        _0x2be319 = _0x47b711["appliedSkillMin"]?.[_0x7e3e82] ?? 0x0,
        _0x5a149a = _0x47b711["appliedSkillMax"]?.[_0x7e3e82] ?? OPT["MAX_LVL"],
        _0xf17713 = _0x42dcc5 === _0x2be319,
        _0x259091 = _0x42dcc5 === _0x5a149a;
      return (
        "<tr>\n            <td>" +
        _0x30ca3f +
        "</td>\n            <td>" +
        _0x42dcc5 +
        '</td>\n            <td style="color:' +
        (_0xf17713 || _0x259091 ? "#8b8fa3" : "#555a6a") +
        '">' +
        (_0xf17713 ? "min" : _0x259091 ? "max" : "—") +
        "</td>\n            <td>" +
        _0x3079f4["toFixed"](0x1) +
        "</td>\n        </tr>"
      );
    })["join"](""),
    _0x58d529 = buildHusaraiPayload(_0x13c858, _0x556fc8),
    _0x491b6a = {
      none: "None",
      bread: "Bread (+10%)",
      meat: "Meat (+15%)",
      fish: "Fish (+20%)",
    }[_0x3fb149["foodType"]],
    _0x4410c5 =
      OPT["GEAR_TIER_ORDER"]
        ["filter"]((_0x407450) => _0x3fb149["gearTiers"][_0x407450])
        ["join"](" / ") || "—",
    _0x171051 = OPT["buildPresetParams"](_0x13c858, _0x556fc8),
    _0x5bd578 = _0x4c8511["elapsed"]
      ? (_0x4c8511["elapsed"] / 0x3e8)["toFixed"](0x2) + "s"
      : "<1ms",
    _0x46f851 = _0x13c858 === "warEco",
    _0x112675 = -_0x3fb149["spentLimit"]({
      entrep: _0x556fc8["entrep"],
      energy: _0x556fc8["energy"],
      aeNet: _0x556fc8["aeNet"],
    }),
    _0xdd331e = -_0x171051["spentLimit"],
    _0x51c777 = _buildOverrides[_0x13c858]["spentLimitOverride"] !== undefined,
    _0x371116 = _0x46f851
      ? '\n        <div class="opt-target-row">\n            <label for="optNetTarget">Target net / day</label>\n            <span class="opt-target-prefix">$</span>\n            <input type="number" id="optNetTarget" value="' +
        _0xdd331e["toFixed"](0x2) +
        '" step="1" />\n            <button type="button" class="opt-target-btn" id="optApplyTarget">Apply</button>\n            ' +
        (_0x51c777
          ? '<button type="button" class="opt-target-reset" id="optResetTarget" title="Restore the preset\'s default">reset → $' +
            _0x112675["toFixed"](0x0) +
            "</button>"
          : '<span class="opt-target-hint">default: 80% of personal income</span>') +
        "\n        </div>"
      : "",
    _0x4c65bb =
      _0x46f851 && !_0x556fc8["fixedSkills"]
        ? '\n        <button type="button" class="opt-be-btn" id="optBreakEvenBtn">Find break-even gear with these skills →</button>\n        <div id="optBreakEvenResult"></div>'
        : "";
  _0x2752c1["innerHTML"] = wrapForWarEco(
    '\n        <div class="build-panel">\n            <h3>' +
      _0x3fb149["label"] +
      '</h3>\n            <div class="build-meta">Evaluated ' +
      _0x4c8511["combosEvaluated"]["toLocaleString"]() +
      " combos\n                from " +
      _0x4c8511["skillCombosCount"]["toLocaleString"]() +
      " candidates\n                across " +
      (_0x4c8511["gearSetsCount"] - _0x4c8511["gearSetsPruned"]) +
      "/" +
      _0x4c8511["gearSetsCount"] +
      " gear sets · " +
      _0x5bd578 +
      "</div>\n\n            " +
      _0x371116 +
      '\n\n            <div class="opt-hero">\n                <div>\n                    <div class="opt-hero-label">Damage</div>\n                    <div class="opt-hero-value">' +
      _0x47b711["dmg"]["toLocaleString"](undefined, {
        maximumFractionDigits: 0x0,
      }) +
      '</div>\n                </div>\n                <div style="text-align:right">\n                    <div class="opt-hero-label">Net / day</div>\n                    <div class="opt-hero-net ' +
      _0x163dc2(-_0x47b711["spent"]) +
      '">' +
      _0x234a1b(-_0x47b711["spent"]) +
      '</div>\n                </div>\n            </div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Turnover / day</div>\n                    <div class="opt-stat-value positive">$' +
      _0x47b711["profit"]["toFixed"](0x2) +
      '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost / day</div>\n                    <div class="opt-stat-value negative">$' +
      _0x47b711["cost"]["toFixed"](0x2) +
      '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
      _0x47b711["startingCost"]["toFixed"](0x2) +
      '</div>\n                </div>\n            </div>\n\n            <details class="opt-breakdown">\n                <summary>Turnover breakdown · $' +
      _0x47b711["profit"]["toFixed"](0x2) +
      '/day</summary>\n                <table class="opt-bd-table">\n                    <tr><td>Companies (AE)</td><td>$' +
      _0x47b711["profitBreakdown"]["companies"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Item loot (dmg × $0.15/1000)</td><td>$" +
      _0x47b711["profitBreakdown"]["loot"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Chests (landed × loot% × case$)</td><td>$" +
      _0x47b711["profitBreakdown"]["chests"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Red chests</td><td>$" +
      _0x47b711["profitBreakdown"]["redChests"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Weekly cases</td><td>$" +
      _0x47b711["profitBreakdown"]["weekly"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Daily bonus (2 × case$ + 14)</td><td>$" +
      _0x47b711["profitBreakdown"]["daily"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Self-work (entrep slot)</td><td>$" +
      _0x47b711["profitBreakdown"]["selfWork"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Work (energy slot)</td><td>$" +
      _0x47b711["profitBreakdown"]["work"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Bounty</td><td>$" +
      _0x47b711["profitBreakdown"]["bounty"]["toFixed"](0x2) +
      '</td></tr>\n                    <tr class="total"><td>Total</td><td>$' +
      _0x47b711["profit"]["toFixed"](0x2) +
      '</td></tr>\n                </table>\n            </details>\n\n            <details class="opt-breakdown">\n                <summary>Cost breakdown · $' +
      _0x47b711["cost"]["toFixed"](0x2) +
      "/day (" +
      _0x47b711["gunsUsed"]["toFixed"](0x1) +
      " guns, " +
      _0x47b711["setsUsed"]["toFixed"](0x1) +
      " gear sets, " +
      _0x47b711["bulletsUsed"]["toFixed"](0x0) +
      " bullets, " +
      Math["round"](_0x47b711["foodUsed"]) +
      ' food)</summary>\n                <table class="opt-bd-table">\n                    <tr><td>Guns (dmg/100 × hits, net of scraps)</td><td>$' +
      _0x47b711["costBreakdown"]["guns"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Equipment (× hits × (1 − dodge%))</td><td>$" +
      _0x47b711["costBreakdown"]["equipment"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Bullets (1 per attack)</td><td>$" +
      _0x47b711["costBreakdown"]["bullets"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Food</td><td>$" +
      _0x47b711["costBreakdown"]["food"]["toFixed"](0x2) +
      "</td></tr>\n                    <tr><td>Pills</td><td>$" +
      _0x47b711["costBreakdown"]["pills"]["toFixed"](0x2) +
      '</td></tr>\n                    <tr class="total"><td>Total</td><td>$' +
      _0x47b711["cost"]["toFixed"](0x2) +
      '</td></tr>\n                </table>\n            </details>\n\n            <div class="opt-section-title">Gear</div>\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats</th><th>Buy Price</th></tr></thead>\n                <tbody>' +
      _0x86ed81 +
      '</tbody>\n            </table>\n\n            <div class="js-export-area skill-export">\n                <div class="opt-section-title">Skills & Attributes</div>\n                <table class="opt-table">\n                    <thead><tr><th>Skill</th><th>Level</th><th>Bound</th><th>Total Value</th></tr></thead>\n                    <tbody>' +
      _0x4d2676 +
      '</tbody>\n                </table>\n                <button type="button" class="export-img-btn" data-export-kind="skills">📷 Export image</button>\n            </div>\n\n            <div class="opt-config">\n                <div class="opt-config-item"><span>Food:</span> <b>' +
      _0x491b6a +
      '</b></div>\n                <div class="opt-config-item"><span>Pill:</span> <b>' +
      (_0x3fb149["usePill"] ? "on (+60% dmg)" : "off") +
      '</b></div>\n                <div class="opt-config-item"><span>Allowed tiers:</span> <b>' +
      _0x4410c5 +
      '</b></div>\n                <div class="opt-config-item"><span>Spent limit:</span> <b>' +
      _0x234a1b(_0x171051["spentLimit"]) +
      '</b></div>\n                <div class="opt-config-item"><span>Lvl:</span> <b>' +
      _0x171051["lvl"] +
      "</b></div>\n            </div>\n\n            " +
      _0x4c65bb +
      '\n\n            <details class="opt-variance">\n                <summary>Roll variance analysis (opt-in)</summary>\n                <div class="opt-variance-body">\n                    <div class="opt-variance-intro">\n                        WarEra gear has random rolls within a range per tier. The default sim uses the\n                        listed reference stats. These toggles let you see how much that affects the\n                        outcome. Leave them off for the original behavior.\n                    </div>\n                    <div class="opt-variance-controls">\n                        <label class="opt-variance-spread">Roll spread ±\n                            <input type="number" id="optVarSpread" value="15" step="1" min="0" max="50" />\n                            %\n                        </label>\n                        <label class="opt-variance-check">\n                            <input type="checkbox" id="optVarStat" />\n                            <span><b>Statistical band</b> on this build · Monte Carlo, instant</span>\n                        </label>\n                        <label class="opt-variance-check">\n                            <input type="checkbox" id="optVarEnvelope" />\n                            <span><b>Min/max envelope</b> · re-optimizes at low and high rolls (2 extra runs)</span>\n                        </label>\n                    </div>\n                    <div id="optVarStatResult"></div>\n                    <div id="optVarEnvelopeResult"></div>\n                </div>\n            </details>\n\n            <details class="opt-fallback">\n                <summary>Open in husarai.vercel.app/optimizer instead</summary>\n                <div class="panel-actions" style="margin-top:8px">\n                    <button class="panel-btn" id="optimizerBtn" data-payload=\'' +
      escapeHtml(JSON["stringify"](_0x58d529)) +
      '\'>Open in Optimizer ↗</button>\n                    <a class="bookmarklet-link" id="bookmarkletLink" draggable="true" title="Drag to your bookmarks bar (or right-click → Bookmark Link in Firefox)">★ Prefill bookmark</a>\n                </div>\n                <div class="setup-hint">\n                    One-time setup: <b>drag</b> the ★ button to your bookmarks bar (Firefox: right-click → <code>Bookmark Link…</code>).\n                    Then click <b>Open in Optimizer</b> — values go into the URL hash, and the bookmark autofills them.\n                </div>\n            </details>\n        </div>',
    _0x13c858,
  );
  const _0x3ad1bd = document["getElementById"]("bookmarkletLink");
  if (_0x3ad1bd) _0x3ad1bd["href"] = PREFILL_BOOKMARKLET;
  const _0xcfe0d1 = document["getElementById"]("optApplyTarget"),
    _0x178ed0 = document["getElementById"]("optNetTarget");
  if (_0xcfe0d1 && _0x178ed0) {
    const _0x526206 = () => {
      const _0x166bd8 = Number(_0x178ed0["value"]);
      if (!Number["isFinite"](_0x166bd8)) return;
      ((_buildOverrides[_0x13c858]["spentLimitOverride"] = -_0x166bd8),
        renderBuildPanel());
    };
    (_0xcfe0d1["addEventListener"]("click", _0x526206),
      _0x178ed0["addEventListener"]("keydown", (_0x35fec1) => {
        if (_0x35fec1["key"] === "Enter") _0x526206();
      }));
  }
  const _0x259f61 = document["getElementById"]("optResetTarget");
  if (_0x259f61)
    _0x259f61["addEventListener"]("click", () => {
      (delete _buildOverrides[_0x13c858]["spentLimitOverride"],
        renderBuildPanel());
    });
  const _0x38ab8f = document["getElementById"]("optBreakEvenBtn"),
    _0x40dbb6 = document["getElementById"]("optBreakEvenResult");
  (_0x38ab8f &&
    _0x40dbb6 &&
    _0x38ab8f["addEventListener"]("click", () =>
      runBreakEven(_0x13c858, _0x556fc8, _0x47b711, _0x38ab8f, _0x40dbb6),
    ),
    wireRollVarianceToggles(_0x13c858, _0x556fc8, _0x47b711, _0x171051));
}
function wireRollVarianceToggles(_0x3ca251, _0x3fb63a, _0x386205, _0x16a90e) {
  const _0x4fc513 = document["getElementById"]("optVarSpread"),
    _0x23492b = document["getElementById"]("optVarStat"),
    _0x3cf54f = document["getElementById"]("optVarEnvelope"),
    _0x40bd35 = document["getElementById"]("optVarStatResult"),
    _0x9ff5a5 = document["getElementById"]("optVarEnvelopeResult");
  if (!_0x4fc513 || !_0x23492b || !_0x3cf54f) return;
  const _0x5f47aa = () => {
      const _0x41cc8b = Number(_0x4fc513["value"]);
      return Number["isFinite"](_0x41cc8b) && _0x41cc8b >= 0x0
        ? _0x41cc8b / 0x64
        : 0.15;
    },
    _0x37ab95 = (_0x212fc3) => Math["round"](_0x212fc3)["toLocaleString"](),
    _0x1b2df0 = (_0xb674aa) => "$" + _0xb674aa["toFixed"](0x2),
    _0x567bf8 = (_0x4ff8b3) =>
      (_0x4ff8b3 >= 0x0 ? "+$" : "-$") + Math["abs"](_0x4ff8b3)["toFixed"](0x2),
    _0x5816f2 = () => {
      if (!_0x23492b["checked"]) {
        _0x40bd35["innerHTML"] = "";
        return;
      }
      const _0x1aef6e = _0x5f47aa(),
        _0x3249fd = OPT["varianceAnalysis"](
          _0x386205,
          _0x16a90e,
          _0x1aef6e,
          0x3e8,
        );
      if (!_0x3249fd) {
        _0x40bd35["innerHTML"] = "";
        return;
      }
      const _0x3e1c61 = _0x386205["dmg"],
        _0xbcc080 = (((_0x3249fd["dmg"]["p90"] - _0x3249fd["dmg"]["p10"]) /
          0x2 /
          _0x3e1c61) *
          0x64)["toFixed"](0x1);
      _0x40bd35["innerHTML"] =
        '\n            <div class="opt-variance-stat-out">\n                <h4>Statistical band · ±' +
        (_0x1aef6e * 0x64)["toFixed"](0x0) +
        "% rolls · " +
        _0x3249fd["samples"] +
        ' samples</h4>\n                <div class="opt-variance-band">\n                    <span>Damage</span><b>' +
        _0x37ab95(_0x3249fd["dmg"]["mean"]) +
        ' <span class="pct">(p10–p90: ' +
        _0x37ab95(_0x3249fd["dmg"]["p10"]) +
        " – " +
        _0x37ab95(_0x3249fd["dmg"]["p90"]) +
        " · ±" +
        _0xbcc080 +
        "%)</span></b>\n                    <span>Net / day</span><b>" +
        _0x567bf8(-_0x3249fd["spent"]["mean"]) +
        ' <span class="pct">(p10–p90: ' +
        _0x567bf8(-_0x3249fd["spent"]["p90"]) +
        " – " +
        _0x567bf8(-_0x3249fd["spent"]["p10"]) +
        ")</span></b>\n                    <span>Turnover / day</span><b>" +
        _0x1b2df0(_0x3249fd["profit"]["mean"]) +
        ' <span class="pct">(p10–p90: ' +
        _0x1b2df0(_0x3249fd["profit"]["p10"]) +
        " – " +
        _0x1b2df0(_0x3249fd["profit"]["p90"]) +
        ")</span></b>\n                    <span>Cost / day</span><b>" +
        _0x1b2df0(_0x3249fd["profit"]["mean"] - -_0x3249fd["spent"]["mean"]) +
        ' <span class="pct">(derived: profit − net)</span></b>\n                </div>\n            </div>';
    },
    _0x13d1f2 = (_0x2f900a, _0x4b1c02, _0x4f62f5, _0x32244a) => {
      const _0x2c7441 = _0x4f62f5?.["bestBuild"];
      if (!_0x2c7441)
        return (
          '\n            <div class="opt-variance-env-card">\n                <h5>' +
          _0x2f900a +
          ' <span style="color:#6b6f80;text-transform:none;letter-spacing:0">· ' +
          _0x4b1c02 +
          '</span></h5>\n                <div class="env-row">No feasible build at this roll level under the same spent limit.</div>\n            </div>'
        );
      const _0x3fbb09 = _0x2c7441["dmg"] - _0x32244a["dmg"],
        _0x33dd91 = ((_0x3fbb09 / _0x32244a["dmg"]) * 0x64)["toFixed"](0x1),
        _0x491af5 = _0x3fbb09 >= 0x0 ? "+" : "",
        _0x17396e = ["gun", "helmet", "chest", "pant", "glove", "boot"]
          [
            "map"
          ]((_0x3c7aa0) => _0x3c7aa0 + ":" + _0x2c7441["gear"][_0x3c7aa0]["type"])
          ["join"](" · ");
      return (
        '\n            <div class="opt-variance-env-card">\n                <h5>' +
        _0x2f900a +
        ' <span style="color:#6b6f80;text-transform:none;letter-spacing:0">· ' +
        _0x4b1c02 +
        '</span></h5>\n                <div class="env-row"><span>Damage</span><b>' +
        _0x37ab95(_0x2c7441["dmg"]) +
        ' <span style="color:' +
        (_0x3fbb09 >= 0x0 ? "#22c55e" : "#ef4444") +
        ';font-weight:500">(' +
        _0x491af5 +
        _0x33dd91 +
        '% vs default)</span></b></div>\n                <div class="env-row"><span>Net / day</span><b>' +
        _0x567bf8(-_0x2c7441["spent"]) +
        '</b></div>\n                <div class="env-row"><span>Starting cost</span><b>' +
        _0x1b2df0(_0x2c7441["startingCost"]) +
        '</b></div>\n                <div class="env-gear">' +
        _0x17396e +
        "</div>\n            </div>"
      );
    };
  let _0x2a3ad4 = 0x0;
  const _0x48a9dc = async () => {
    if (!_0x3cf54f["checked"]) {
      _0x9ff5a5["innerHTML"] = "";
      return;
    }
    const _0x1adf64 = _0x5f47aa(),
      _0x1a7e83 = ++_0x2a3ad4;
    _0x9ff5a5["innerHTML"] =
      '<div class="opt-variance-loading">Running min-roll + max-roll optimizers (×2)…</div>';
    const _0xf5f583 = { ..._0x3fb63a },
      _0x191030 = {
        ..._0xf5f583,
        rollMultiplier: Math["max"](0.01, 0x1 - _0x1adf64),
      },
      _0xab469f = { ..._0xf5f583, rollMultiplier: 0x1 + _0x1adf64 };
    try {
      const [_0x3713a8, _0x11d0f5] = await Promise["all"]([
        _spawnEnvelopeWorker(_0x3ca251, _0x191030),
        _spawnEnvelopeWorker(_0x3ca251, _0xab469f),
      ]);
      if (_0x1a7e83 !== _0x2a3ad4) return;
      _0x9ff5a5["innerHTML"] =
        _0x13d1f2(
          "Min-roll build",
          "gear stats × " + (0x1 - _0x1adf64)["toFixed"](0x2),
          _0x3713a8,
          _0x386205,
        ) +
        _0x13d1f2(
          "Max-roll build",
          "gear stats × " + (0x1 + _0x1adf64)["toFixed"](0x2),
          _0x11d0f5,
          _0x386205,
        );
    } catch (_0x576147) {
      if (_0x1a7e83 !== _0x2a3ad4) return;
      _0x9ff5a5["innerHTML"] =
        '<div class="opt-variance-error">Envelope run failed: ' +
        _0x576147["message"] +
        "</div>";
    }
  };
  (_0x23492b["addEventListener"]("change", _0x5816f2),
    _0x3cf54f["addEventListener"]("change", _0x48a9dc),
    _0x4fc513["addEventListener"]("change", () => {
      _0x5816f2();
      if (_0x3cf54f["checked"]) _0x48a9dc();
    }));
}
function renderSustainableForm() {
  const _0x755edc = $("buildPanel");
  _terminateOptWorker();
  const _0x5f5bf3 = OPT["PRESET_DEFS"]["sustainable"],
    _0x5ca1af = buildOptimizerUserData(state.lastAnalysis),
    _0x474e13 = _0x5ca1af["lvl"];
  ((_0x755edc["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>' +
    _0x5f5bf3["label"] +
    '</h3>\n            <div class="gc-intro">\n                Pick the player level you want to plan for. Default is your loaded level\n                (<b>' +
    _0x474e13 +
    '</b>). Bump it higher to preview the build you\'ll be able\n                to run after a few level-ups.\n            </div>\n            <div class="opt-target-row" style="margin-top:14px">\n                <label for="suLvlInput">Player level</label>\n                <input type="number" id="suLvlInput" value="' +
    _0x474e13 +
    '" step="1" min="1" max="100" />\n                <span class="opt-target-hint">SP available = level × 4</span>\n            </div>\n            <button type="button" class="opt-be-btn" id="suRunBtn">Run Sustainable simulation →</button>\n        </div>'),
    document["getElementById"]("suRunBtn")["addEventListener"]("click", () => {
      const _0xd11eed = Number(
          document["getElementById"]("suLvlInput")["value"],
        ),
        _0x27bddc =
          Number["isFinite"](_0xd11eed) && _0xd11eed >= 0x1
            ? Math["floor"](_0xd11eed)
            : _0x474e13;
      ((_buildOverrides["sustainable"]["lvl"] = _0x27bddc),
        (_sustainableStarted = !![]),
        renderBuildPanel());
    }));
}
function renderWarEcoForm() {
  const _0x2c62e4 = $("buildPanel");
  _terminateOptWorker();
  const _0x45cc54 = OPT["PRESET_DEFS"]["warEco"],
    _0x39c3e8 = buildOptimizerUserData(state.lastAnalysis),
    _0x3eb3ad = _0x39c3e8["lvl"],
    _0x16ec0a = -_0x45cc54["spentLimit"]({
      entrep: _0x39c3e8["entrep"],
      energy: _0x39c3e8["energy"],
      aeNet: _0x39c3e8["aeNet"],
    });
  ((_0x2c62e4["innerHTML"] = wrapForWarEco(
    '\n        <div class="build-panel">\n            <h3>' +
      _0x45cc54["label"] +
      '</h3>\n            <div class="gc-intro">\n                Pick the player level and target net / day before simulating. Level defaults to your\n                loaded level (<b>' +
      _0x3eb3ad +
      '</b>) — bump it higher to plan future builds. Target net\n                defaults to <b>80%</b> of your personal daily income at the current level.\n            </div>\n            <div class="opt-target-row" style="margin-top:14px">\n                <label for="weLvlInput">Player level</label>\n                <input type="number" id="weLvlInput" value="' +
      _0x3eb3ad +
      '" step="1" min="1" max="100" />\n                <span class="opt-target-hint">SP available = level × 4</span>\n            </div>\n            <div class="opt-target-row" style="margin-top:10px">\n                <label for="weNetTarget">Target net / day</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="weNetTarget" value="' +
      _0x16ec0a["toFixed"](0x2) +
      '" step="1" />\n                <span class="opt-target-hint">default: $' +
      _0x16ec0a["toFixed"](0x0) +
      ' (80% of personal income)</span>\n            </div>\n            <button type="button" class="opt-be-btn" id="weRunBtn">Run War-Eco simulation →</button>\n        </div>',
    "warEco",
  )),
    document["getElementById"]("weRunBtn")["addEventListener"]("click", () => {
      const _0x26635d = Number(
          document["getElementById"]("weLvlInput")["value"],
        ),
        _0x1f2f6d =
          Number["isFinite"](_0x26635d) && _0x26635d >= 0x1
            ? Math["floor"](_0x26635d)
            : _0x3eb3ad,
        _0x1db12e = Number(document["getElementById"]("weNetTarget")["value"]),
        _0x225d72 = Number["isFinite"](_0x1db12e) ? _0x1db12e : _0x16ec0a;
      ((_buildOverrides["warEco"]["lvl"] = _0x1f2f6d),
        (_buildOverrides["warEco"]["spentLimitOverride"] = -_0x225d72),
        (_warEcoStarted = !![]),
        renderBuildPanel());
    }));
}
const MM_STAT_NAME_MAP = {
    attack: "attack",
    precision: "precision",
    dodge: "dodge",
    armor: "armor",
    criticalChance: "cChance",
    criticalDamages: "cDmg",
  },
  MM_SLOT_STATS = {
    gun: ["attack", "cChance"],
    helmet: ["cDmg"],
    chest: ["armor"],
    pant: ["armor"],
    glove: ["precision"],
    boot: ["dodge"],
  };
function _mmPctValue(_0x235b8a, _0x4b7de8) {
  if (!_0x235b8a) return null;
  const _0x17c2aa = Math["max"](0x0, Math["min"](0x64, _0x4b7de8)),
    _0x6a236 = (_0x4a0a7e, _0xa85ca7, _0x314031) =>
      _0x4a0a7e + (_0xa85ca7 - _0x4a0a7e) * _0x314031;
  if (_0x17c2aa <= 0xa)
    return _0x6a236(_0x235b8a["min"], _0x235b8a["p10"], _0x17c2aa / 0xa);
  if (_0x17c2aa <= 0x32)
    return _0x6a236(
      _0x235b8a["p10"],
      _0x235b8a["p50"],
      (_0x17c2aa - 0xa) / 0x28,
    );
  if (_0x17c2aa <= 0x5a)
    return _0x6a236(
      _0x235b8a["p50"],
      _0x235b8a["p90"],
      (_0x17c2aa - 0x32) / 0x28,
    );
  return _0x6a236(_0x235b8a["p90"], _0x235b8a["max"], (_0x17c2aa - 0x5a) / 0xa);
}
function buildMinMaxOverrides(_0x5a4032, _0x5e53ff, _0x511a11, _0x2d043d) {
  const _0x353818 = {},
    _0x481165 = [],
    _0x34ac90 = [];
  for (const _0x1f4c9a of Object["keys"](MM_TIER_TO_CODE)) {
    const _0x561e2b = {};
    for (const _0x324d5c of Object["keys"](MM_TIER_TO_CODE[_0x1f4c9a])) {
      if (_0x511a11 && !_0x511a11[_0x324d5c]) continue;
      const _0x5c02ec = MM_TIER_TO_CODE[_0x1f4c9a][_0x324d5c],
        _0x1854b6 = 0x3;
      let _0x57162c = _0x5a4032?.["items"]?.[_0x5c02ec],
        _0x3ad9af = "primary";
      if (!_0x57162c || !_0x57162c["n"] || _0x57162c["n"] < _0x1854b6) {
        const _0x574589 = _0x2d043d?.["items"]?.[_0x5c02ec];
        if (_0x574589 && _0x574589["n"] && _0x574589["n"] >= 0x5)
          ((_0x57162c = _0x574589),
            (_0x3ad9af = "fallback"),
            _0x34ac90["push"]({
              slot: _0x1f4c9a,
              tier: _0x324d5c,
              code: _0x5c02ec,
            }));
        else {
          _0x481165["push"]({
            slot: _0x1f4c9a,
            tier: _0x324d5c,
            code: _0x5c02ec,
            n: _0x57162c?.["n"] || 0x0,
          });
          continue;
        }
      }
      const _0x1d9181 = { _source: _0x3ad9af };
      for (const [_0x378d42, _0x290922] of Object["entries"](
        MM_STAT_NAME_MAP,
      )) {
        const _0x1ef2e3 = _0x57162c["skills"]?.[_0x378d42];
        _0x1ef2e3 &&
          MM_SLOT_STATS[_0x1f4c9a]?.["includes"](_0x290922) &&
          (_0x1d9181[_0x290922] = Math["max"](
            0x0,
            _mmPctValue(_0x1ef2e3, _0x5e53ff),
          ));
      }
      if (_0x57162c["price"])
        _0x1d9181["buyPrice"] = Math["max"](
          0x0,
          _mmPctValue(_0x57162c["price"], _0x5e53ff),
        );
      _0x561e2b[_0x324d5c] = _0x1d9181;
    }
    if (Object["keys"](_0x561e2b)["length"]) _0x353818[_0x1f4c9a] = _0x561e2b;
  }
  return { overrides: _0x353818, missing: _0x481165, fallbackUsed: _0x34ac90 };
}
let _minMaxStarted = ![],
  _minMaxConfig = null,
  _lootStarted = ![],
  _lootConfig = null,
  _lvlUpStarted = ![],
  _lvlUpConfig = null;
function renderMinMaxForm() {
  const _0x8ae64 = $("buildPanel");
  _terminateOptWorker();
  if (!_gearSnapshot) {
    _0x8ae64["innerHTML"] =
      '<div class="build-panel"><h3>🎯 Min-Max (real market)</h3>\n            <div class="build-loading">Market snapshot still loading… try again in a moment.</div></div>';
    return;
  }
  const _0x20e837 = buildOptimizerUserData(state.lastAnalysis),
    _0x3a9d15 = _0x20e837["lvl"],
    _0x50ecac =
      (Date["now"]() - new Date(_gearSnapshot["generatedAt"])["getTime"]()) /
      0x3e8 /
      0x3c,
    _0x21d521 = _hasLiveOffers(),
    _0xdc63d0 = _0x21d521 ? window["_LIVE_OFFERS"] : null,
    _0x44de51 = _0xdc63d0?.["generatedAt"]
      ? Math["round"](
          (Date["now"]() - new Date(_0xdc63d0["generatedAt"])["getTime"]()) /
            0x36ee80,
        )
      : null,
    _0x2857e7 = _0xdc63d0
      ? {
          items: Object["keys"](_0xdc63d0["items"])["length"],
          offers: Object["values"](_0xdc63d0["items"])["reduce"](
            (_0x289a53, _0x19c82b) => _0x289a53 + (_0x19c82b["n"] || 0x0),
            0x0,
          ),
          date: _0xdc63d0["generatedAt"]
            ? new Date(_0xdc63d0["generatedAt"])["toLocaleString"]()
            : "?",
        }
      : null;
  _0x8ae64["innerHTML"] =
    '\n        <div class="build-panel mm-form">\n            <h3>🎯 Min-Max (real market)</h3>\n            <div class="gc-intro">\n                Uses real warera.io market data — per-tier gear stats and prices from the\n                latest snapshot (' +
    _gearSnapshot["transactionsScanned"]["toLocaleString"]() +
    " recent\n                transactions, " +
    (_0x50ecac < 0x3c
      ? Math["round"](_0x50ecac) + " min"
      : (_0x50ecac / 0x3c)["toFixed"](0x1) + " h") +
    " old).\n                Tier picks are based on what gear actually costs and what rolls really are.\n                <br><br>\n                <b>Roll target</b> picks where on each tier's distribution you assume your purchase\n                will land. p50 = typical roll, p90 = above-average (more expensive), p25 = budget.\n            </div>\n\n            " +
    (_0x21d521
      ? '\n            <label class="opt-target-row mm-live-row" style="border:1px solid #2a4a78;background:#152033;border-radius:8px;padding:10px 12px;margin-top:8px;cursor:pointer">\n                <input type="checkbox" id="mmUseLive" checked style="width:auto" />\n                <span style="margin-left:8px"><b style="color:#aab9ff">Use LIVE offers snapshot</b>\n                    <span class="mm-pct-hint">(' +
        _0x2857e7["date"] +
        (_0x44de51 != null ? " · " + _0x44de51 + "h ago" : "") +
        " · " +
        _0x2857e7["items"] +
        " items · " +
        _0x2857e7["offers"] +
        ' offers)</span>\n                </span>\n                <span class="opt-target-hint">Tier picks, gear table, and roll search all use live current-market data.\n                    Missing codes fall back to the public snapshot. Roll target slider still applies to live data.</span>\n            </label>'
      : '<div class="mm-pct-hint" style="margin-top:8px;color:#6b7080">\n                No live-offers snapshot was baked in at build time — using the public /gear-ranges snapshot only.\n            </div>') +
    '\n\n            <div class="mm-radio-row" id="mmPresetRow">\n                <label class="mm-radio selected"><input type="radio" name="mmPreset" value="sustainable" checked /> Sustainable</label>\n                <label class="mm-radio"><input type="radio" name="mmPreset" value="warEco" /> War-Eco</label>\n                <label class="mm-radio"><input type="radio" name="mmPreset" value="gearCheck" /> Gear Check</label>\n                <label class="mm-radio"><input type="radio" name="mmPreset" value="pillDebuff" /> Pill Debuff</label>\n            </div>\n            <div class="mm-pct-hint" id="mmLockedNote" style="display:none"></div>\n\n            <div class="opt-target-row">\n                <label for="mmLvlInput">Player level</label>\n                <input type="number" id="mmLvlInput" value="' +
    _0x3a9d15 +
    '" step="1" min="1" max="100" />\n                <span class="opt-target-hint">SP available = level × 4</span>\n            </div>\n\n            <div class="opt-target-row">\n                <label for="mmPctInput">Roll target</label>\n                <input type="range" id="mmPctInput" min="5" max="95" step="5" value="50" />\n                <span class="mm-pct-display" id="mmPctDisplay">p50</span>\n            </div>\n            <div class="mm-pct-hint">\n                p25 = below-average rolls (cheap to buy) ·\n                p50 = median (typical buy) ·\n                p75 = above-average ·\n                p90 = near-perfect (expensive)\n            </div>\n\n            <div class="opt-target-row" id="mmNetRow" style="display:none">\n                <label for="mmNetInput">Target net / day</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="mmNetInput" value="0" step="1" />\n                <span class="opt-target-hint">War-Eco only — default 80% of personal income</span>\n            </div>\n            <div id="mmNetWarn" class="mm-net-warn" style="display:none">\n                ⚠ Target net income / day is <b>WITHOUT</b> worker income. If you have workers,\n                you will earn that on top of this number.\n            </div>\n\n            <div class="opt-target-row" id="mmBountyRow" style="display:none">\n                <label for="mmBountyInput">Bounty ($ per 1000 dmg)</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="mmBountyInput" value="' +
    _gearCheck["bounty"] +
    '" step="0.01" min="0" />\n                <span class="opt-target-hint">e.g. 0.15 = $0.15/1k dmg</span>\n            </div>\n\n            <div class="opt-target-row" id="mmCountryBonusRow" style="display:none">\n                <label for="mmCountryBonusInput">Country dmg bonus</label>\n                <input type="number" id="mmCountryBonusInput" value="' +
    _gearCheck["countryBonus"] +
    '" step="1" min="0" max="500" />\n                <span class="opt-target-prefix">%</span>\n                <span class="opt-target-hint">default 90% — your country\'s combat dmg bonus</span>\n            </div>\n\n            <div class="opt-target-row" id="mmGcNetRow" style="display:none">\n                <label for="mmGcNetInput">Target net / day</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="mmGcNetInput" value="' +
    _gearCheck["targetNet"] +
    '" step="1" />\n                <span class="opt-target-hint">spend budget — default $15 (optimizer may run net down to −this)</span>\n            </div>\n\n            <div class="opt-target-row" id="mmHoursRow" style="display:none">\n                <label for="mmHoursInput">Fight hours</label>\n                <input type="number" id="mmHoursInput" value="' +
    _pillDebuff["hours"] +
    '" step="1" min="1" max="24" />\n                <span class="opt-target-hint">debuff period (damage fixed at −' +
    PILL_DEBUFF_DMG_PENALTY_PCT +
    '%)</span>\n            </div>\n\n            <button type="button" class="opt-be-btn" id="mmRunBtn">Run Min-Max simulation →</button>\n        </div>';
  (function () {
    var _ammoRow = document.createElement("div");
    _ammoRow.className = "opt-target-row";
    _ammoRow.style.marginTop = "8px";
    _ammoRow.innerHTML =
      '<label style="min-width:130px">Ammo type</label><select id="mmAmmoTypeSelect" style="padding:4px 8px;border-radius:4px"><option value="light">Light ammo (+10%, $0.17)</option><option value="ammo">Ammo (+20%, $0.69)</option><option value="heavy">Heavy ammo (+40%, $2.49)</option></select>';
    var _b = document.getElementById("mmRunBtn");
    if (_b && _b.parentNode) _b.parentNode.insertBefore(_ammoRow, _b);
  })();
  (function () {
    var _r = document.createElement("div");
    _r.className = "opt-target-row";
    _r.style.cssText = "margin-top:8px";
    _r.innerHTML =
      '<label for="mmBattleBonusInput" style="min-width:130px">Battle bonus %</label><span class="opt-target-prefix">+</span><input type="number" id="mmBattleBonusInput" value="30" step="1" min="0" max="500" style="width:72px"/><span class="opt-target-hint">Total additive damage bonus (e.g. 85 for +85%)</span>';
    var _b = document.getElementById("mmRunBtn");
    if (_b && _b.parentNode) _b.parentNode.insertBefore(_r, _b);
  })();
  const _0x42fb59 = document["getElementById"]("mmPctInput"),
    _0xd1b7bb = document["getElementById"]("mmPctDisplay");
  _0x42fb59["addEventListener"]("input", () => {
    _0xd1b7bb["textContent"] = "p" + _0x42fb59["value"];
  });
  const _0x353ecb = document["querySelectorAll"]('input[name="mmPreset"]'),
    _0xea63d4 = document["getElementById"]("mmNetRow"),
    _0x31b4ae = document["getElementById"]("mmNetInput"),
    _0xf557b = document["getElementById"]("mmBountyRow"),
    _0x111ddf = document["getElementById"]("mmCountryBonusRow"),
    _0x392c60 = document["getElementById"]("mmGcNetRow"),
    _0x1b6373 = document["getElementById"]("mmHoursRow"),
    _0xc84251 = document["getElementById"]("mmLockedNote"),
    _0x4905b4 = state.lastAnalysis?.["user"]?.["username"] || "(loaded player)",
    _0x278d6f = () => {
      const _0x5c3f2a = document["querySelector"](
        'input[name="mmPreset"]:checked',
      )["value"];
      (document["querySelectorAll"](".mm-radio")["forEach"]((_0x150a1a) => {
        _0x150a1a["classList"]["toggle"](
          "selected",
          _0x150a1a["querySelector"]("input")["value"] === _0x5c3f2a,
        );
      }),
        (_0xea63d4["style"]["display"] =
          _0x5c3f2a === "warEco" ? "flex" : "none"));
      const _0x4c95ab = document["getElementById"]("mmNetWarn");
      if (_0x4c95ab)
        _0x4c95ab["style"]["display"] =
          _0x5c3f2a === "warEco" ? "block" : "none";
      ((_0xf557b["style"]["display"] =
        _0x5c3f2a === "gearCheck" || _0x5c3f2a === "pillDebuff"
          ? "flex"
          : "none"),
        (_0x111ddf["style"]["display"] =
          _0x5c3f2a === "gearCheck" ? "flex" : "none"),
        (_0x392c60["style"]["display"] =
          _0x5c3f2a === "gearCheck" ? "flex" : "none"),
        (_0x1b6373["style"]["display"] =
          _0x5c3f2a === "pillDebuff" ? "flex" : "none"));
      _0x5c3f2a === "gearCheck" || _0x5c3f2a === "pillDebuff"
        ? ((_0xc84251["style"]["display"] = "block"),
          (_0xc84251["innerHTML"] =
            "Skills will be <b>locked</b> to <b>" +
            _0x4905b4 +
            "</b>'s current values." +
            (_0x5c3f2a === "pillDebuff"
              ? " Pill <b>off</b>, dmg <b>−" +
                PILL_DEBUFF_DMG_PENALTY_PCT +
                '%</b>, "none" tier included, runs bread vs no-food and picks the winner.'
              : "")))
        : (_0xc84251["style"]["display"] = "none");
      if (_0x5c3f2a === "warEco") {
        const _0x320a76 = -OPT["PRESET_DEFS"]["warEco"]["spentLimit"]({
          entrep: _0x20e837["entrep"],
          energy: _0x20e837["energy"],
          aeNet: _0x20e837["aeNet"],
        });
        if (!_0x31b4ae["value"] || _0x31b4ae["value"] === "0")
          _0x31b4ae["value"] = _0x320a76["toFixed"](0x0);
      }
    };
  (_0x353ecb["forEach"]((_0x27ed40) =>
    _0x27ed40["addEventListener"]("change", _0x278d6f),
  ),
    _0x278d6f(),
    document["getElementById"]("mmRunBtn")["addEventListener"]("click", () => {
      const _0x2cc6e3 = document["querySelector"](
          'input[name="mmPreset"]:checked',
        )["value"],
        _0x159d24 = Number(document["getElementById"]("mmLvlInput")["value"]),
        _0x5164a2 =
          Number["isFinite"](_0x159d24) && _0x159d24 >= 0x1
            ? Math["floor"](_0x159d24)
            : _0x3a9d15,
        _0x1de703 = Number(_0x42fb59["value"]),
        _0x492270 = Number(_0x31b4ae["value"]),
        _0x5e8620 = Number(
          document["getElementById"]("mmBountyInput")["value"],
        ),
        _0x56e9f2 = Number(
          document["getElementById"]("mmCountryBonusInput")["value"],
        ),
        _0x417b3a = Number(document["getElementById"]("mmGcNetInput")["value"]),
        _0x237469 = Number(document["getElementById"]("mmHoursInput")["value"]),
        _0x52b250 = document["getElementById"]("mmUseLive");
      ((_minMaxConfig = {
        preset: _0x2cc6e3,
        lvl: _0x5164a2,
        percentile: _0x1de703,
        targetNet:
          _0x2cc6e3 === "warEco" && Number["isFinite"](_0x492270)
            ? _0x492270
            : null,
        gearCheckNet:
          _0x2cc6e3 === "gearCheck"
            ? Number["isFinite"](_0x417b3a)
              ? _0x417b3a
              : (_gearCheck["targetNet"] ?? 0xf)
            : null,
        bounty:
          Number["isFinite"](_0x5e8620) && _0x5e8620 >= 0x0 ? _0x5e8620 : 0x0,
        countryBonus:
          Number["isFinite"](_0x56e9f2) && _0x56e9f2 >= 0x0 ? _0x56e9f2 : 0x5a,
        hours:
          Number["isFinite"](_0x237469) && _0x237469 >= 0x1
            ? Math["floor"](_0x237469)
            : 0x10,
        useLive: _0x52b250 ? _0x52b250["checked"] : ![],
      }),
        _0x2cc6e3 === "gearCheck" &&
          ((_gearCheck["bounty"] = _minMaxConfig["bounty"]),
          (_gearCheck["countryBonus"] = _minMaxConfig["countryBonus"]),
          (_gearCheck["targetNet"] = _minMaxConfig["gearCheckNet"])),
        _0x2cc6e3 === "pillDebuff" &&
          ((_pillDebuff["bounty"] = _minMaxConfig["bounty"]),
          (_pillDebuff["hours"] = _minMaxConfig["hours"])),
        (_minMaxConfig.ammoType = (
          document.getElementById("mmAmmoTypeSelect") || { value: "light" }
        ).value),
        (_minMaxConfig.battleBonus = Number(
          (document.getElementById("mmBattleBonusInput") || { value: "30" })
            .value,
        )),
        (_minMaxStarted = !![]),
        renderBuildPanel());
    }));
}
function runMinMaxBuild() {
  const _0x2de473 = $("buildPanel");
  if (!_gearSnapshot || !_minMaxConfig)
    return ((_minMaxStarted = ![]), renderMinMaxForm());
  const _0x1f7d98 = _minMaxConfig;
  if (_0x1f7d98["preset"] === "pillDebuff") return runMinMaxPillDebuff();
  const _0x5962b3 = buildOptimizerUserData(state.lastAnalysis);
  let _0x48dd67,
    _0x3c9fbf,
    _0x2e646e = {},
    _0x4534b4;
  if (_0x1f7d98["preset"] === "sustainable" || _0x1f7d98["preset"] === "warEco")
    ((_0x48dd67 = _0x1f7d98["preset"]),
      (_0x3c9fbf = OPT["PRESET_DEFS"][_0x48dd67]["gearTiers"]),
      (_0x4534b4 = OPT["PRESET_DEFS"][_0x48dd67]["label"]));
  else {
    if (_0x1f7d98["preset"] === "gearCheck") {
      ((_0x48dd67 = "sustainable"),
        (_0x3c9fbf = OPT["PRESET_DEFS"]["sustainable"]["gearTiers"]));
      const _0x5cc4b1 = extractPlayerSkills(state.lastAnalysis["user"]),
        _0x1999f9 = _0x1f7d98["countryBonus"] ?? 0x5a;
      ((_0x2e646e = {
        fixedSkills: _0x5cc4b1,
        bountyOverride: _0x1f7d98["bounty"],
        countryBonus: 0x1 + _0x1999f9 / 0x64,
      }),
        (_0x4534b4 =
          "Gear Check · bounty $" +
          _0x1f7d98["bounty"]["toFixed"](0x2) +
          "/1k · country +" +
          _0x1999f9 +
          "% · net $" +
          _0x1f7d98["gearCheckNet"] +
          "/day"));
    }
  }
  const _0x290a50 = !!(_0x1f7d98["useLive"] && _hasLiveOffers()),
    _0x15ff7e = _0x290a50 ? window["_LIVE_OFFERS"] : _gearSnapshot,
    _0xc3dbaa = _0x290a50 ? _gearSnapshot : null,
    {
      overrides: _0x4b1ebf,
      missing: _0x27bf3b,
      fallbackUsed: _0x391306,
    } = buildMinMaxOverrides(
      _0x15ff7e,
      _0x1f7d98["percentile"],
      _0x3c9fbf,
      _0xc3dbaa,
    ),
    _0x58c318 = {
      ..._0x5962b3,
      ..._0x2e646e,
      lvl: _0x1f7d98["lvl"],
      gearOverrides: _0x4b1ebf,
      useLiveOffers: _0x290a50,
      _gearOverridesKey:
        (_0x290a50 ? "live|" : "") +
        "p" +
        _0x1f7d98["percentile"] +
        "|" +
        _0x1f7d98["preset"],
    };
  _0x1f7d98["preset"] === "warEco" &&
    _0x1f7d98["targetNet"] != null &&
    (_0x58c318["spentLimitOverride"] = -_0x1f7d98["targetNet"]);
  _0x1f7d98["preset"] === "gearCheck" &&
    _0x1f7d98["gearCheckNet"] != null &&
    (_0x58c318["spentLimitOverride"] = -_0x1f7d98["gearCheckNet"]);
  if (_0x1f7d98.ammoType) _0x58c318.ammoType = _0x1f7d98.ammoType;
  if (Number.isFinite(_0x1f7d98.battleBonus))
    _0x58c318.battleBonus = 1 + _0x1f7d98.battleBonus / 100;
  const _0x256fce = _0x290a50
      ? '<span style="color:#aab9ff">· LIVE</span>'
      : "",
    _0x640622 =
      "🎯 Min-Max · " +
      _0x4534b4 +
      " · p" +
      _0x1f7d98["percentile"] +
      " " +
      _0x256fce,
    _0x54496f = _buildCacheKey(_0x48dd67, _0x58c318);
  if (_buildCache["has"](_0x54496f))
    return renderMinMaxResult(
      _0x48dd67,
      _0x58c318,
      _buildCache["get"](_0x54496f),
      { label: _0x640622, missing: _0x27bf3b },
    );
  const _0x103f39 = ++_optRunId;
  ((_0x2de473["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>' +
    _0x640622 +
    '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting optimizer…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n            ' +
    (_0x27bf3b["length"]
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-top:10px">⚠ Thin samples for ' +
        _0x27bf3b["length"] +
        " (slot, tier) — those tiers fall back to listed reference values.</div>"
      : "") +
    "\n        </div>"),
    document["getElementById"]("optCancelBtn")["addEventListener"](
      "click",
      () => {
        _terminateOptWorker();
        const _0x1b3a11 = document["getElementById"]("optProgressLabel");
        if (_0x1b3a11) _0x1b3a11["textContent"] = "Cancelled.";
      },
    ),
    _terminateOptWorker());
  const _0x5b9703 = _ensureOptWorker();
  ((_0x5b9703["onmessage"] = (_0xe45193) => {
    const _0x251147 = _0xe45193["data"];
    if (_0x251147["runId"] !== _0x103f39) return;
    if (_0x251147["type"] === "progress") {
      const _0x265348 = Math["round"](
          (_0x251147["g"] / _0x251147["total"]) * 0x64,
        ),
        _0x484714 = document["getElementById"]("optProgressBar"),
        _0x1348fb = document["getElementById"]("optProgressLabel");
      if (_0x484714) _0x484714["style"]["width"] = _0x265348 + "%";
      if (_0x1348fb)
        _0x1348fb["textContent"] =
          "Optimizing " +
          _0x251147["g"] +
          "/" +
          _0x251147["total"] +
          " gear sets · " +
          (_0x251147["elapsed"] / 0x3e8)["toFixed"](0x1) +
          "s" +
          (_0x251147["dmg"]
            ? " · best dmg " +
              Math["round"](_0x251147["dmg"])["toLocaleString"]()
            : "");
    } else
      _0x251147["type"] === "result" &&
        (_buildCache["set"](_0x54496f, _0x251147["result"]),
        renderMinMaxResult(_0x48dd67, _0x58c318, _0x251147["result"], {
          label: _0x640622,
          missing: _0x27bf3b,
        }));
  }),
    (_0x5b9703["onerror"] = (_0x4e257b) => {
      _0x2de473["innerHTML"] =
        '<div class="build-panel"><h3>' +
        _0x640622 +
        '</h3>\n            <div class="build-loading">Optimizer error: ' +
        (_0x4e257b["message"] || "unknown") +
        ".</div></div>";
    }),
    _0x5b9703["postMessage"]({
      runId: _0x103f39,
      presetName: _0x48dd67,
      userData: _0x58c318,
    }));
}
function renderLootForm() {
  const _0x439aab = $("buildPanel");
  _terminateOptWorker();
  if (!_gearSnapshot) {
    _0x439aab["innerHTML"] =
      '<div class="build-panel"><h3>💰 Loot Build</h3>\n            <div class="build-loading">Market snapshot still loading… try again in a moment.</div></div>';
    return;
  }
  const _0x1204d3 = buildOptimizerUserData(state.lastAnalysis),
    _0x1c2e3f = _0x1204d3["lvl"],
    _0x74a590 = _hasLiveOffers(),
    _0x53a02e = _0x74a590 ? window["_LIVE_OFFERS"] : null,
    _0x58a03f = _0x53a02e?.["generatedAt"]
      ? Math["round"](
          (Date["now"]() - new Date(_0x53a02e["generatedAt"])["getTime"]()) /
            0x36ee80,
        )
      : null,
    _0x2a9e02 = _0x53a02e?.["generatedAt"]
      ? new Date(_0x53a02e["generatedAt"])["toLocaleString"]()
      : "?",
    _0x4e4229 = _0x53a02e ? Object["keys"](_0x53a02e["items"])["length"] : 0x0,
    _0x1c1afd = _0x53a02e
      ? Object["values"](_0x53a02e["items"])["reduce"](
          (_0xf4a38a, _0x2b61a9) => _0xf4a38a + (_0x2b61a9["n"] || 0x0),
          0x0,
        )
      : 0x0;
  _0x439aab["innerHTML"] =
    '\n        <div class="build-panel mm-form">\n            <h3>💰 Loot Build <span style="color:#8b8fa3;font-size:13px;font-weight:500">· maximise net income</span></h3>\n            <div class="gc-intro">\n                Optimises for <b>net income</b>, not damage. No attack / crit — those only raise\n                damage, and chests come from <b>landed hits × loot%</b> (misses give no chests).\n                Invests only in: <b>precision</b> (land hits), <b>armor / dodge / health / hunger</b>\n                (survive longer → more swings → more landed hits), <b>loot</b> (chest % per landed\n                hit), and <b>energy / production / entre / companies</b> (personal + company income).\n                Pill <b>off</b>. Food is auto-decided — it runs <b>bread</b> vs\n                <b>no food</b> and keeps whichever nets more. Gear priced from real\n                warera market data.\n                <b>Gun &amp; helmet are always left empty</b> (attack &amp; crit-damage never\n                repay their cost for a loot build); any other slot may also be left empty\n                if that\'s cheaper net.\n                <br><br>\n                Skill caps: precision 4–8 · loot 4–10 · armor/dodge/health/hunger 0–8 (≤ precision)\n                · energy/production/entre 0–8 · attack/crit 0. Requires <b>level ≥ 5</b>\n                (precision 4 + loot 4 minimum).\n            </div>\n            ' +
    (_0x74a590
      ? '\n            <label class="opt-target-row mm-live-row" style="border:1px solid #2a4a78;background:#152033;border-radius:8px;padding:10px 12px;margin-top:8px;cursor:pointer">\n                <input type="checkbox" id="lootUseLive" checked style="width:auto" />\n                <span style="margin-left:8px"><b style="color:#aab9ff">Use LIVE offers snapshot</b>\n                    <span class="mm-pct-hint">(' +
        _0x2a9e02 +
        (_0x58a03f != null ? " · " + _0x58a03f + "h ago" : "") +
        " · " +
        _0x4e4229 +
        " items · " +
        _0x1c1afd +
        " offers)</span>\n                </span>\n            </label>"
      : '<div class="mm-pct-hint" style="margin-top:8px;color:#6b7080">\n                No live-offers snapshot baked in — using the public /gear-ranges snapshot.\n            </div>') +
    '\n\n            <div class="opt-target-row">\n                <label for="lootLvlInput">Player level</label>\n                <input type="number" id="lootLvlInput" value="' +
    _0x1c2e3f +
    '" step="1" min="5" max="100" />\n                <span class="opt-target-hint">SP available = level × 4</span>\n            </div>\n\n            <div class="opt-target-row">\n                <label for="lootPctInput">Roll target</label>\n                <input type="range" id="lootPctInput" min="5" max="95" step="5" value="50" />\n                <span class="mm-pct-display" id="lootPctDisplay">p50</span>\n            </div>\n            <div class="mm-pct-hint">\n                p25 = below-average rolls (cheap) · p50 = median · p75 = above-average · p90 = near-perfect (expensive)\n            </div>\n\n            <div class="opt-target-row" style="align-items:center">\n                <label>Gear tiers</label>\n                <label class="loot-tier-chk"><input type="checkbox" class="lootTier" value="basic" checked /> Basic</label>\n                <label class="loot-tier-chk"><input type="checkbox" class="lootTier" value="green" checked /> Green</label>\n                <label class="loot-tier-chk"><input type="checkbox" class="lootTier" value="blue" checked /> Blue</label>\n            </div>\n            <div class="mm-pct-hint">Applies to chest / pants / gloves / boots (gun &amp; helmet are forced empty). "Empty" is always an option — a higher tier is only bought if its extra loot pays for its higher daily cost.</div>\n\n            <button type="button" class="opt-be-btn" id="lootRunBtn">Run Loot simulation →</button>\n            <div class="mm-pct-hint" style="margin-top:8px;color:#eab308">\n                Full max-net search (no damage pruning). Most levels finish in ~1–3 min;\n                level ~35–45 with many companies can take ~5–7 min. Progress bar + Cancel appear once it starts.\n            </div>\n        </div>';
  const _0x2df3cc = document["getElementById"]("lootPctInput"),
    _0x258753 = document["getElementById"]("lootPctDisplay");
  (_0x2df3cc["addEventListener"]("input", () => {
    _0x258753["textContent"] = "p" + _0x2df3cc["value"];
  }),
    document["getElementById"]("lootRunBtn")["addEventListener"](
      "click",
      () => {
        const _0x403841 = Number(
            document["getElementById"]("lootLvlInput")["value"],
          ),
          _0xb15347 =
            Number["isFinite"](_0x403841) && _0x403841 >= 0x1
              ? Math["floor"](_0x403841)
              : _0x1c2e3f,
          _0x51402f = Number(_0x2df3cc["value"]),
          _0x23c79a = {};
        document["querySelectorAll"](".lootTier")["forEach"]((_0x50891b) => {
          if (_0x50891b["checked"]) _0x23c79a[_0x50891b["value"]] = !![];
        });
        !Object["keys"](_0x23c79a)["length"] &&
          (_0x23c79a["basic"] = _0x23c79a["green"] = _0x23c79a["blue"] = !![]);
        const _0x55644c = document["getElementById"]("lootUseLive");
        ((_lootConfig = {
          preset: "loot",
          lvl: _0xb15347,
          percentile: _0x51402f,
          tiers: _0x23c79a,
          useLive: _0x55644c ? _0x55644c["checked"] : ![],
        }),
          (_lootStarted = !![]),
          renderBuildPanel());
      },
    ));
}
function runLootBuild() {
  const _0x3e703d = $("buildPanel");
  if (!_gearSnapshot || !_lootConfig)
    return ((_lootStarted = ![]), renderLootForm());
  const _0x5c2396 = _lootConfig,
    _0x439492 = buildOptimizerUserData(state.lastAnalysis),
    _0x29dad7 = OPT["PRESET_DEFS"]["loot"]["gearTiers"],
    _0x3d98d1 = { none: !![] };
  for (const _0xb65b74 of ["basic", "green", "blue"])
    if (_0x5c2396["tiers"][_0xb65b74] && _0x29dad7[_0xb65b74])
      _0x3d98d1[_0xb65b74] = !![];
  !(_0x3d98d1["basic"] || _0x3d98d1["green"] || _0x3d98d1["blue"]) &&
    (_0x3d98d1["basic"] = _0x3d98d1["green"] = _0x3d98d1["blue"] = !![]);
  const _0x3d26de = !!(_0x5c2396["useLive"] && _hasLiveOffers()),
    _0x4a4af4 = _0x3d26de ? window["_LIVE_OFFERS"] : _gearSnapshot,
    _0x1b7062 = _0x3d26de ? _gearSnapshot : null,
    { overrides: _0x17e2a6, missing: _0x1370fe } = buildMinMaxOverrides(
      _0x4a4af4,
      _0x5c2396["percentile"],
      _0x3d98d1,
      _0x1b7062,
    ),
    _0x382339 = {
      ..._0x439492,
      lvl: _0x5c2396["lvl"],
      gearOverrides: _0x17e2a6,
      gearTiersOverride: _0x3d98d1,
      objectiveOverride: "minSpent",
      usePillOverride: ![],
      useLiveOffers: _0x3d26de,
      _gearOverridesKey:
        (_0x3d26de ? "live|" : "") +
        "p" +
        _0x5c2396["percentile"] +
        "|loot|" +
        Object["keys"](_0x3d98d1)["sort"]()["join"](""),
    },
    _0x3c72d0 = ["basic", "green", "blue"]
      ["filter"]((_0x1159fc) => _0x3d98d1[_0x1159fc])
      ["join"]("/"),
    _0x1fe1f6 = _0x3d26de ? '<span style="color:#aab9ff">· LIVE</span>' : "";
  ((_0x3e703d["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>💰 Loot Build · max-net · ' +
    _0x3c72d0 +
    " · p" +
    _0x5c2396["percentile"] +
    " · pill off " +
    _0x1fe1f6 +
    '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting loot optimiser…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n            <div class="mm-pct-hint" style="margin-top:8px">Racing <b>bread</b> vs <b>no food</b> — keeping whichever nets more.</div>\n            ' +
    (_0x1370fe["length"]
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-top:6px">⚠ Thin samples for ' +
        _0x1370fe["length"] +
        " (slot, tier) — those tiers fall back to listed reference values.</div>"
      : "") +
    "\n        </div>"),
    document["getElementById"]("optCancelBtn")["addEventListener"](
      "click",
      () => {
        _terminateOptWorker();
        const _0x235940 = document["getElementById"]("optProgressLabel");
        if (_0x235940) _0x235940["textContent"] = "Cancelled.";
      },
    ));
  const _0x417f11 = { bread: "Bread (+10%)", none: "No food" },
    _0x285225 = [
      { label: "bread", food: "bread" },
      { label: "no food", food: "none" },
    ],
    _0x586e8b = [],
    _0x1be0ea = Date["now"](),
    _0x3f40fb = (_0x349bd8) => {
      if (_0x349bd8 >= _0x285225["length"]) {
        _0x586e8b["sort"](
          (_0x3839f5, _0xa9951b) =>
            (_0x3839f5["result"]["bestBuild"]?.["spent"] ?? Infinity) -
            (_0xa9951b["result"]["bestBuild"]?.["spent"] ?? Infinity),
        );
        const _0x2547da = _0x586e8b[0x0],
          _0x3acc4f = _0x586e8b[0x1],
          _0x2e1401 = _0x2547da["result"]["bestBuild"]
            ? -_0x2547da["result"]["bestBuild"]["spent"]
            : null,
          _0x388426 =
            _0x3acc4f && _0x3acc4f["result"]["bestBuild"]
              ? -_0x3acc4f["result"]["bestBuild"]["spent"]
              : null,
          _0x1fc634 = (_0x2789a8) =>
            (_0x2789a8 >= 0x0 ? "+$" : "-$") +
            Math["abs"](_0x2789a8)["toFixed"](0x2),
          _0x30796f = (_0x1da007) =>
            _0x1da007 === "bread" ? "mm-food-bread" : "mm-food-none";
        let _0x31aec3 = "";
        if (_0x2e1401 != null && _0x388426 != null) {
          const _0xbd4d21 = _0x2e1401 - _0x388426;
          _0x31aec3 =
            '<div class="mm-food-race"><b>Food race:</b>\n                    <span class="' +
            _0x30796f(_0x2547da["food"]) +
            '">' +
            _0x417f11[_0x2547da["food"]] +
            " " +
            _0x1fc634(_0x2e1401) +
            '/day</span>\n                    vs <span class="' +
            _0x30796f(_0x3acc4f["food"]) +
            '">' +
            _0x417f11[_0x3acc4f["food"]] +
            " " +
            _0x1fc634(_0x388426) +
            "/day</span>\n                    → using <b>" +
            _0x417f11[_0x2547da["food"]] +
            "</b>" +
            (_0xbd4d21 > 0.005
              ? " (saves $" + _0xbd4d21["toFixed"](0x2) + "/day)"
              : " (tie — same net)") +
            "</div>";
        }
        const _0x39b2ad =
          "💰 Loot Build · max-net · " +
          _0x3c72d0 +
          " · p" +
          _0x5c2396["percentile"] +
          " · " +
          _0x417f11[_0x2547da["food"]] +
          " · pill off " +
          _0x1fe1f6;
        renderMinMaxResult("loot", _0x2547da["userData"], _0x2547da["result"], {
          label: _0x39b2ad,
          missing: _0x1370fe,
          cfg: _0x5c2396,
          banner: _0x31aec3,
        });
        return;
      }
      const _0x924133 = _0x285225[_0x349bd8],
        _0x31cbae = { ..._0x382339, foodTypeOverride: _0x924133["food"] },
        _0x357386 = _buildCacheKey("loot", _0x31cbae);
      if (_buildCache["has"](_0x357386))
        return (
          _0x586e8b["push"]({
            food: _0x924133["food"],
            result: _buildCache["get"](_0x357386),
            userData: _0x31cbae,
          }),
          _0x3f40fb(_0x349bd8 + 0x1)
        );
      const _0x5dc3c2 = ++_optRunId;
      _terminateOptWorker();
      const _0x49eaee = _ensureOptWorker();
      ((_0x49eaee["onmessage"] = (_0x32a8de) => {
        const _0x1217fb = _0x32a8de["data"];
        if (_0x1217fb["runId"] !== _0x5dc3c2) return;
        if (_0x1217fb["type"] === "progress") {
          const _0xf33e64 = Math["round"](
              (_0x1217fb["g"] / _0x1217fb["total"]) * 0x64,
            ),
            _0x1c2616 = document["getElementById"]("optProgressBar"),
            _0x4cf91c = document["getElementById"]("optProgressLabel");
          if (_0x1c2616) _0x1c2616["style"]["width"] = _0xf33e64 + "%";
          if (_0x4cf91c)
            _0x4cf91c["textContent"] =
              _0x924133["label"] +
              ": gear " +
              _0x1217fb["g"] +
              "/" +
              _0x1217fb["total"] +
              " · " +
              ((Date["now"]() - _0x1be0ea) / 0x3e8)["toFixed"](0x1) +
              "s";
        } else
          _0x1217fb["type"] === "result" &&
            (_buildCache["set"](_0x357386, _0x1217fb["result"]),
            _0x586e8b["push"]({
              food: _0x924133["food"],
              result: _0x1217fb["result"],
              userData: _0x31cbae,
            }),
            _0x3f40fb(_0x349bd8 + 0x1));
      }),
        (_0x49eaee["onerror"] = (_0x22362f) => {
          _0x3e703d["innerHTML"] =
            '<div class="build-panel"><h3>💰 Loot Build</h3>\n                <div class="build-loading">Optimiser error: ' +
            (_0x22362f["message"] || "unknown") +
            ".</div></div>";
        }),
        _0x49eaee["postMessage"]({
          runId: _0x5dc3c2,
          presetName: "loot",
          userData: _0x31cbae,
        }));
    };
  _0x3f40fb(0x0);
}
function renderLvlUpForm() {
  const _0x262b9c = $("buildPanel");
  _terminateOptWorker();
  if (!_gearSnapshot) {
    _0x262b9c["innerHTML"] =
      '<div class="build-panel"><h3>🎚️ LVL Up Calc</h3>\n            <div class="build-loading">Market snapshot still loading… try again in a moment.</div></div>';
    return;
  }
  const _0x125b9d = state.lastAnalysis?.["user"]?.["leveling"] || {},
    _0xad87fe = _0x125b9d["level"] || 0x1,
    _0x51cf13 = _0x125b9d["availableSkillPoints"] ?? 0x0,
    _0xd32029 = unmodeledReservedSP(state.lastAnalysis?.["user"]),
    _0x54626c = Math["min"](_0xad87fe + 0x1, LVLUP_MAX_PLAYER_LVL),
    _0x53f8a2 = _hasLiveOffers(),
    _0x3a5bf2 = _0x53f8a2 ? window["_LIVE_OFFERS"] : null,
    _0x550b5a = _0x3a5bf2?.["generatedAt"]
      ? Math["round"](
          (Date["now"]() - new Date(_0x3a5bf2["generatedAt"])["getTime"]()) /
            0x36ee80,
        )
      : null,
    _0xeac199 = _0x3a5bf2?.["generatedAt"]
      ? new Date(_0x3a5bf2["generatedAt"])["toLocaleString"]()
      : "?",
    _0x223bd1 = _0x3a5bf2 ? Object["keys"](_0x3a5bf2["items"])["length"] : 0x0,
    _0x18d5d7 = _0x3a5bf2
      ? Object["values"](_0x3a5bf2["items"])["reduce"](
          (_0x949a68, _0x30f365) => _0x949a68 + (_0x30f365["n"] || 0x0),
          0x0,
        )
      : 0x0;
  _0x262b9c["innerHTML"] =
    '\n        <div class="build-panel mm-form">\n            <h3>🎚️ LVL Up Calc <span style="color:#8b8fa3;font-size:13px;font-weight:500">· where do my next points go?</span></h3>\n            <div class="gc-intro">\n                Keeps <b>' +
    (state.lastAnalysis?.["user"]?.["username"] || "the player") +
    "</b>'s current skills as a\n                <b>floor</b> (no respec — it only ever suggests adding points), then finds the best\n                way to spend the points you'll have at the target level.\n                <br><br>\n                <b>Target net / day</b> sets the goal:\n                <b style=\"color:#22c55e\">≥ $" +
    LVLUP_ECO_THRESHOLD +
    '</b> → <b>eco</b> (maximise net income — recommends income skills);\n                <b style="color:#ef4444">&lt; $' +
    LVLUP_ECO_THRESHOLD +
    "</b> → <b>war</b> (maximise damage within that spend budget — recommends combat skills,\n                exactly like Gear Check's net field).\n                <br><br>\n                You currently have <b>" +
    _0x51cf13 +
    "</b> unspent point" +
    (_0x51cf13 === 0x1 ? "" : "s") +
    "\n                at level <b>" +
    _0xad87fe +
    "</b>. Gear is priced from real warera market data. Every\n                skill is a candidate — points go wherever they help the chosen goal most.\n                " +
    (_0xd32029 > 0x0
      ? "<br><br><b>" +
        _0xd32029 +
        "</b> skill point" +
        (_0xd32029 === 0x1 ? "" : "s") +
        "\n                " +
        (_0xd32029 === 0x1 ? "is" : "are") +
        " locked in skills this tool can't model\n                (e.g. <b>Management</b>) — kept exactly as they are, never recommended."
      : "") +
    "\n            </div>\n            " +
    (_0x53f8a2
      ? '\n            <label class="opt-target-row mm-live-row" style="border:1px solid #2a4a78;background:#152033;border-radius:8px;padding:10px 12px;margin-top:8px;cursor:pointer">\n                <input type="checkbox" id="luUseLive" checked style="width:auto" />\n                <span style="margin-left:8px"><b style="color:#aab9ff">Use LIVE offers snapshot</b>\n                    <span class="mm-pct-hint">(' +
        _0xeac199 +
        (_0x550b5a != null ? " · " + _0x550b5a + "h ago" : "") +
        " · " +
        _0x223bd1 +
        " items · " +
        _0x18d5d7 +
        " offers)</span>\n                </span>\n            </label>"
      : '<div class="mm-pct-hint" style="margin-top:8px;color:#6b7080">\n                No live-offers snapshot baked in — using the public /gear-ranges snapshot.\n            </div>') +
    '\n\n            <div class="opt-target-row">\n                <label for="luLvlInput">Target level</label>\n                <input type="number" id="luLvlInput" value="' +
    _0x54626c +
    '" step="1" min="' +
    _0xad87fe +
    '" max="' +
    LVLUP_MAX_PLAYER_LVL +
    '" />\n                <span class="opt-target-hint">default = your level + 1 (' +
    _0xad87fe +
    " → " +
    _0x54626c +
    ')</span>\n            </div>\n\n            <div class="opt-target-row">\n                <label for="luNetInput">Target net / day</label>\n                <input type="number" id="luNetInput" value="' +
    LVLUP_ECO_THRESHOLD +
    '" step="1" />\n                <span class="opt-target-hint">≥ ' +
    LVLUP_ECO_THRESHOLD +
    " = eco (max income) · &lt; " +
    LVLUP_ECO_THRESHOLD +
    ' = war (max damage)</span>\n            </div>\n\n            <div class="opt-target-row">\n                <label for="luPctInput">Roll target</label>\n                <input type="range" id="luPctInput" min="5" max="95" step="5" value="50" />\n                <span class="mm-pct-display" id="luPctDisplay">p50</span>\n            </div>\n            <div class="mm-pct-hint">\n                p25 = below-average rolls (cheap) · p50 = median · p75 = above-average · p90 = near-perfect (expensive)\n            </div>\n\n            <button type="button" class="opt-be-btn" id="luRunBtn">Calculate next points →</button>\n            <div class="mm-pct-hint" style="margin-top:8px;color:#6b7080">\n                Fast — your current skills are the floor, so only the points gained up to the\n                target level are searched. Usually well under a second; a few seconds for big level jumps.\n            </div>\n        </div>';
  const _0x3be178 = document["getElementById"]("luPctInput"),
    _0x43adf4 = document["getElementById"]("luPctDisplay");
  (_0x3be178["addEventListener"]("input", () => {
    _0x43adf4["textContent"] = "p" + _0x3be178["value"];
  }),
    document["getElementById"]("luRunBtn")["addEventListener"]("click", () => {
      const _0x5c9eb8 = Number(
          document["getElementById"]("luLvlInput")["value"],
        ),
        _0x360156 = Number["isFinite"](_0x5c9eb8)
          ? Math["max"](
              _0xad87fe,
              Math["min"](LVLUP_MAX_PLAYER_LVL, Math["floor"](_0x5c9eb8)),
            )
          : _0x54626c,
        _0x3104a0 = Number(document["getElementById"]("luNetInput")["value"]),
        _0x3a2729 = Number["isFinite"](_0x3104a0)
          ? _0x3104a0
          : LVLUP_ECO_THRESHOLD,
        _0x1a5d84 = document["getElementById"]("luUseLive");
      ((_lvlUpConfig = {
        preset: "lvlup",
        lvl: _0x360156,
        targetLvl: _0x360156,
        net: _0x3a2729,
        percentile: Number(_0x3be178["value"]),
        useLive: _0x1a5d84 ? _0x1a5d84["checked"] : ![],
      }),
        (_lvlUpStarted = !![]),
        renderBuildPanel());
    }));
}
function runLvlUpBuild() {
  const _0x2b244a = $("buildPanel");
  if (!_gearSnapshot || !_lvlUpConfig)
    return ((_lvlUpStarted = ![]), renderLvlUpForm());
  const _0x233dbb = _lvlUpConfig,
    _0x1bb215 = buildOptimizerUserData(state.lastAnalysis),
    _0x558910 = extractPlayerSkills(state.lastAnalysis["user"]),
    _0x57aa24 = {};
  OPT["SKILL_NAMES"]["forEach"]((_0x3b1206) => {
    _0x57aa24[_0x3b1206] = OPT["MAX_LVL"];
  });
  const _0xb00e6f = _0x233dbb["net"] >= LVLUP_ECO_THRESHOLD,
    _0x39c0f8 = _0xb00e6f
      ? { objectiveOverride: "minSpent", spentLimitOverride: 0x3b9aca00 }
      : { objectiveOverride: "maxDmg", spentLimitOverride: -_0x233dbb["net"] },
    _0x4888b5 = OPT["PRESET_DEFS"]["sustainable"]["gearTiers"],
    _0x55a6a7 = !!(_0x233dbb["useLive"] && _hasLiveOffers()),
    _0x2d09fa = _0x55a6a7 ? window["_LIVE_OFFERS"] : _gearSnapshot,
    _0x25b428 = _0x55a6a7 ? _gearSnapshot : null,
    { overrides: _0x4c4757, missing: _0x14fb12 } = buildMinMaxOverrides(
      _0x2d09fa,
      _0x233dbb["percentile"],
      _0x4888b5,
      _0x25b428,
    ),
    _0x5848b1 = {
      ..._0x1bb215,
      ..._0x39c0f8,
      lvl: _0x233dbb["targetLvl"],
      minSkillsOverride: _0x558910,
      maxSkillsOverride: _0x57aa24,
      noStructuralCapsOverride: !![],
      reservedSPOverride: unmodeledReservedSP(state.lastAnalysis["user"]),
      gearOverrides: _0x4c4757,
      useLiveOffers: _0x55a6a7,
      _gearOverridesKey:
        (_0x55a6a7 ? "live|" : "") +
        "p" +
        _0x233dbb["percentile"] +
        "|lvlup|L" +
        _0x233dbb["targetLvl"] +
        "|net" +
        _0x233dbb["net"],
    },
    _0x54cb8c = _0xb00e6f
      ? '<span style="color:#22c55e">eco · max net</span>'
      : '<span style="color:#ef4444">war · max dmg · net $' +
        _0x233dbb["net"] +
        "/day</span>",
    _0x183a13 = _0x55a6a7 ? '<span style="color:#aab9ff">· LIVE</span>' : "",
    _0x5a5db3 =
      "🎚️ LVL Up Calc · lvl " +
      _0x233dbb["targetLvl"] +
      " · " +
      _0x54cb8c +
      " · p" +
      _0x233dbb["percentile"] +
      " " +
      _0x183a13,
    _0x5a3e50 = (_0x1ef4ad) => {
      if (!_0x1ef4ad?.["bestBuild"]) {
        _0x2b244a["innerHTML"] =
          '<div class="build-panel"><h3>' +
          _0x5a5db3 +
          '</h3>\n                <div class="build-loading">No allocation spends exactly the points you\'d have at\n                level ' +
          _0x233dbb["targetLvl"] +
          ". This usually means the target level is too close to your\n                current one to place the gained points cleanly — try a higher target level.</div></div>";
        return;
      }
      const _0x271cca = _lvlUpBanner(
        _0x558910,
        _0x1ef4ad["bestBuild"]["skills"],
        _0x233dbb,
        state.lastAnalysis?.["user"]?.["leveling"] || {},
      );
      renderMinMaxResult("sustainable", _0x5848b1, _0x1ef4ad, {
        label: _0x5a5db3,
        missing: _0x14fb12,
        cfg: _0x233dbb,
        banner: _0x271cca,
        currentSkills: _0x558910,
      });
    },
    _0x10401f = _buildCacheKey("sustainable", _0x5848b1);
  if (_buildCache["has"](_0x10401f))
    return _0x5a3e50(_buildCache["get"](_0x10401f));
  const _0x1d9103 = ++_optRunId;
  ((_0x2b244a["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>' +
    _0x5a5db3 +
    '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting LVL Up calc…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n            ' +
    (_0x14fb12["length"]
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-top:10px">⚠ Thin samples for ' +
        _0x14fb12["length"] +
        " (slot, tier) — those tiers fall back to listed reference values.</div>"
      : "") +
    "\n        </div>"),
    document["getElementById"]("optCancelBtn")["addEventListener"](
      "click",
      () => {
        _terminateOptWorker();
        const _0x2e392e = document["getElementById"]("optProgressLabel");
        if (_0x2e392e) _0x2e392e["textContent"] = "Cancelled.";
      },
    ),
    _terminateOptWorker());
  const _0x5860e1 = _ensureOptWorker();
  ((_0x5860e1["onmessage"] = (_0x14a861) => {
    const _0x14b233 = _0x14a861["data"];
    if (_0x14b233["runId"] !== _0x1d9103) return;
    if (_0x14b233["type"] === "progress") {
      const _0x5726d0 = Math["round"](
          (_0x14b233["g"] / _0x14b233["total"]) * 0x64,
        ),
        _0x2e1010 = document["getElementById"]("optProgressBar"),
        _0x57e613 = document["getElementById"]("optProgressLabel");
      if (_0x2e1010) _0x2e1010["style"]["width"] = _0x5726d0 + "%";
      if (_0x57e613)
        _0x57e613["textContent"] =
          "Optimizing " +
          _0x14b233["g"] +
          "/" +
          _0x14b233["total"] +
          " gear sets · " +
          (_0x14b233["elapsed"] / 0x3e8)["toFixed"](0x1) +
          "s";
    } else
      _0x14b233["type"] === "result" &&
        (_buildCache["set"](_0x10401f, _0x14b233["result"]),
        _0x5a3e50(_0x14b233["result"]));
  }),
    (_0x5860e1["onerror"] = (_0x401c54) => {
      _0x2b244a["innerHTML"] =
        '<div class="build-panel"><h3>' +
        _0x5a5db3 +
        '</h3>\n            <div class="build-loading">Optimizer error: ' +
        (_0x401c54["message"] || "unknown") +
        ".</div></div>";
    }),
    _0x5860e1["postMessage"]({
      runId: _0x1d9103,
      presetName: "sustainable",
      userData: _0x5848b1,
    }));
}
function _lvlUpBanner(_0x28799b, _0x3f3db2, _0x32e49b, _0x357ef0) {
  if (!_0x3f3db2) return "";
  const _0x29d589 = _0x32e49b["net"] >= LVLUP_ECO_THRESHOLD,
    _0x52044c = _0x29d589
      ? '<span style="color:#22c55e">eco — maximise net income</span>'
      : '<span style="color:#ef4444">war — maximise damage (net &lt; $' +
        LVLUP_ECO_THRESHOLD +
        ", budget $" +
        _0x32e49b["net"] +
        "/day)</span>",
    _0x314faf = SKILL_DISPLAY["map"](([_0xff6f37, _0x2478bb]) => ({
      lbl: _0x2478bb,
      d: (_0x3f3db2[_0xff6f37] ?? 0x0) - (_0x28799b[_0xff6f37] ?? 0x0),
    }))
      ["filter"]((_0xc023e3) => _0xc023e3["d"] > 0x0)
      ["sort"]((_0xf11453, _0x3057da) => _0x3057da["d"] - _0xf11453["d"]),
    _0x569a81 = _0x314faf["reduce"](
      (_0x3b1fa6, _0x1de7b5) => _0x3b1fa6 + _0x1de7b5["d"],
      0x0,
    ),
    _0x1befca = _0x357ef0["availableSkillPoints"] ?? 0x0,
    _0x30c3c5 = _0x357ef0["level"] ?? "?",
    _0x35e87c = unmodeledReservedSP(state.lastAnalysis?.["user"]),
    _0x12cb04 = _0x314faf["length"]
      ? _0x314faf["map"](
          (_0x48dd75) =>
            '<span class="lvlup-chip">+' +
            _0x48dd75["d"] +
            " " +
            _0x48dd75["lbl"] +
            "</span>",
        )["join"](" ")
      : '<span style="color:#8b8fa3">Nothing to add — your build is already optimal for level ' +
        _0x32e49b["targetLvl"] +
        " under this goal.</span>";
  return (
    '<div class="mm-food-race">\n        <div style="margin-bottom:6px"><b>Put your next points here</b>\n            — level ' +
    _0x30c3c5 +
    " → <b>" +
    _0x32e49b["targetLvl"] +
    "</b> · goal: " +
    _0x52044c +
    '</div>\n        <div style="line-height:1.9">' +
    _0x12cb04 +
    '</div>\n        <div class="mm-pct-hint" style="margin-top:8px;color:#8b8fa3">\n            Allocates <b>' +
    _0x569a81 +
    "</b> skill level" +
    (_0x569a81 === 0x1 ? "" : "s") +
    " on top of your\n            current skills" +
    (_0x1befca
      ? " (includes your " +
        _0x1befca +
        " currently-unspent point" +
        (_0x1befca === 0x1 ? "" : "s") +
        ")"
      : "") +
    ".\n            " +
    (_0x35e87c > 0x0
      ? "<b>" +
        _0x35e87c +
        "</b> point" +
        (_0x35e87c === 0x1 ? "" : "s") +
        " locked in unmodeled skills (e.g. Management) excluded. "
      : "") +
    "Full recommended distribution is in the Skills table below.\n        </div>\n    </div>"
  );
}
function renderMinMaxResult(_0x1e7f9b, _0x993e10, _0x23731d, _0x37a310) {
  const _0x2cfc16 = $("buildPanel"),
    _0xf35769 = OPT["PRESET_DEFS"][_0x1e7f9b],
    _0x251370 = _0x23731d["bestBuild"],
    _0x4a7356 = _0x37a310["cfg"] || _minMaxConfig;
  if (!_0x251370) {
    _0x2cfc16["innerHTML"] =
      '<div class="build-panel"><h3>' +
      _0x37a310["label"] +
      '</h3>\n            <div class="build-loading">No feasible build under this preset\'s constraints at p' +
      _0x4a7356["percentile"] +
      ".\n            Try a lower roll target, change the preset, or raise the target net.</div></div>";
    return;
  }
  const _0x58c164 = (_0x5af74d) =>
      (_0x5af74d >= 0x0 ? "+$" : "-$") + Math["abs"](_0x5af74d)["toFixed"](0x2),
    _0x1d93b6 = (_0x457b88) => (_0x457b88 >= 0x0 ? "positive" : "negative"),
    _0xd55d8c = {
      gun: "Gun",
      helmet: "Helmet",
      chest: "Chest",
      pant: "Pants",
      glove: "Gloves",
      boot: "Boots",
    },
    _0x147cac = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      ["map"]((_0x5a31c2) => {
        const _0x54e8db = _0x251370["gear"][_0x5a31c2],
          _0x3df2a3 = _0x54e8db["type"],
          _0x34aa83 = MM_TIER_TO_CODE[_0x5a31c2]?.[_0x3df2a3],
          _0x27e32e = MM_SLOT_STATS[_0x5a31c2]["map"](
            (_0x6cf204) =>
              _0x6cf204 + ": " + (_0x54e8db[_0x6cf204] ?? 0x0)["toFixed"](0x1),
          )["join"](", "),
          _0x59673f = _0x34aa83 ? _gearSnapshot?.["items"]?.[_0x34aa83] : null;
        let _0x505e85 = "";
        if (_0x59673f && _0x59673f["n"]) {
          const _0x125b8b = _0x59673f["price"] || {},
            _0x52b75d = _0x59673f["n"] < 0x14,
            _0x3f58bd = _0x52b75d
              ? ' <span class="mm-noisy">(thin samples · n=' +
                _0x59673f["n"] +
                ")</span>"
              : " (n=" + _0x59673f["n"] + ")";
          _0x505e85 =
            '<div class="mm-market-cell">market: <b>$' +
            _0x54e8db["buyPrice"]["toFixed"](0x2) +
            "</b> @ p" +
            _0x4a7356["percentile"] +
            "\n                · range $" +
            (_0x125b8b["min"]?.["toFixed"](0x2) ?? "—") +
            "–$" +
            (_0x125b8b["max"]?.["toFixed"](0x2) ?? "—") +
            " · " +
            _0x34aa83 +
            _0x3f58bd +
            "</div>";
        }
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          (_0xd55d8c[_0x5a31c2] || _0x5a31c2) +
          '</td>\n            <td><span class="opt-tier ' +
          _0x3df2a3 +
          '">' +
          _0x3df2a3 +
          "</span></td>\n            <td>" +
          _0x27e32e +
          _0x505e85 +
          "</td>\n            <td>$" +
          _0x54e8db["buyPrice"]["toFixed"](0x2) +
          "</td>\n        </tr>"
        );
      })
      ["join"](""),
    _0x2dec99 = _0x37a310["currentSkills"] || null,
    _0x1657cd = _0x2dec99
      ? "<th>Skill</th><th>Current</th><th>Recommended</th><th>Total Value</th>"
      : "<th>Skill</th><th>Level</th><th>Total Value</th>",
    _0x2eabe9 = SKILL_DISPLAY["map"](([_0x54a1be, _0x483b1b]) => {
      const _0x3149a6 = _0x251370["skills"][_0x54a1be],
        _0x51b2e7 = _0x251370["skillValues"][_0x54a1be];
      if (_0x2dec99) {
        const _0x5833ad = _0x2dec99[_0x54a1be] ?? 0x0,
          _0x375742 = _0x3149a6 - _0x5833ad,
          _0x5d70fe =
            _0x375742 > 0x0
              ? ' <span class="lvlup-add">+' + _0x375742 + "</span>"
              : "";
        return (
          "<tr><td>" +
          _0x483b1b +
          "</td><td>" +
          _0x5833ad +
          "</td><td>" +
          _0x3149a6 +
          _0x5d70fe +
          "</td><td>" +
          _0x51b2e7["toFixed"](0x1) +
          "</td></tr>"
        );
      }
      return (
        "<tr><td>" +
        _0x483b1b +
        "</td><td>" +
        _0x3149a6 +
        "</td><td>" +
        _0x51b2e7["toFixed"](0x1) +
        "</td></tr>"
      );
    })["join"](""),
    _0x18067e = OPT["buildPresetParams"](_0x1e7f9b, _0x993e10),
    _0xffba68 = _0x23731d["elapsed"]
      ? (_0x23731d["elapsed"] / 0x3e8)["toFixed"](0x2) + "s"
      : "<1ms",
    _0x2ef2de = {
      none: "None",
      bread: "Bread (+10%)",
      meat: "Meat (+15%)",
      fish: "Fish (+20%)",
    }[_0x18067e["foodType"]],
    _0x3766e8 = ["gun", "helmet", "chest", "pant", "glove", "boot"]["reduce"](
      (_0x4d19f5, _0x59be93) =>
        _0x4d19f5 + (_0x251370["gear"][_0x59be93]?.["buyPrice"] || 0x0),
      0x0,
    );
  _0x2cfc16["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>' +
    _0x37a310["label"] +
    "</h3>\n            " +
    (_0x37a310["banner"] || "") +
    '\n            <div class="build-meta">Evaluated ' +
    _0x23731d["combosEvaluated"]["toLocaleString"]() +
    " combos\n                from " +
    _0x23731d["skillCombosCount"]["toLocaleString"]() +
    " candidates\n                across " +
    (_0x23731d["gearSetsCount"] - _0x23731d["gearSetsPruned"]) +
    "/" +
    _0x23731d["gearSetsCount"] +
    " gear sets · " +
    _0xffba68 +
    '</div>\n\n            <div class="opt-hero">\n                <div>\n                    <div class="opt-hero-label">Damage @ p' +
    _0x4a7356["percentile"] +
    ' rolls</div>\n                    <div class="opt-hero-value">' +
    _0x251370["dmg"]["toLocaleString"](undefined, {
      maximumFractionDigits: 0x0,
    }) +
    '</div>\n                </div>\n                <div style="text-align:right">\n                    <div class="opt-hero-label">Net / day</div>\n                    <div class="opt-hero-net ' +
    _0x1d93b6(-_0x251370["spent"]) +
    '">' +
    _0x58c164(-_0x251370["spent"]) +
    '</div>\n                </div>\n            </div>\n            <div class="opt-stats">\n                <div class="opt-stat"><div class="opt-stat-label">Turnover / day</div><div class="opt-stat-value positive">$' +
    _0x251370["profit"]["toFixed"](0x2) +
    '</div></div>\n                <div class="opt-stat"><div class="opt-stat-label">Cost / day</div><div class="opt-stat-value negative">$' +
    _0x251370["cost"]["toFixed"](0x2) +
    '</div></div>\n                <div class="opt-stat"><div class="opt-stat-label">Gear cost @ p' +
    _0x4a7356["percentile"] +
    '</div><div class="opt-stat-value">$' +
    _0x3766e8["toFixed"](0x2) +
    '</div></div>\n            </div>\n\n            <div class="opt-section-title">Gear (real-market prices)</div>\n            ' +
    _mmConsumablesBox(
      _0x18067e["foodType"],
      _0x18067e["usePill"],
      _0x251370["gear"]["gun"]["type"],
    ) +
    '\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats / market info</th><th>Buy @ p' +
    _0x4a7356["percentile"] +
    "</th></tr></thead>\n                <tbody>" +
    _0x147cac +
    '</tbody>\n            </table>\n\n            <div class="js-export-area skill-export">\n                <div class="opt-section-title">Skills & Attributes</div>\n                <table class="opt-table">\n                    <thead><tr>' +
    _0x1657cd +
    "</tr></thead>\n                    <tbody>" +
    _0x2eabe9 +
    '</tbody>\n                </table>\n                <button type="button" class="export-img-btn" data-export-kind="skills">📷 Export image</button>\n            </div>\n\n            <div class="opt-config">\n                <div class="opt-config-item"><span>Food:</span> <b>' +
    _0x2ef2de +
    '</b></div>\n                <div class="opt-config-item"><span>Pill:</span> <b>' +
    (_0x18067e["usePill"] ? "on (+60% dmg)" : "off") +
    '</b></div>\n                <div class="opt-config-item"><span>Spent limit:</span> <b>' +
    _0x58c164(_0x18067e["spentLimit"]) +
    '</b></div>\n                <div class="opt-config-item"><span>Lvl:</span> <b>' +
    _0x18067e["lvl"] +
    '</b></div>\n                <div class="opt-config-item"><span>Roll target:</span> <b>p' +
    _0x4a7356["percentile"] +
    "</b></div>\n                " +
    (_0x993e10["bountyOverride"] != null
      ? '<div class="opt-config-item"><span>Bounty:</span> <b>$' +
        _0x993e10["bountyOverride"]["toFixed"](0x2) +
        "/1k</b></div>"
      : "") +
    "\n                " +
    (_0x993e10["fixedSkills"]
      ? '<div class="opt-config-item"><span>Skills:</span> <b>locked to ' +
        (state.lastAnalysis?.["user"]?.["username"] || "player") +
        "</b></div>"
      : "") +
    '\n            </div>\n\n            <details class="opt-variance" id="mmRollSearch" style="margin-top:14px">\n                <summary class="mm-roll-summary">CLICK HERE: Find best rolls within these tiers (~10–20s)</summary>\n                <div class="opt-variance-body">\n                    <div class="opt-variance-intro">\n                        Locks the optimizer\'s tier picks and skill points, then brute-forces\n                        every roll combination within those tiers. Output is specific roll\n                        targets per slot — e.g. "rifle attack≥87, criticalChance≥14, &lt;$13".\n                    </div>\n                    ' +
    _mmLiveToggleMarkup(_0x993e10) +
    '\n                    <button type="button" class="opt-be-btn" id="mmRunRollSearchBtn">Run roll search →</button>\n                    <div id="mmRollSearchResult"></div>\n                </div>\n            </details>\n\n            ' +
    (_0x1e7f9b === "warEco"
      ? '\n            <div style="margin-top:14px">\n                <button type="button" class="opt-be-btn" id="mmBreakEvenBtn">Find break-even gear with these skills →</button>\n                <div id="mmBreakEvenResult"></div>\n            </div>'
      : "") +
    "\n        </div>";
  const _0xd8b7f = document["getElementById"]("mmRunRollSearchBtn"),
    _0x5efc16 = document["getElementById"]("mmRollSearchResult");
  if (_0xd8b7f)
    _0xd8b7f["addEventListener"]("click", () =>
      runMinMaxRollSearch(
        _0x1e7f9b,
        _0x993e10,
        _0x251370,
        _0x18067e,
        _0xd8b7f,
        _0x5efc16,
      ),
    );
  const _0x4c4163 = document["getElementById"]("mmBreakEvenBtn"),
    _0x4e3e2c = document["getElementById"]("mmBreakEvenResult");
  if (_0x4c4163)
    _0x4c4163["addEventListener"]("click", () =>
      runMinMaxBreakEven(_0x1e7f9b, _0x993e10, _0x251370, _0x4c4163, _0x4e3e2c),
    );
}
function _hasLiveOffers() {
  return !!(
    window["_LIVE_OFFERS"] &&
    window["_LIVE_OFFERS"]["items"] &&
    Object["keys"](window["_LIVE_OFFERS"]["items"])["length"]
  );
}
function runMinMaxRollSearch(
  _0x58b957,
  _0x244013,
  _0x29069c,
  _0x12e1d7,
  _0x135514,
  _0x28f983,
) {
  if (!_gearSnapshot) {
    _0x28f983["innerHTML"] =
      '<div class="opt-variance-error">Snapshot not available.</div>';
    return;
  }
  const _0x49a0cb = _0x28f983["parentElement"]?.["querySelector"]?.(
      'input[type="checkbox"].mm-live-toggle',
    ),
    _0x31a99a = _0x49a0cb ? _0x49a0cb["checked"] : ![],
    _0x29e7c1 = { ..._0x12e1d7, useLiveOffers: _0x31a99a };
  ((_0x135514["disabled"] = !![]),
    (_0x135514["textContent"] = "Searching…"),
    setTimeout(() => {
      try {
        const _0x9a512b = Date["now"](),
          _0x3384f4 = _mmDoRollSearch(_0x29069c, _0x29e7c1),
          _0x41dfeb = Date["now"]() - _0x9a512b;
        _0x28f983["innerHTML"] = _mmRenderRollSearchResult(
          _0x29069c,
          _0x3384f4,
          _0x29e7c1,
          _0x41dfeb,
        );
      } catch (_0xd1200a) {
        _0x28f983["innerHTML"] =
          '<div class="opt-variance-error">Roll search failed: ' +
          _0xd1200a["message"] +
          "</div>";
      } finally {
        ((_0x135514["disabled"] = ![]),
          (_0x135514["textContent"] = "Run roll search →"));
      }
    }, 0x1e));
}
function _mmConsumablesBox(_0x2322b6, _0x4226d3, _0x4aa155) {
  const _0x5c8429 = {
      bread: { txt: "Bread +10%", cls: "mm-food-bread" },
      meat: { txt: "Meat +15%", cls: "mm-food-meat" },
      fish: { txt: "Fish +20%", cls: "mm-food-fish" },
      none: { txt: "None (0%)", cls: "mm-food-none" },
    },
    _0xf419c5 = _0x5c8429[_0x2322b6] || _0x5c8429["none"],
    _0x4ad316 = _0x4226d3 ? "mm-pill-yes" : "mm-pill-no",
    _0x1f83d5 = _0x4226d3 ? "Yes (+60% dmg)" : "No",
    _0x41309 = _0x4aa155 && _0x4aa155 !== "basic" && _0x4aa155 !== "none",
    _0x3c551a = _0x41309 ? "mm-bullets-val" : "mm-bullets-no",
    _0xcf789a = _0x41309 ? "Light Ammo +10%" : "No";
  return (
    '<div class="mm-consumables">\n        <span><b>Food:</b> <span class="' +
    _0xf419c5["cls"] +
    '">' +
    _0xf419c5["txt"] +
    '</span></span>\n        <span><b>Bullets:</b> <span class="' +
    _0x3c551a +
    '">' +
    _0xcf789a +
    '</span></span>\n        <span><b>Pill:</b> <span class="' +
    _0x4ad316 +
    '">' +
    _0x1f83d5 +
    "</span></span>\n    </div>"
  );
}
function _mmLiveToggleMarkup(_0x466f2e) {
  if (!_hasLiveOffers()) return "";
  const _0x363009 = window["_LIVE_OFFERS"],
    _0x2509d1 = _0x363009["generatedAt"]
      ? new Date(_0x363009["generatedAt"])
      : null,
    _0x2f8bfa = _0x2509d1
      ? Math["round"]((Date["now"]() - _0x2509d1["getTime"]()) / 0x36ee80)
      : null,
    _0x1c1738 = _0x2509d1 ? _0x2509d1["toLocaleString"]() : "?",
    _0x490504 = Object["keys"](_0x363009["items"])["length"],
    _0x304616 = Object["values"](_0x363009["items"])["reduce"](
      (_0x415416, _0x6e05e8) => _0x415416 + (_0x6e05e8["n"] || 0x0),
      0x0,
    ),
    _0x988abb = _0x466f2e?.["useLiveOffers"] !== ![];
  return (
    '\n        <label class="opt-variance-toggle" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer">\n            <input type="checkbox" class="mm-live-toggle" ' +
    (_0x988abb ? "checked" : "") +
    '>\n            <span>Use <b>live offers</b> snapshot\n                <span class="mm-pct-hint">(' +
    _0x1c1738 +
    (_0x2f8bfa != null ? " · " + _0x2f8bfa + "h ago" : "") +
    " · " +
    _0x490504 +
    " items · " +
    _0x304616 +
    " offers)</span>\n            </span>\n        </label>"
  );
}
function _mmDoRollSearch(_0xb38e07, _0x58019d) {
  const _0x3d0f58 = ["gun", "helmet", "chest", "pant", "glove", "boot"],
    _0x3bb130 = _0x58019d["marketPrices"]["scrapPrice"],
    _0x7035d6 = !!(
      _0x58019d["useLiveOffers"] && window["_LIVE_OFFERS"]?.["items"]
    ),
    _0x10d4f0 = _0x7035d6 ? "live" : "snapshot",
    _0x32968b = {};
  for (const _0x520550 of _0x3d0f58) {
    const _0x5516e2 = _0xb38e07["gear"][_0x520550],
      _0x19ab28 = _0x5516e2["type"];
    if (_0x19ab28 === "none") {
      _0x32968b[_0x520550] = [
        {
          type: "none",
          buyPrice: 0x0,
          price: 0x0,
          n: 0x0,
          _none: !![],
          ...Object["fromEntries"](
            MM_SLOT_STATS[_0x520550]["map"]((_0x5096dd) => [_0x5096dd, 0x0]),
          ),
        },
      ];
      continue;
    }
    const _0x160182 = MM_TIER_TO_CODE[_0x520550]?.[_0x19ab28],
      _0x53d53c = _0x7035d6
        ? window["_LIVE_OFFERS"]["items"][_0x160182]
        : _gearSnapshot["items"]?.[_0x160182],
      _0x2efa7a = _0x53d53c?.["priceByRoll"] || [],
      _0x4c452a = OPT["GEAR_TIER_ORDER"] ? 0x0 : 0x0,
      _0x188d2e =
        {
          none: 0x0,
          basic: 0x2,
          green: 0x6,
          blue: 0x12,
          purple: 0x36,
          gold: 0xa2,
        }[_0x19ab28] || 0x0;
    if (!_0x2efa7a["length"]) {
      _0x32968b[_0x520550] = [
        {
          type: _0x19ab28,
          buyPrice: _0x5516e2["buyPrice"],
          price: _0x5516e2["price"],
          n: 0x0,
          _fallback: !![],
          _source: _0x10d4f0,
          ...Object["fromEntries"](
            MM_SLOT_STATS[_0x520550]["map"]((_0x54790b) => [
              _0x54790b,
              _0x5516e2[_0x54790b],
            ]),
          ),
        },
      ];
      continue;
    }
    const _0x58caf7 = _0x2efa7a["slice"]()["sort"](
        (_0x3ff3e2, _0x48a432) => _0x48a432["n"] - _0x3ff3e2["n"],
      ),
      _0x5079df = _0x7035d6 ? 0x1 : 0x2,
      _0x50dd89 = _0x58caf7["filter"](
        (_0x40f009) => _0x40f009["n"] >= _0x5079df,
      ),
      _0x3bd82b = (
        _0x50dd89["length"] >= MM_TOP_K_VARIANTS ? _0x50dd89 : _0x58caf7
      )["slice"](0x0, MM_TOP_K_VARIANTS);
    _0x32968b[_0x520550] = _0x3bd82b["map"]((_0xc3e108) => {
      const _0x14fdab = {
        type: _0x19ab28,
        n: _0xc3e108["n"],
        _source: _0x10d4f0,
        _offerId: _0xc3e108["sampleOfferId"] || null,
      };
      for (const [_0x403125, _0x50ae3f] of Object["entries"](
        MM_STAT_NAME_MAP,
      )) {
        _0xc3e108["skills"][_0x403125] != null &&
          MM_SLOT_STATS[_0x520550]["includes"](_0x50ae3f) &&
          (_0x14fdab[_0x50ae3f] = _0xc3e108["skills"][_0x403125]);
      }
      let _0x374c26;
      return (
        _0x7035d6
          ? (_0x374c26 =
              _0xc3e108["minPrice"] != null
                ? _0xc3e108["minPrice"]
                : _0xc3e108["p10Price"] != null
                  ? _0xc3e108["p10Price"]
                  : (_0xc3e108["p50Price"] ??
                    _0x53d53c["price"]?.["p50"] ??
                    _0x5516e2["buyPrice"]))
          : (_0x374c26 =
              _0xc3e108["p10Price"] != null
                ? _0xc3e108["p10Price"]
                : _0xc3e108["minPrice"] != null
                  ? _0xc3e108["minPrice"]
                  : (_0xc3e108["p50Price"] ??
                    _0x53d53c["price"]?.["p50"] ??
                    _0x5516e2["buyPrice"])),
        (_0x14fdab["buyPrice"] = _0x374c26),
        (_0x14fdab["price"] = _0x374c26 - _0x188d2e * _0x3bb130),
        _0x14fdab
      );
    });
  }
  const _0x55c266 = OPT["buildFood"](_0x58019d["marketPrices"]),
    _0x195808 = _0x55c266[_0x58019d["foodType"]] ?? _0x55c266["fish"],
    _0x5c4a49 = _0xb38e07["skills"],
    _0x3751a0 = {},
    _0x28ae51 = _0x58019d["objective"] ?? "maxDmg",
    _0x5ee9af =
      _0x28ae51 === "minSpent"
        ? (_0x506bf6, _0x46ef1a) => _0x506bf6["spent"] < _0x46ef1a["spent"]
        : (_0x42e3b1, _0x2303b6) => _0x42e3b1["dmg"] > _0x2303b6["dmg"];
  let _0xa50f0a = null,
    _0x35bbf2 = 0x0,
    _0x159668 = 0x0;
  for (const _0x3190e5 of _0x32968b["gun"])
    for (const _0x32d85c of _0x32968b["helmet"])
      for (const _0x3a605d of _0x32968b["chest"])
        for (const _0x4c3d3c of _0x32968b["pant"])
          for (const _0x4c57ef of _0x32968b["glove"])
            for (const _0x1be69e of _0x32968b["boot"]) {
              const _0x4d1c8a = {
                gun: _0x3190e5,
                helmet: _0x32d85c,
                chest: _0x3a605d,
                pant: _0x4c3d3c,
                glove: _0x4c57ef,
                boot: _0x1be69e,
              };
              OPT["writeAttributes"](_0x5c4a49, _0x4d1c8a, _0x3751a0);
              const _0x546eac = OPT["evalBuild"](
                _0x3751a0,
                _0x4d1c8a,
                _0x58019d,
                _0x195808,
              );
              _0x35bbf2++;
              if (_0x546eac["spent"] > _0x58019d["spentLimit"] + 0.000001) {
                _0x159668++;
                continue;
              }
              (!_0xa50f0a || _0x5ee9af(_0x546eac, _0xa50f0a["result"])) &&
                (_0xa50f0a = { gear: _0x4d1c8a, result: _0x546eac });
            }
  return {
    best: _0xa50f0a,
    evaluated: _0x35bbf2,
    infeasibleSkipped: _0x159668,
    variants: _0x32968b,
  };
}
function _mmRenderRollSearchResult(_0x5278ec, _0x313662, _0x47e07f, _0x1b6875) {
  if (!_0x313662["best"])
    return (
      '<div class="opt-variance-error" style="margin-top:10px">\n            No roll combination fit under the spent limit (' +
      _0x47e07f["spentLimit"]["toFixed"](0x2) +
      ").\n            Evaluated " +
      _0x313662["evaluated"]["toLocaleString"]() +
      " combinations · " +
      _0x313662["infeasibleSkipped"] +
      " infeasible.\n        </div>"
    );
  const _0x296696 = _0x313662["best"],
    _0x245c5c = ["gun", "helmet", "chest", "pant", "glove", "boot"],
    _0xbc1c00 = {
      gun: "Gun",
      helmet: "Helmet",
      chest: "Chest",
      pant: "Pants",
      glove: "Gloves",
      boot: "Boots",
    },
    _0x26cfeb = _0x296696["result"]["dmg"] - _0x5278ec["dmg"],
    _0x20c7b6 = ((_0x26cfeb / _0x5278ec["dmg"]) * 0x64)["toFixed"](0x1),
    _0x1421e6 = -_0x296696["result"]["spent"] - -_0x5278ec["spent"],
    _0x18ded0 = _0x26cfeb >= 0x0 ? "+" : "",
    _0x46e851 = _0x245c5c["reduce"](
      (_0x4516b7, _0x64b8cd) =>
        _0x4516b7 + (_0x5278ec["gear"][_0x64b8cd]?.["buyPrice"] || 0x0),
      0x0,
    ),
    _0x343150 = _0x245c5c["reduce"](
      (_0x78b9f5, _0x5dd75e) =>
        _0x78b9f5 + (_0x296696["gear"][_0x5dd75e]?.["buyPrice"] || 0x0),
      0x0,
    ),
    _0x48e5b6 = _0x343150 - _0x46e851,
    _0x56dadf = _0x245c5c["map"]((_0x239127) => {
      const _0x45e55e = _0x296696["gear"][_0x239127];
      if (_0x45e55e["_none"] || _0x45e55e["type"] === "none")
        return (
          "<tr><td>" +
          _0xbc1c00[_0x239127] +
          "</td><td>—</td><td>(no item)</td><td>—</td></tr>"
        );
      const _0x4ec11c = MM_SLOT_STATS[_0x239127]["map"](
          (_0x58fb73) =>
            _0x58fb73 +
            ": " +
            (_0x45e55e[_0x58fb73]?.["toFixed"]?.(0x0) ?? _0x45e55e[_0x58fb73]),
        )["join"](", "),
        _0x4b99a9 = _0x45e55e["n"] != null ? _0x45e55e["n"] : "?",
        _0xdd02cc = _0x45e55e["_offerId"]
          ? ' <span style="color:#6b8afd">· offer ' +
            String(_0x45e55e["_offerId"])["slice"](0x0, 0x8) +
            "…</span>"
          : "";
      return (
        "<tr>\n            <td>" +
        _0xbc1c00[_0x239127] +
        '</td>\n            <td><span class="opt-tier ' +
        _0x45e55e["type"] +
        '">' +
        _0x45e55e["type"] +
        "</span></td>\n            <td>" +
        _0x4ec11c +
        (_0x45e55e["_fallback"]
          ? ' <span style="color:#eab308">(no roll data — fallback)</span>'
          : ' <span style="color:#6b6f80">(n=' + _0x4b99a9 + ")</span>") +
        _0xdd02cc +
        "</td>\n            <td>$" +
        _0x45e55e["buyPrice"]["toFixed"](0x2) +
        "</td>\n        </tr>"
      );
    })["join"](""),
    _0x1945d5 = _0x47e07f["useLiveOffers"]
      ? '<b style="color:#22c55e">LIVE offers snapshot</b>'
      : "<b>historical sales (p10)</b>",
    _0x2da262 = _0x26cfeb >= 0x0 ? "#22c55e" : "#ef4444",
    _0xf794bf = _0x48e5b6 >= 0x0 ? "#eab308" : "#22c55e",
    _0x21a875 = -_0x296696["result"]["spent"] >= 0x0 ? "#22c55e" : "#ef4444";
  return (
    '\n        <div class="opt-variance-stat-out js-export-area" style="margin-top:12px">\n            <h4>Best rolls — locked to chosen tiers + skills</h4>\n            <div class="opt-variance-band">\n                <span>Damage</span><b>' +
    Math["round"](_0x296696["result"]["dmg"])["toLocaleString"]() +
    '\n                    <span style="color:' +
    _0x2da262 +
    ';font-weight:500">(' +
    _0x18ded0 +
    _0x20c7b6 +
    "% vs default — " +
    Math["round"](_0x26cfeb)["toLocaleString"]() +
    ' dmg)</span></b>\n                <span>Net / day</span><b style="color:' +
    _0x21a875 +
    '">' +
    ((-_0x296696["result"]["spent"] >= 0x0 ? "+$" : "-$") +
      Math["abs"](-_0x296696["result"]["spent"])["toFixed"](0x2)) +
    '\n                    <span class="pct" style="color:#8b8fa3;font-weight:500">(was ' +
    ((-_0x5278ec["spent"] >= 0x0 ? "+$" : "-$") +
      Math["abs"](-_0x5278ec["spent"])["toFixed"](0x2)) +
    ")</span></b>\n                <span>Turnover / day</span><b>$" +
    _0x296696["result"]["profit"]["toFixed"](0x2) +
    "</b>\n                <span>Gear cost</span><b>$" +
    _0x343150["toFixed"](0x2) +
    '\n                    <span style="color:' +
    _0xf794bf +
    ';font-weight:500">(' +
    (_0x48e5b6 >= 0x0 ? "+" : "") +
    "$" +
    _0x48e5b6["toFixed"](0x2) +
    " vs default)</span></b>\n                <span>Searched</span><b>" +
    _0x313662["evaluated"]["toLocaleString"]() +
    " roll combos in " +
    _0x1b6875 +
    ' ms</b>\n            </div>\n            <div class="opt-section-title" style="margin-top:12px">Roll targets — what to shop for</div>\n            ' +
    _mmConsumablesBox(
      _0x47e07f["foodType"],
      _0x47e07f["usePill"],
      _0x296696["gear"]["gun"]["type"],
    ) +
    '\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats / sample count</th><th>Target buy ≤</th></tr></thead>\n                <tbody>' +
    _0x56dadf +
    '</tbody>\n            </table>\n            <div class="mm-pct-hint" style="margin-top:10px">\n                Buy each piece with stats <b>at or above</b> the values shown, for <b>up to</b> the listed price.\n                Price source: ' +
    _0x1945d5 +
    "." +
    (_0x47e07f["useLiveOffers"]
      ? " Each row may show a sample <code>offer …</code> — that's a specific live listing currently on warera's market."
      : " Prices are the <b>p10</b> (10th-percentile) sale price per roll — cheap end of the historical market, not the current floor.") +
    '\n            </div>\n            <button type="button" class="export-img-btn" data-export-kind="rolls">📷 Export image</button>\n        </div>'
  );
}
function _exportFilename(_0x4a4abe) {
  const _0x1c0677 =
      typeof state.lastAnalysis !== "undefined" &&
      state.lastAnalysis &&
      state.lastAnalysis["user"] &&
      state.lastAnalysis["user"]["username"]
        ? String(state.lastAnalysis["user"]["username"])["replace"](/[^\w-]/g, "")
        : "build",
    _0x4aed77 = new Date(),
    _0x132cf9 = (_0x35b3a4) => String(_0x35b3a4)["padStart"](0x2, "0"),
    _0x365b93 =
      "" +
      _0x4aed77["getFullYear"]() +
      _0x132cf9(_0x4aed77["getMonth"]() + 0x1) +
      _0x132cf9(_0x4aed77["getDate"]()) +
      "-" +
      _0x132cf9(_0x4aed77["getHours"]()) +
      _0x132cf9(_0x4aed77["getMinutes"]());
  return "warera-" + _0x4a4abe + "-" + _0x1c0677 + "-" + _0x365b93 + ".png";
}
function _onExportClick(_0x5b7cdf) {
  const _0x54e7a1 = _0x5b7cdf["target"];
  if (!(_0x54e7a1 instanceof Element)) return;
  const _0x5866cf = _0x54e7a1["closest"](".export-img-btn");
  if (!_0x5866cf) return;
  const _0xf4cd23 = _0x5866cf["closest"](".js-export-area");
  if (!_0xf4cd23) return;
  if (typeof html2canvas !== "function") {
    alert(
      "Image export library failed to load — needs an internet connection. Try again once online.",
    );
    return;
  }
  const _0x23cf54 = _0x5866cf["dataset"]["exportKind"] || "export",
    _0x2225db = _0x5866cf["textContent"];
  ((_0x5866cf["disabled"] = !![]),
    (_0x5866cf["textContent"] = "📷 Rendering…"),
    html2canvas(_0xf4cd23, {
      backgroundColor: "#1a1d27",
      scale: 0x2,
      logging: ![],
      ignoreElements: (_0x8ad011) =>
        _0x8ad011["classList"] &&
        _0x8ad011["classList"]["contains"]("export-img-btn"),
    })
      ["then"]((_0x54785f) => {
        _0x54785f["toBlob"]((_0x12db35) => {
          if (!_0x12db35) throw new Error("canvas.toBlob returned null");
          const _0x8e4765 = document["createElement"]("a");
          ((_0x8e4765["href"] = URL["createObjectURL"](_0x12db35)),
            (_0x8e4765["download"] = _exportFilename(_0x23cf54)),
            document["body"]["appendChild"](_0x8e4765),
            _0x8e4765["click"](),
            setTimeout(() => {
              (URL["revokeObjectURL"](_0x8e4765["href"]),
                _0x8e4765["remove"]());
            }, 0x3e8),
            (_0x5866cf["disabled"] = ![]),
            (_0x5866cf["textContent"] = _0x2225db));
        }, "image/png");
      })
      ["catch"]((_0x5b88d0) => {
        (console["error"]("Image export failed", _0x5b88d0),
          (_0x5866cf["disabled"] = ![]),
          (_0x5866cf["textContent"] = _0x2225db),
          alert(
            "Image export failed: " +
              ((_0x5b88d0 && _0x5b88d0["message"]) || _0x5b88d0),
          ));
      }));
}
document["addEventListener"]("click", _onExportClick);
function runMinMaxBreakEven(
  _0x48852b,
  _0x54a7b0,
  _0x302811,
  _0x49073b,
  _0x4001f6,
) {
  if (!_gearSnapshot || !_minMaxConfig) return;
  const _0xfb95c0 = _minMaxConfig;
  ((_0x49073b["disabled"] = !![]),
    (_0x49073b["textContent"] = "Computing break-even gear…"),
    (_0x4001f6["innerHTML"] =
      '\n        <div class="opt-be-card">\n            <div class="opt-progress-wrap">\n                <div class="opt-progress-label" id="mmBeProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="mmBeProgressBar" style="width:0%"></div></div>\n            </div>\n        </div>'));
  const _0x717f9b = {
      basic: !![],
      green: !![],
      blue: !![],
      purple: !![],
      gold: !![],
    },
    _0x480e1e = !!(_0xfb95c0["useLive"] && _hasLiveOffers()),
    _0x4a07a3 = _0x480e1e ? window["_LIVE_OFFERS"] : _gearSnapshot,
    _0x1059e7 = _0x480e1e ? _gearSnapshot : null,
    { overrides: _0x512dae } = buildMinMaxOverrides(
      _0x4a07a3,
      _0xfb95c0["percentile"],
      _0x717f9b,
      _0x1059e7,
    ),
    _0x4a0d6d = {
      ..._0x54a7b0,
      fixedSkills: _0x302811["skills"],
      spentLimitOverride: 0x0,
      gearTiersOverride: _0x717f9b,
      foodTypeOverride: "meat",
      gearOverrides: _0x512dae,
      useLiveOffers: _0x480e1e,
      _gearOverridesKey:
        (_0x480e1e ? "live|" : "") +
        "p" +
        _0xfb95c0["percentile"] +
        "|warEco|be",
    },
    _0x449348 = _buildCacheKey(_0x48852b, _0x4a0d6d);
  if (_buildCache["has"](_0x449348)) {
    (renderMinMaxBreakEvenResult(
      _0x4001f6,
      _0x302811,
      _buildCache["get"](_0x449348),
      _0x4a0d6d,
      _0x48852b,
    ),
      (_0x49073b["disabled"] = ![]),
      (_0x49073b["textContent"] = "Re-run break-even"));
    return;
  }
  const _0x565309 = ++_optRunId;
  _terminateOptWorker();
  const _0x4c10ef = _ensureOptWorker(),
    _0x52da88 = Date["now"]();
  ((_0x4c10ef["onmessage"] = (_0x1959db) => {
    const _0xac3cf1 = _0x1959db["data"];
    if (_0xac3cf1["runId"] !== _0x565309) return;
    if (_0xac3cf1["type"] === "progress") {
      const _0x422009 = Math["round"](
          (_0xac3cf1["g"] / _0xac3cf1["total"]) * 0x64,
        ),
        _0x4ea18a = document["getElementById"]("mmBeProgressBar"),
        _0x37ce35 = document["getElementById"]("mmBeProgressLabel");
      if (_0x4ea18a) _0x4ea18a["style"]["width"] = _0x422009 + "%";
      if (_0x37ce35)
        _0x37ce35["textContent"] =
          "Searching gear " +
          _0xac3cf1["g"] +
          "/" +
          _0xac3cf1["total"] +
          " · " +
          ((Date["now"]() - _0x52da88) / 0x3e8)["toFixed"](0x1) +
          "s";
    } else
      _0xac3cf1["type"] === "result" &&
        (_buildCache["set"](_0x449348, _0xac3cf1["result"]),
        renderMinMaxBreakEvenResult(
          _0x4001f6,
          _0x302811,
          _0xac3cf1["result"],
          _0x4a0d6d,
          _0x48852b,
        ),
        (_0x49073b["disabled"] = ![]),
        (_0x49073b["textContent"] = "Re-run break-even"));
  }),
    _0x4c10ef["postMessage"]({
      runId: _0x565309,
      presetName: _0x48852b,
      userData: _0x4a0d6d,
    }));
}
function renderMinMaxBreakEvenResult(
  _0x4cbb38,
  _0x1f78e2,
  _0x1fa55c,
  _0x11233e,
  _0xc4d0c8,
) {
  const _0x23b36f = _minMaxConfig,
    _0x492b4b = _0x1fa55c["bestBuild"];
  if (!_0x492b4b) {
    _0x4cbb38["innerHTML"] =
      '\n            <div class="opt-be-card">\n                <div class="opt-be-title">Break-even gear (same skills) @ p' +
      _0x23b36f["percentile"] +
      '</div>\n                <div class="build-loading">No gear in any tier can break even with these skills — the build is fundamentally over-budget at $0 net.</div>\n            </div>';
    return;
  }
  const _0x92384a = _0x492b4b["dmg"] - _0x1f78e2["dmg"],
    _0x4c1185 = (_0x492b4b["dmg"] / _0x1f78e2["dmg"]) * 0x64 - 0x64,
    _0x555a34 = (_0x1265b7) =>
      (_0x1265b7 >= 0x0 ? "+$" : "-$") + Math["abs"](_0x1265b7)["toFixed"](0x2),
    _0x40b712 = {
      gun: "Gun",
      helmet: "Helmet",
      chest: "Chest",
      pant: "Pants",
      glove: "Gloves",
      boot: "Boots",
    },
    _0x2a4747 = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      ["map"]((_0x7bfca9) => {
        const _0x5df338 = _0x492b4b["gear"][_0x7bfca9],
          _0xae2eb3 = _0x1f78e2["gear"][_0x7bfca9],
          _0x3299aa = _0x5df338["type"] !== _0xae2eb3["type"],
          _0x405afe = _0x5df338["type"],
          _0x477de5 = MM_TIER_TO_CODE[_0x7bfca9]?.[_0x405afe],
          _0x2215c7 = MM_SLOT_STATS[_0x7bfca9]["map"](
            (_0x74558b) =>
              _0x74558b + ": " + (_0x5df338[_0x74558b] ?? 0x0)["toFixed"](0x1),
          )["join"](", "),
          _0x642ff8 = _0x477de5 ? _gearSnapshot?.["items"]?.[_0x477de5] : null;
        let _0x2246d3 = "";
        if (_0x642ff8 && _0x642ff8["n"]) {
          const _0x3b9bfe = _0x642ff8["price"] || {},
            _0x35f529 = _0x642ff8["n"] < 0x14,
            _0xd2e3f2 = _0x35f529
              ? ' <span class="mm-noisy">(thin · n=' +
                _0x642ff8["n"] +
                ")</span>"
              : " (n=" + _0x642ff8["n"] + ")";
          _0x2246d3 =
            '<div class="mm-market-cell">market: <b>$' +
            _0x5df338["buyPrice"]["toFixed"](0x2) +
            "</b> @ p" +
            _0x23b36f["percentile"] +
            "\n                · range $" +
            (_0x3b9bfe["min"]?.["toFixed"](0x2) ?? "—") +
            "–$" +
            (_0x3b9bfe["max"]?.["toFixed"](0x2) ?? "—") +
            " · " +
            _0x477de5 +
            _0xd2e3f2 +
            "</div>";
        }
        return (
          "<tr" +
          (_0x3299aa ? ' class="opt-be-changed"' : "") +
          '>\n            <td style="text-transform:capitalize">' +
          (_0x40b712[_0x7bfca9] || _0x7bfca9) +
          '</td>\n            <td><span class="opt-tier ' +
          _0x405afe +
          '">' +
          _0x405afe +
          "</span>" +
          (_0x3299aa
            ? ' <span class="opt-be-was">was ' + _0xae2eb3["type"] + "</span>"
            : "") +
          "</td>\n            <td>" +
          _0x2215c7 +
          _0x2246d3 +
          "</td>\n            <td>$" +
          _0x5df338["buyPrice"]["toFixed"](0x2) +
          "</td>\n        </tr>"
        );
      })
      ["join"](""),
    _0x1b8394 = OPT["buildPresetParams"](_0xc4d0c8, _0x11233e);
  _0x4cbb38["innerHTML"] =
    '\n        <div class="opt-be-card">\n            <div class="opt-be-title">Break-even gear · same skills, net $0/day @ p' +
    _0x23b36f["percentile"] +
    ' rolls</div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Damage</div>\n                    <div class="opt-stat-value">' +
    _0x492b4b["dmg"]["toLocaleString"](undefined, {
      maximumFractionDigits: 0x0,
    }) +
    '</div>\n                    <div class="opt-stat-sub ' +
    (_0x92384a >= 0x0 ? "positive" : "negative") +
    '">' +
    (_0x92384a >= 0x0 ? "+" : "") +
    Math["round"](_0x92384a)["toLocaleString"]() +
    " (" +
    (_0x4c1185 >= 0x0 ? "+" : "") +
    _0x4c1185["toFixed"](0x1) +
    '%)</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Net / day</div>\n                    <div class="opt-stat-value ' +
    (-_0x492b4b["spent"] >= 0x0 ? "positive" : "negative") +
    '">' +
    _0x555a34(-_0x492b4b["spent"]) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost / day</div>\n                    <div class="opt-stat-value">$' +
    _0x492b4b["cost"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    _0x492b4b["startingCost"]["toFixed"](0x2) +
    "</div>\n                </div>\n            </div>\n            " +
    _mmConsumablesBox(
      _0x1b8394["foodType"],
      _0x1b8394["usePill"],
      _0x492b4b["gear"]["gun"]["type"],
    ) +
    '\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats / market info</th><th>Buy @ p' +
    _0x23b36f["percentile"] +
    "</th></tr></thead>\n                <tbody>" +
    _0x2a4747 +
    '</tbody>\n            </table>\n\n            <details class="opt-variance" id="mmBeRollSearch" style="margin-top:14px">\n                <summary class="mm-roll-summary">CLICK HERE: Find best rolls within these tiers (~10–20s)</summary>\n                <div class="opt-variance-body">\n                    <div class="opt-variance-intro">\n                        Locks the break-even tier picks and skill points, then brute-forces every roll combination within those tiers under the $0 net budget.\n                    </div>\n                    ' +
    _mmLiveToggleMarkup(_0x11233e) +
    '\n                    <button type="button" class="opt-be-btn" id="mmBeRunRollSearchBtn">Run roll search →</button>\n                    <div id="mmBeRollSearchResult"></div>\n                </div>\n            </details>\n        </div>';
  const _0x3017dd = document["getElementById"]("mmBeRunRollSearchBtn"),
    _0x48c0d1 = document["getElementById"]("mmBeRollSearchResult");
  if (_0x3017dd)
    _0x3017dd["addEventListener"]("click", () =>
      runMinMaxRollSearch(
        _0xc4d0c8,
        _0x11233e,
        _0x492b4b,
        _0x1b8394,
        _0x3017dd,
        _0x48c0d1,
      ),
    );
}
function runMinMaxPillDebuff() {
  const _0x57bdd1 = $("buildPanel"),
    _0x403cc2 = _minMaxConfig,
    _0xb099d7 = extractPlayerSkills(state.lastAnalysis["user"]),
    _0x33387e = buildOptimizerUserData(state.lastAnalysis),
    _0x600152 = {
      basic: !![],
      green: !![],
      blue: !![],
      purple: !![],
      gold: !![],
    },
    _0x578d7b = !!(_0x403cc2["useLive"] && _hasLiveOffers()),
    _0x131cb1 = _0x578d7b ? window["_LIVE_OFFERS"] : _gearSnapshot,
    _0x82e2e5 = _0x578d7b ? _gearSnapshot : null,
    { overrides: _0x5d1d20, missing: _0x4607bc } = buildMinMaxOverrides(
      _0x131cb1,
      _0x403cc2["percentile"],
      _0x600152,
      _0x82e2e5,
    ),
    _0x5e1cbf = {
      ..._0x33387e,
      lvl: _0x403cc2["lvl"],
      fixedSkills: _0xb099d7,
      bountyOverride: _0x403cc2["bounty"],
      usePillOverride: ![],
      hoursOverride: _0x403cc2["hours"],
      dmgMultiplierOverride: 0x1 - PILL_DEBUFF_DMG_PENALTY_PCT / 0x64,
      excludeDailyIncomeOverride: !![],
      excludeItemLootOverride: !![],
      objectiveOverride: "minSpent",
      gearTiersOverride: {
        none: !![],
        basic: !![],
        green: !![],
        blue: !![],
        purple: !![],
        gold: !![],
      },
      spentLimitOverride: 0x3b9aca00,
      gearOverrides: _0x5d1d20,
      useLiveOffers: _0x578d7b,
      _gearOverridesKey:
        (_0x578d7b ? "live|" : "") +
        "p" +
        _0x403cc2["percentile"] +
        "|pillDebuff",
    },
    _0x1d7a22 = _0x578d7b ? " · LIVE" : "",
    _0x2d9468 =
      "🎯 Min-Max · Pill Debuff · p" +
      _0x403cc2["percentile"] +
      " · " +
      _0x403cc2["hours"] +
      "h · bounty $" +
      _0x403cc2["bounty"]["toFixed"](0x2) +
      "/1k" +
      _0x1d7a22;
  ((_0x57bdd1["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>' +
    _0x2d9468 +
    '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n            ' +
    (_0x4607bc["length"]
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-top:10px">⚠ Thin samples for ' +
        _0x4607bc["length"] +
        " (slot, tier) — those tiers fall back to listed reference values.</div>"
      : "") +
    "\n        </div>"),
    document["getElementById"]("optCancelBtn")["addEventListener"](
      "click",
      () => {
        _terminateOptWorker();
        const _0x26bf96 = document["getElementById"]("optProgressLabel");
        if (_0x26bf96) _0x26bf96["textContent"] = "Cancelled.";
      },
    ));
  const _0x42e8a3 = [
      { label: "bread", foodTypeOverride: "bread" },
      { label: "no food", foodTypeOverride: "none" },
    ],
    _0x4394b7 = [],
    _0x4195fa = Date["now"](),
    _0x556eea = (_0x3e3b5b) => {
      if (_0x3e3b5b >= _0x42e8a3["length"]) {
        (_0x4394b7["sort"](
          (_0x2f6e61, _0x39e6f3) =>
            (_0x2f6e61["result"]["bestBuild"]?.["spent"] ?? Infinity) -
            (_0x39e6f3["result"]["bestBuild"]?.["spent"] ?? Infinity),
        ),
          renderMinMaxPillDebuffResult(_0x4394b7, _0x2d9468, _0x4607bc));
        return;
      }
      const _0x299748 = _0x42e8a3[_0x3e3b5b],
        _0x25e2bb = {
          ..._0x5e1cbf,
          foodTypeOverride: _0x299748["foodTypeOverride"],
        },
        _0x5593ed = _buildCacheKey("sustainable", _0x25e2bb);
      if (_buildCache["has"](_0x5593ed))
        return (
          _0x4394b7["push"]({
            label: _0x299748["label"],
            foodType: _0x299748["foodTypeOverride"],
            result: _buildCache["get"](_0x5593ed),
            userData: _0x25e2bb,
          }),
          _0x556eea(_0x3e3b5b + 0x1)
        );
      const _0x40c5c8 = ++_optRunId;
      _terminateOptWorker();
      const _0x228c51 = _ensureOptWorker();
      ((_0x228c51["onmessage"] = (_0x437117) => {
        const _0x1ba04c = _0x437117["data"];
        if (_0x1ba04c["runId"] !== _0x40c5c8) return;
        if (_0x1ba04c["type"] === "progress") {
          const _0x1d0fe1 = Math["round"](
              (_0x1ba04c["g"] / _0x1ba04c["total"]) * 0x64,
            ),
            _0x2a80ec = document["getElementById"]("optProgressBar"),
            _0x5a5847 = document["getElementById"]("optProgressLabel");
          if (_0x2a80ec) _0x2a80ec["style"]["width"] = _0x1d0fe1 + "%";
          if (_0x5a5847)
            _0x5a5847["textContent"] =
              _0x299748["label"] +
              ": gear " +
              _0x1ba04c["g"] +
              "/" +
              _0x1ba04c["total"] +
              " · " +
              ((Date["now"]() - _0x4195fa) / 0x3e8)["toFixed"](0x1) +
              "s";
        } else
          _0x1ba04c["type"] === "result" &&
            (_buildCache["set"](_0x5593ed, _0x1ba04c["result"]),
            _0x4394b7["push"]({
              label: _0x299748["label"],
              foodType: _0x299748["foodTypeOverride"],
              result: _0x1ba04c["result"],
              userData: _0x25e2bb,
            }),
            _0x556eea(_0x3e3b5b + 0x1));
      }),
        _0x228c51["postMessage"]({
          runId: _0x40c5c8,
          presetName: "sustainable",
          userData: _0x25e2bb,
        }));
    };
  _0x556eea(0x0);
}
function renderMinMaxPillDebuffResult(_0x27eecc, _0x5ddde2, _0x4f53d1) {
  const _0xf75d7a = $("buildPanel"),
    _0x4f3521 = _minMaxConfig,
    _0x23b5bb = _0x27eecc[0x0],
    _0xf2e501 = _0x23b5bb?.["result"]?.["bestBuild"];
  if (!_0xf2e501) {
    _0xf75d7a["innerHTML"] =
      '<div class="build-panel"><h3>' +
      _0x5ddde2 +
      '</h3>\n            <div class="build-loading">No feasible build for either food choice at p' +
      _0x4f3521["percentile"] +
      ".\n            Try a lower roll target, lower bounty, or higher hours.</div></div>";
    return;
  }
  const _0x36acd0 = (_0x3922f8) =>
      (_0x3922f8 >= 0x0 ? "+$" : "-$") + Math["abs"](_0x3922f8)["toFixed"](0x2),
    _0x1c1e02 = {
      gun: "Gun",
      helmet: "Helmet",
      chest: "Chest",
      pant: "Pants",
      glove: "Gloves",
      boot: "Boots",
    },
    _0x403108 = _0x27eecc["map"]((_0x35f1b1) => {
      const _0x149c0b = _0x35f1b1["result"]["bestBuild"],
        _0x5c4dac = _0x35f1b1 === _0x23b5bb,
        _0x188a62 = _0x5c4dac
          ? '<span class="opt-pd-winner">winner</span>'
          : "",
        _0x1b33c1 = _0x149c0b ? _0x36acd0(-_0x149c0b["spent"]) : "—",
        _0x3eaf4f = _0x149c0b
          ? _0x149c0b["dmg"]["toLocaleString"](undefined, {
              maximumFractionDigits: 0x0,
            })
          : "—";
      return (
        '<tr class="' +
        (_0x5c4dac ? "opt-pd-winner-row" : "") +
        '">\n            <td>' +
        _0x35f1b1["label"] +
        " " +
        _0x188a62 +
        "</td>\n            <td>" +
        _0x3eaf4f +
        "</td>\n            <td>$" +
        (_0x149c0b ? _0x149c0b["cost"]["toFixed"](0x2) : "—") +
        "</td>\n            <td>$" +
        (_0x149c0b ? _0x149c0b["profit"]["toFixed"](0x2) : "—") +
        "</td>\n            <td>" +
        _0x1b33c1 +
        "</td>\n        </tr>"
      );
    })["join"](""),
    _0x465b4d = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      ["map"]((_0x329c9f) => {
        const _0xd3ee = _0xf2e501["gear"][_0x329c9f],
          _0x4b4e4f = _0xd3ee["type"],
          _0x1424b8 = MM_TIER_TO_CODE[_0x329c9f]?.[_0x4b4e4f],
          _0x3c6bb0 = (MM_SLOT_STATS[_0x329c9f] || [])
            [
              "map"
            ]((_0x29bfbe) => _0x29bfbe + ": " + (_0xd3ee[_0x29bfbe] ?? 0x0)["toFixed"](0x1))
            ["join"](", "),
          _0x1d3ef2 = _0x1424b8 ? _gearSnapshot?.["items"]?.[_0x1424b8] : null;
        let _0x5bc423 = "";
        if (_0x1d3ef2 && _0x1d3ef2["n"]) {
          const _0x39e810 = _0x1d3ef2["price"] || {},
            _0x110086 = _0x1d3ef2["n"] < 0x14,
            _0x57dedb = _0x110086
              ? ' <span class="mm-noisy">(thin · n=' +
                _0x1d3ef2["n"] +
                ")</span>"
              : " (n=" + _0x1d3ef2["n"] + ")";
          _0x5bc423 =
            '<div class="mm-market-cell">market: <b>$' +
            _0xd3ee["buyPrice"]["toFixed"](0x2) +
            "</b> @ p" +
            _0x4f3521["percentile"] +
            "\n                · range $" +
            (_0x39e810["min"]?.["toFixed"](0x2) ?? "—") +
            "–$" +
            (_0x39e810["max"]?.["toFixed"](0x2) ?? "—") +
            " · " +
            _0x1424b8 +
            _0x57dedb +
            "</div>";
        }
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          (_0x1c1e02[_0x329c9f] || _0x329c9f) +
          '</td>\n            <td><span class="opt-tier ' +
          _0x4b4e4f +
          '">' +
          _0x4b4e4f +
          "</span></td>\n            <td>" +
          (_0x3c6bb0 || '<span style="color:#6b6f80">—</span>') +
          _0x5bc423 +
          "</td>\n            <td>$" +
          _0xd3ee["buyPrice"]["toFixed"](0x2) +
          "</td>\n        </tr>"
        );
      })
      ["join"](""),
    _0x46c4f8 = ["gun", "helmet", "chest", "pant", "glove", "boot"]["filter"](
      (_0x97e0b9) => _0xf2e501["gear"][_0x97e0b9]["type"] === "none",
    )["length"],
    _0x4657a1 =
      _0x46c4f8 > 0x0
        ? '<div class="gc-intro" style="margin-bottom:10px"><b>' +
          _0x46c4f8 +
          "</b> slot" +
          (_0x46c4f8 === 0x1 ? "" : "s") +
          " optimally <b>empty</b> during the debuff.</div>"
        : "",
    _0x4ccc41 = _0x23b5bb["userData"],
    _0x310a3a = OPT["buildPresetParams"]("sustainable", _0x4ccc41);
  _0xf75d7a["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>' +
    _0x5ddde2 +
    "</h3>\n            " +
    (_0x4f53d1["length"]
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-bottom:10px">⚠ Thin samples for ' +
        _0x4f53d1["length"] +
        " (slot, tier) — those tiers fell back to listed values.</div>"
      : "") +
    '\n            <div class="opt-section-title" style="margin-top:0">Food comparison</div>\n            <table class="opt-bd-table" style="margin-bottom:10px">\n                <thead><tr><th>Food</th><th>Damage</th><th>Cost</th><th>Profit</th><th>Net</th></tr></thead>\n                <tbody>' +
    _0x403108 +
    "</tbody>\n            </table>\n            " +
    _0x4657a1 +
    '\n            <div class="opt-section-title">Winning build: <b>' +
    _0x23b5bb["label"] +
    '</b></div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Damage (debuffed)</div>\n                    <div class="opt-stat-value">' +
    _0xf2e501["dmg"]["toLocaleString"](undefined, {
      maximumFractionDigits: 0x0,
    }) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Net / debuff</div>\n                    <div class="opt-stat-value ' +
    (-_0xf2e501["spent"] >= 0x0 ? "positive" : "negative") +
    '">' +
    _0x36acd0(-_0xf2e501["spent"]) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost</div>\n                    <div class="opt-stat-value">$' +
    _0xf2e501["cost"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Fight profit</div>\n                    <div class="opt-stat-value">$' +
    _0xf2e501["profit"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    _0xf2e501["startingCost"]["toFixed"](0x2) +
    '</div>\n                </div>\n            </div>\n\n            <div class="opt-section-title">Winning gear (real-market prices)</div>\n            ' +
    _mmConsumablesBox(
      _0x23b5bb["foodType"],
      _0x310a3a["usePill"],
      _0xf2e501["gear"]["gun"]["type"],
    ) +
    '\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats / market info</th><th>Buy @ p' +
    _0x4f3521["percentile"] +
    "</th></tr></thead>\n                <tbody>" +
    _0x465b4d +
    '</tbody>\n            </table>\n\n            <details class="opt-variance" id="mmPdRollSearch" style="margin-top:14px">\n                <summary class="mm-roll-summary">CLICK HERE: Find best rolls within these tiers (~10–20s)</summary>\n                <div class="opt-variance-body">\n                    <div class="opt-variance-intro">\n                        Locks the winning tier picks + skills, then brute-forces every roll combination within those tiers under the pill-debuff budget.\n                    </div>\n                    ' +
    _mmLiveToggleMarkup(_0x4ccc41) +
    '\n                    <button type="button" class="opt-be-btn" id="mmPdRunRollSearchBtn">Run roll search →</button>\n                    <div id="mmPdRollSearchResult"></div>\n                </div>\n            </details>\n        </div>';
  const _0x3f80f6 = document["getElementById"]("mmPdRunRollSearchBtn"),
    _0x3cd950 = document["getElementById"]("mmPdRollSearchResult");
  if (_0x3f80f6)
    _0x3f80f6["addEventListener"]("click", () =>
      runMinMaxRollSearch(
        "sustainable",
        _0x4ccc41,
        _0xf2e501,
        _0x310a3a,
        _0x3f80f6,
        _0x3cd950,
      ),
    );
}
function renderGearCheckForm() {
  const _0x5a0ec3 = $("buildPanel");
  _terminateOptWorker();
  const _0x208268 = extractPlayerSkills(state.lastAnalysis["user"]),
    _0x4f2dea = state.lastAnalysis["user"]?.["leveling"]?.["level"] || "?",
    _0x437e1d = state.lastAnalysis["user"]?.["username"] || "(loaded player)",
    _0x1da563 = SKILL_DISPLAY["map"](
      ([_0xd9d991, _0x3e0a76]) =>
        "\n        <tr><td>" +
        _0x3e0a76 +
        "</td><td>" +
        (_0x208268[_0xd9d991] ?? 0x0) +
        "</td></tr>",
    )["join"]("");
  ((_0x5a0ec3["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>Gear check · current skills</h3>\n            <div class="gc-intro">\n                Lock <b>' +
    _0x437e1d +
    "</b>'s current skill levels (lvl " +
    _0x4f2dea +
    ') and search for the\n                best gear within Sustainable\'s constraints (meat, pill on, −$15 spent limit,\n                green/blue/purple/gold tiers). Set a bounty rate to factor in $/1000 dmg.\n            </div>\n            <table class="opt-table" style="margin:8px 0">\n                <thead><tr><th>Skill</th><th>Current level</th></tr></thead>\n                <tbody>' +
    _0x1da563 +
    '</tbody>\n            </table>\n            <div class="opt-target-row" style="margin-top:14px">\n                <label for="gcBountyInput">Bounty ($ per 1000 dmg)</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="gcBountyInput" value="' +
    _gearCheck["bounty"] +
    '" step="0.01" min="0" />\n                <span class="opt-target-hint">e.g. 0.15 = $0.15/1k dmg</span>\n            </div>\n            <button type="button" class="opt-be-btn" id="gcRunBtn">Run gear simulation →</button>\n            <div id="gcResultContainer"></div>\n        </div>'),
    document["getElementById"]("gcRunBtn")["addEventListener"]("click", () => {
      const _0x51ccc0 = Number(
        document["getElementById"]("gcBountyInput")["value"],
      );
      ((_gearCheck["bounty"] =
        Number["isFinite"](_0x51ccc0) && _0x51ccc0 >= 0x0 ? _0x51ccc0 : 0x0),
        runGearCheck(_0x208268, _gearCheck["bounty"]));
    }));
}
function runGearCheck(_0x31924d, _0x2c58df) {
  const _0x2ee96a = document["getElementById"]("gcResultContainer"),
    _0x48bc32 = document["getElementById"]("gcRunBtn");
  ((_0x48bc32["disabled"] = !![]),
    (_0x48bc32["textContent"] = "Optimizing gear…"),
    (_0x2ee96a["innerHTML"] =
      '\n        <div class="opt-be-card">\n            <div class="opt-progress-wrap">\n                <div class="opt-progress-label" id="gcProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="gcProgressBar" style="width:0%"></div></div>\n            </div>\n        </div>'));
  const _0x307c09 = {
      ...buildOptimizerUserData(state.lastAnalysis),
      fixedSkills: _0x31924d,
      bountyOverride: _0x2c58df,
    },
    _0xd26855 = _buildCacheKey("sustainable", _0x307c09);
  if (_buildCache["has"](_0xd26855)) {
    (renderGearCheckResult(_0x2ee96a, _buildCache["get"](_0xd26855), _0x2c58df),
      (_0x48bc32["disabled"] = ![]),
      (_0x48bc32["textContent"] = "Re-run gear simulation"));
    return;
  }
  const _0x181d60 = ++_optRunId;
  _terminateOptWorker();
  const _0x578806 = _ensureOptWorker(),
    _0x35b391 = Date["now"]();
  ((_0x578806["onmessage"] = (_0x190ab1) => {
    const _0x2e0f1b = _0x190ab1["data"];
    if (_0x2e0f1b["runId"] !== _0x181d60) return;
    if (_0x2e0f1b["type"] === "progress") {
      const _0x1f3a95 = Math["round"](
          (_0x2e0f1b["g"] / _0x2e0f1b["total"]) * 0x64,
        ),
        _0x80622f = document["getElementById"]("gcProgressBar"),
        _0xc214e6 = document["getElementById"]("gcProgressLabel");
      if (_0x80622f) _0x80622f["style"]["width"] = _0x1f3a95 + "%";
      if (_0xc214e6)
        _0xc214e6["textContent"] =
          "Searching gear " +
          _0x2e0f1b["g"] +
          "/" +
          _0x2e0f1b["total"] +
          " · " +
          ((Date["now"]() - _0x35b391) / 0x3e8)["toFixed"](0x1) +
          "s";
    } else
      _0x2e0f1b["type"] === "result" &&
        (_buildCache["set"](_0xd26855, _0x2e0f1b["result"]),
        renderGearCheckResult(_0x2ee96a, _0x2e0f1b["result"], _0x2c58df),
        (_0x48bc32["disabled"] = ![]),
        (_0x48bc32["textContent"] = "Re-run gear simulation"));
  }),
    _0x578806["postMessage"]({
      runId: _0x181d60,
      presetName: "sustainable",
      userData: _0x307c09,
    }));
}
function renderGearCheckResult(_0x57295d, _0x4ef408, _0x1e8bbe) {
  const _0x4a6c13 = _0x4ef408["bestBuild"];
  if (!_0x4a6c13) {
    _0x57295d["innerHTML"] =
      '\n            <div class="opt-be-card">\n                <div class="opt-be-title">Gear check result</div>\n                <div class="build-loading">No feasible gear within Sustainable\'s −$15 spent budget at your current skill levels and bounty $' +
      _0x1e8bbe["toFixed"](0x2) +
      "/1k.</div>\n            </div>";
    return;
  }
  const _0x71f2f = (_0xb5849f) =>
      (_0xb5849f >= 0x0 ? "+$" : "-$") + Math["abs"](_0xb5849f)["toFixed"](0x2),
    _0x2c64e1 = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      ["map"]((_0x2ae89e) => {
        const _0x180469 = _0x4a6c13["gear"][_0x2ae89e],
          _0x1a9377 = Object["entries"](_0x180469)
            ["filter"](
              ([_0x29169f]) =>
                _0x29169f !== "type" &&
                _0x29169f !== "price" &&
                _0x29169f !== "buyPrice",
            )
            ["map"](([_0x4c9930, _0x16c517]) => _0x4c9930 + ": " + _0x16c517)
            ["join"](", ");
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          _0x2ae89e +
          '</td>\n            <td><span class="opt-tier ' +
          _0x180469["type"] +
          '">' +
          _0x180469["type"] +
          "</span></td>\n            <td>" +
          _0x1a9377 +
          "</td>\n            <td>$" +
          _0x180469["buyPrice"]["toFixed"](0x2) +
          "</td>\n        </tr>"
        );
      })
      ["join"]("");
  _0x57295d["innerHTML"] =
    '\n        <div class="opt-be-card">\n            <div class="opt-be-title">Gear check · current skills · bounty $' +
    _0x1e8bbe["toFixed"](0x2) +
    '/1k</div>\n            <div class="build-meta">Evaluated ' +
    _0x4ef408["combosEvaluated"]["toLocaleString"]() +
    " combos\n                across " +
    (_0x4ef408["gearSetsCount"] - _0x4ef408["gearSetsPruned"]) +
    "/" +
    _0x4ef408["gearSetsCount"] +
    " gear sets\n                · " +
    (_0x4ef408["elapsed"] / 0x3e8)["toFixed"](0x2) +
    's</div>\n            <div class="opt-hero">\n                <div>\n                    <div class="opt-hero-label">Damage</div>\n                    <div class="opt-hero-value">' +
    _0x4a6c13["dmg"]["toLocaleString"](undefined, {
      maximumFractionDigits: 0x0,
    }) +
    '</div>\n                </div>\n                <div style="text-align:right">\n                    <div class="opt-hero-label">Net / day</div>\n                    <div class="opt-hero-net ' +
    (-_0x4a6c13["spent"] >= 0x0 ? "positive" : "negative") +
    '">' +
    _0x71f2f(-_0x4a6c13["spent"]) +
    '</div>\n                </div>\n            </div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Turnover / day</div>\n                    <div class="opt-stat-value positive">$' +
    _0x4a6c13["profit"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost / day</div>\n                    <div class="opt-stat-value negative">$' +
    _0x4a6c13["cost"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Bounty / day</div>\n                    <div class="opt-stat-value">$' +
    _0x4a6c13["profitBreakdown"]["bounty"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    _0x4a6c13["startingCost"]["toFixed"](0x2) +
    '</div>\n                </div>\n            </div>\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats</th><th>Buy Price</th></tr></thead>\n                <tbody>' +
    _0x2c64e1 +
    "</tbody>\n            </table>\n        </div>";
}
function renderPillDebuffForm() {
  const _0x273a19 = $("buildPanel");
  _terminateOptWorker();
  const _0x518b4a = extractPlayerSkills(state.lastAnalysis["user"]),
    _0xe99c99 = state.lastAnalysis["user"]?.["leveling"]?.["level"] || "?",
    _0x3fcd62 = state.lastAnalysis["user"]?.["username"] || "(loaded player)",
    _0x5cd846 = SKILL_DISPLAY["map"](
      ([_0x400466, _0x2ac458]) =>
        "<tr><td>" +
        _0x2ac458 +
        "</td><td>" +
        (_0x518b4a[_0x400466] ?? 0x0) +
        "</td></tr>",
    )["join"]("");
  ((_0x273a19["innerHTML"] =
    '\n        <div class="build-panel">\n            <h3>Pill debuff · best gear</h3>\n            <div class="gc-intro">\n                Lock <b>' +
    _0x3fcd62 +
    "</b>'s skills (lvl " +
    _0xe99c99 +
    ') and find the most-profitable gear\n                during the 16-hour pill debuff. Defaults: pill <b>off</b>, damage <b>−60%</b>,\n                fight time <b>16 h</b>. Daily-fixed income (companies, work, daily bonus, weekly\n                cases) <b>and item loot</b> are excluded — only chests / red chests / bounty count.\n                <br><br>\n                Auto-runs <b>twice</b> (bread vs no food) and shows whichever wins.\n                "none" tier is included per slot so the optimizer can recommend skipping a piece.\n            </div>\n            <table class="opt-table" style="margin:8px 0">\n                <thead><tr><th>Skill</th><th>Current level</th></tr></thead>\n                <tbody>' +
    _0x5cd846 +
    '</tbody>\n            </table>\n            <div class="opt-target-row" style="margin-top:14px">\n                <label for="pdBountyInput">Bounty ($ per 1000 dmg)</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="pdBountyInput" value="' +
    _pillDebuff["bounty"] +
    '" step="0.01" min="0" />\n            </div>\n            <div class="opt-target-row">\n                <label for="pdHoursInput">Fight hours</label>\n                <input type="number" id="pdHoursInput" value="' +
    _pillDebuff["hours"] +
    '" step="1" min="1" max="24" />\n                <span class="opt-target-hint">debuff period (damage fixed at −60%)</span>\n            </div>\n            <button type="button" class="opt-be-btn" id="pdRunBtn">Run pill-debuff simulation →</button>\n            <div id="pdResultContainer"></div>\n        </div>'),
    document["getElementById"]("pdRunBtn")["addEventListener"]("click", () => {
      const _0x31fd7e = Number(
          document["getElementById"]("pdBountyInput")["value"],
        ),
        _0x60ce77 = Number(document["getElementById"]("pdHoursInput")["value"]);
      ((_pillDebuff["bounty"] =
        Number["isFinite"](_0x31fd7e) && _0x31fd7e >= 0x0 ? _0x31fd7e : 0x0),
        (_pillDebuff["hours"] =
          Number["isFinite"](_0x60ce77) && _0x60ce77 >= 0x1 ? _0x60ce77 : 0x10),
        runPillDebuff(_0x518b4a));
    }));
}
function runPillDebuff(_0x3052d0) {
  const _0x22705e = document["getElementById"]("pdResultContainer"),
    _0x4c9101 = document["getElementById"]("pdRunBtn");
  ((_0x4c9101["disabled"] = !![]),
    (_0x4c9101["textContent"] = "Optimizing pill-debuff gear…"),
    (_0x22705e["innerHTML"] =
      '\n        <div class="opt-be-card">\n            <div class="opt-progress-wrap">\n                <div class="opt-progress-label" id="pdProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="pdProgressBar" style="width:0%"></div></div>\n            </div>\n        </div>'));
  const _0xe25cd7 = {
      ...buildOptimizerUserData(state.lastAnalysis),
      fixedSkills: _0x3052d0,
      bountyOverride: _pillDebuff["bounty"],
      usePillOverride: ![],
      hoursOverride: _pillDebuff["hours"],
      dmgMultiplierOverride: 0x1 - PILL_DEBUFF_DMG_PENALTY_PCT / 0x64,
      excludeDailyIncomeOverride: !![],
      excludeItemLootOverride: !![],
      objectiveOverride: "minSpent",
      gearTiersOverride: {
        none: !![],
        basic: !![],
        green: !![],
        blue: !![],
        purple: !![],
        gold: !![],
      },
      spentLimitOverride: 0x3b9aca00,
    },
    _0x3acaba = [
      { label: "bread", foodTypeOverride: "bread" },
      { label: "no food", foodTypeOverride: "none" },
    ],
    _0x41cc88 = [],
    _0x5d6b09 = Date["now"](),
    _0x4e8e60 = (_0x51a5e7) => {
      if (_0x51a5e7 >= _0x3acaba["length"]) {
        (_0x41cc88["sort"](
          (_0x71d1a3, _0x35f1fe) =>
            (_0x71d1a3["result"]["bestBuild"]?.["spent"] ?? Infinity) -
            (_0x35f1fe["result"]["bestBuild"]?.["spent"] ?? Infinity),
        ),
          renderPillDebuffResult(_0x22705e, _0x41cc88),
          (_0x4c9101["disabled"] = ![]),
          (_0x4c9101["textContent"] = "Re-run pill-debuff simulation"));
        return;
      }
      const _0x1f4194 = _0x3acaba[_0x51a5e7],
        _0x1e6ead = {
          ..._0xe25cd7,
          foodTypeOverride: _0x1f4194["foodTypeOverride"],
        },
        _0x5ec7e1 = _buildCacheKey("sustainable", _0x1e6ead);
      if (_buildCache["has"](_0x5ec7e1))
        return (
          _0x41cc88["push"]({
            label: _0x1f4194["label"],
            foodType: _0x1f4194["foodTypeOverride"],
            result: _buildCache["get"](_0x5ec7e1),
          }),
          _0x4e8e60(_0x51a5e7 + 0x1)
        );
      const _0x2580e4 = ++_optRunId;
      _terminateOptWorker();
      const _0x58563f = _ensureOptWorker();
      ((_0x58563f["onmessage"] = (_0x1fc7ac) => {
        const _0x418408 = _0x1fc7ac["data"];
        if (_0x418408["runId"] !== _0x2580e4) return;
        if (_0x418408["type"] === "progress") {
          const _0x4c43e2 = Math["round"](
              (_0x418408["g"] / _0x418408["total"]) * 0x64,
            ),
            _0x28e564 = document["getElementById"]("pdProgressBar"),
            _0x2f3cd1 = document["getElementById"]("pdProgressLabel");
          if (_0x28e564) _0x28e564["style"]["width"] = _0x4c43e2 + "%";
          if (_0x2f3cd1)
            _0x2f3cd1["textContent"] =
              _0x1f4194["label"] +
              ": gear " +
              _0x418408["g"] +
              "/" +
              _0x418408["total"] +
              " · " +
              ((Date["now"]() - _0x5d6b09) / 0x3e8)["toFixed"](0x1) +
              "s";
        } else
          _0x418408["type"] === "result" &&
            (_buildCache["set"](_0x5ec7e1, _0x418408["result"]),
            _0x41cc88["push"]({
              label: _0x1f4194["label"],
              foodType: _0x1f4194["foodTypeOverride"],
              result: _0x418408["result"],
            }),
            _0x4e8e60(_0x51a5e7 + 0x1));
      }),
        _0x58563f["postMessage"]({
          runId: _0x2580e4,
          presetName: "sustainable",
          userData: _0x1e6ead,
        }));
    };
  _0x4e8e60(0x0);
}
function renderPillDebuffResult(_0x560cbf, _0x3104e1) {
  const _0x4ffc21 = _0x3104e1[0x0],
    _0xa1607d = _0x4ffc21?.["result"]?.["bestBuild"];
  if (!_0xa1607d) {
    _0x560cbf["innerHTML"] =
      '\n            <div class="opt-be-card">\n                <div class="opt-be-title">Pill debuff · no feasible gear</div>\n                <div class="build-loading">No feasible build for either food choice. Try lowering bounty or the dmg penalty.</div>\n            </div>';
    return;
  }
  const _0xe0d7e3 = (_0x229513) =>
      (_0x229513 >= 0x0 ? "+$" : "-$") + Math["abs"](_0x229513)["toFixed"](0x2),
    _0x170150 = _0x3104e1["map"]((_0x2011c2) => {
      const _0x285b97 = _0x2011c2["result"]["bestBuild"],
        _0x5ae3f1 = _0x2011c2 === _0x4ffc21,
        _0x1c9bcb = _0x5ae3f1
          ? '<span class="opt-pd-winner">winner</span>'
          : "",
        _0x5494b4 = _0x285b97 ? _0xe0d7e3(-_0x285b97["spent"]) : "—",
        _0x8e8b89 = _0x285b97
          ? _0x285b97["dmg"]["toLocaleString"](undefined, {
              maximumFractionDigits: 0x0,
            })
          : "—";
      return (
        '<tr class="' +
        (_0x5ae3f1 ? "opt-pd-winner-row" : "") +
        '">\n            <td>' +
        _0x2011c2["label"] +
        " " +
        _0x1c9bcb +
        "</td>\n            <td>" +
        _0x8e8b89 +
        "</td>\n            <td>$" +
        (_0x285b97 ? _0x285b97["cost"]["toFixed"](0x2) : "—") +
        "</td>\n            <td>$" +
        (_0x285b97 ? _0x285b97["profit"]["toFixed"](0x2) : "—") +
        "</td>\n            <td>" +
        _0x5494b4 +
        "</td>\n        </tr>"
      );
    })["join"](""),
    _0x4c603c = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      ["map"]((_0x3ac55b) => {
        const _0x3e918d = _0xa1607d["gear"][_0x3ac55b],
          _0x21c10c = Object["entries"](_0x3e918d)
            ["filter"](
              ([_0x7d79bd]) =>
                _0x7d79bd !== "type" &&
                _0x7d79bd !== "price" &&
                _0x7d79bd !== "buyPrice",
            )
            ["map"](([_0x5c346e, _0x6d6d07]) => _0x5c346e + ": " + _0x6d6d07)
            ["join"](", ");
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          _0x3ac55b +
          '</td>\n            <td><span class="opt-tier ' +
          _0x3e918d["type"] +
          '">' +
          _0x3e918d["type"] +
          "</span></td>\n            <td>" +
          (_0x21c10c || '<span style="color:#6b6f80">—</span>') +
          "</td>\n            <td>$" +
          _0x3e918d["buyPrice"]["toFixed"](0x2) +
          "</td>\n        </tr>"
        );
      })
      ["join"](""),
    _0x38e5d9 = ["gun", "helmet", "chest", "pant", "glove", "boot"]["filter"](
      (_0x1831e1) => _0xa1607d["gear"][_0x1831e1]["type"] === "none",
    )["length"],
    _0x4fde75 =
      _0x38e5d9 > 0x0
        ? '<div class="gc-intro" style="margin-bottom:10px"><b>' +
          _0x38e5d9 +
          "</b> slot" +
          (_0x38e5d9 === 0x1 ? "" : "s") +
          " optimally <b>empty</b> during the debuff.</div>"
        : "";
  _0x560cbf["innerHTML"] =
    '\n        <div class="opt-be-card">\n            <div class="opt-be-title">Pill debuff · fight-only profit · ' +
    _pillDebuff["hours"] +
    "h · −" +
    PILL_DEBUFF_DMG_PENALTY_PCT +
    '% dmg · item loot excluded</div>\n            <div class="opt-section-title" style="margin-top:0">Food comparison</div>\n            <table class="opt-bd-table" style="margin-bottom:10px">\n                <thead><tr><th>Food</th><th>Damage</th><th>Cost</th><th>Profit</th><th>Net</th></tr></thead>\n                <tbody>' +
    _0x170150 +
    "</tbody>\n            </table>\n            " +
    _0x4fde75 +
    '\n            <div class="opt-section-title">Winning build: <b>' +
    _0x4ffc21["label"] +
    '</b></div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Damage (debuffed)</div>\n                    <div class="opt-stat-value">' +
    _0xa1607d["dmg"]["toLocaleString"](undefined, {
      maximumFractionDigits: 0x0,
    }) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Net / debuff</div>\n                    <div class="opt-stat-value ' +
    (-_0xa1607d["spent"] >= 0x0 ? "positive" : "negative") +
    '">' +
    _0xe0d7e3(-_0xa1607d["spent"]) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost</div>\n                    <div class="opt-stat-value">$' +
    _0xa1607d["cost"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Fight profit</div>\n                    <div class="opt-stat-value">$' +
    _0xa1607d["profit"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    _0xa1607d["startingCost"]["toFixed"](0x2) +
    '</div>\n                </div>\n            </div>\n            <details class="opt-breakdown">\n                <summary>Turnover breakdown · $' +
    _0xa1607d["profit"]["toFixed"](0x2) +
    '/debuff (item loot excluded)</summary>\n                <table class="opt-bd-table">\n                    <tr><td>Chests (landed × loot% × case$)</td><td>$' +
    _0xa1607d["profitBreakdown"]["chests"]["toFixed"](0x2) +
    "</td></tr>\n                    <tr><td>Red chests</td><td>$" +
    _0xa1607d["profitBreakdown"]["redChests"]["toFixed"](0x2) +
    "</td></tr>\n                    <tr><td>Bounty</td><td>$" +
    _0xa1607d["profitBreakdown"]["bounty"]["toFixed"](0x2) +
    '</td></tr>\n                    <tr class="total"><td>Total</td><td>$' +
    _0xa1607d["profit"]["toFixed"](0x2) +
    '</td></tr>\n                </table>\n            </details>\n            <details class="opt-breakdown">\n                <summary>Cost breakdown · $' +
    _0xa1607d["cost"]["toFixed"](0x2) +
    '/debuff</summary>\n                <table class="opt-bd-table">\n                    <tr><td>Guns</td><td>$' +
    _0xa1607d["costBreakdown"]["guns"]["toFixed"](0x2) +
    "</td></tr>\n                    <tr><td>Equipment</td><td>$" +
    _0xa1607d["costBreakdown"]["equipment"]["toFixed"](0x2) +
    "</td></tr>\n                    <tr><td>Bullets</td><td>$" +
    _0xa1607d["costBreakdown"]["bullets"]["toFixed"](0x2) +
    "</td></tr>\n                    <tr><td>Food</td><td>$" +
    _0xa1607d["costBreakdown"]["food"]["toFixed"](0x2) +
    "</td></tr>\n                    <tr><td>Pills</td><td>$" +
    _0xa1607d["costBreakdown"]["pills"]["toFixed"](0x2) +
    '</td></tr>\n                    <tr class="total"><td>Total</td><td>$' +
    _0xa1607d["cost"]["toFixed"](0x2) +
    '</td></tr>\n                </table>\n            </details>\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats</th><th>Buy Price</th></tr></thead>\n                <tbody>' +
    _0x4c603c +
    "</tbody>\n            </table>\n        </div>";
}
function runBreakEven(_0x3102be, _0x52814b, _0xf05d70, _0x2592c2, _0x91e40f) {
  ((_0x2592c2["disabled"] = !![]),
    (_0x2592c2["textContent"] = "Computing break-even gear…"),
    (_0x91e40f["innerHTML"] =
      '\n        <div class="opt-be-card">\n            <div class="opt-progress-wrap">\n                <div class="opt-progress-label" id="beProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="beProgressBar" style="width:0%"></div></div>\n            </div>\n        </div>'));
  const _0x5a83c8 = {
      ..._0x52814b,
      fixedSkills: _0xf05d70["skills"],
      spentLimitOverride: 0x0,
      gearTiersOverride: {
        basic: !![],
        green: !![],
        blue: !![],
        purple: !![],
        gold: !![],
      },
      foodTypeOverride: "meat",
    },
    _0x15d815 = _buildCacheKey(_0x3102be, _0x5a83c8);
  if (_buildCache["has"](_0x15d815)) {
    (renderBreakEvenResult(_0x91e40f, _0xf05d70, _buildCache["get"](_0x15d815)),
      (_0x2592c2["disabled"] = ![]),
      (_0x2592c2["textContent"] = "Re-run break-even"));
    return;
  }
  const _0x1c819e = ++_optRunId;
  _terminateOptWorker();
  const _0xd19efe = _ensureOptWorker(),
    _0x23881e = Date["now"]();
  ((_0xd19efe["onmessage"] = (_0x3491b7) => {
    const _0x2b8c23 = _0x3491b7["data"];
    if (_0x2b8c23["runId"] !== _0x1c819e) return;
    if (_0x2b8c23["type"] === "progress") {
      const _0x39d501 = Math["round"](
          (_0x2b8c23["g"] / _0x2b8c23["total"]) * 0x64,
        ),
        _0xff7358 = document["getElementById"]("beProgressBar"),
        _0x47bf64 = document["getElementById"]("beProgressLabel");
      if (_0xff7358) _0xff7358["style"]["width"] = _0x39d501 + "%";
      if (_0x47bf64)
        _0x47bf64["textContent"] =
          "Searching gear " +
          _0x2b8c23["g"] +
          "/" +
          _0x2b8c23["total"] +
          " · " +
          ((Date["now"]() - _0x23881e) / 0x3e8)["toFixed"](0x1) +
          "s";
    } else
      _0x2b8c23["type"] === "result" &&
        (_buildCache["set"](_0x15d815, _0x2b8c23["result"]),
        renderBreakEvenResult(_0x91e40f, _0xf05d70, _0x2b8c23["result"]),
        (_0x2592c2["disabled"] = ![]),
        (_0x2592c2["textContent"] = "Re-run break-even"));
  }),
    _0xd19efe["postMessage"]({
      runId: _0x1c819e,
      presetName: _0x3102be,
      userData: _0x5a83c8,
    }));
}
function renderBreakEvenResult(_0x10637c, _0x380969, _0x34b8af) {
  const _0x2516b5 = _0x34b8af["bestBuild"];
  if (!_0x2516b5) {
    _0x10637c["innerHTML"] =
      '\n            <div class="opt-be-card">\n                <div class="opt-be-title">Break-even gear (same skills)</div>\n                <div class="build-loading">No gear in this preset\'s allowed tiers can break even with these skills — the build is fundamentally over-budget at $0 net.</div>\n            </div>';
    return;
  }
  const _0x481c24 = _0x2516b5["dmg"] - _0x380969["dmg"],
    _0x71db2f = (_0x2516b5["dmg"] / _0x380969["dmg"]) * 0x64 - 0x64,
    _0x1d9d13 = (_0x219c39) =>
      (_0x219c39 >= 0x0 ? "+$" : "-$") + Math["abs"](_0x219c39)["toFixed"](0x2),
    _0x2639ad = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      ["map"]((_0x35c3ae) => {
        const _0x342b66 = _0x2516b5["gear"][_0x35c3ae],
          _0xe079dd = _0x380969["gear"][_0x35c3ae],
          _0x2f57a1 = _0x342b66["type"] !== _0xe079dd["type"],
          _0x4c730a = Object["entries"](_0x342b66)
            ["filter"](
              ([_0x23c653]) =>
                _0x23c653 !== "type" &&
                _0x23c653 !== "price" &&
                _0x23c653 !== "buyPrice",
            )
            ["map"](([_0x45eba7, _0x178a89]) => _0x45eba7 + ": " + _0x178a89)
            ["join"](", ");
        return (
          "<tr" +
          (_0x2f57a1 ? ' class="opt-be-changed"' : "") +
          '>\n            <td style="text-transform:capitalize">' +
          _0x35c3ae +
          '</td>\n            <td><span class="opt-tier ' +
          _0x342b66["type"] +
          '">' +
          _0x342b66["type"] +
          "</span>" +
          (_0x2f57a1
            ? ' <span class="opt-be-was">was ' + _0xe079dd["type"] + "</span>"
            : "") +
          "</td>\n            <td>" +
          _0x4c730a +
          "</td>\n            <td>$" +
          _0x342b66["buyPrice"]["toFixed"](0x2) +
          "</td>\n        </tr>"
        );
      })
      ["join"]("");
  _0x10637c["innerHTML"] =
    '\n        <div class="opt-be-card">\n            <div class="opt-be-title">Break-even gear · same skills, net $0/day</div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Damage</div>\n                    <div class="opt-stat-value">' +
    _0x2516b5["dmg"]["toLocaleString"](undefined, {
      maximumFractionDigits: 0x0,
    }) +
    '</div>\n                    <div class="opt-stat-sub ' +
    (_0x481c24 >= 0x0 ? "positive" : "negative") +
    '">' +
    (_0x481c24 >= 0x0 ? "+" : "") +
    Math["round"](_0x481c24)["toLocaleString"]() +
    " (" +
    (_0x71db2f >= 0x0 ? "+" : "") +
    _0x71db2f["toFixed"](0x1) +
    '%)</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Net / day</div>\n                    <div class="opt-stat-value ' +
    (-_0x2516b5["spent"] >= 0x0 ? "positive" : "negative") +
    '">' +
    _0x1d9d13(-_0x2516b5["spent"]) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost / day</div>\n                    <div class="opt-stat-value">$' +
    _0x2516b5["cost"]["toFixed"](0x2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    _0x2516b5["startingCost"]["toFixed"](0x2) +
    '</div>\n                </div>\n            </div>\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats</th><th>Buy Price</th></tr></thead>\n                <tbody>' +
    _0x2639ad +
    "</tbody>\n            </table>\n        </div>";
}
(document["querySelectorAll"](".build-btn[data-build]")["forEach"](
  (_0x613747) => {
    _0x613747["addEventListener"]("click", () => {
      const _0x587da3 = _0x613747["dataset"]["build"];
      if (_0x587da3 === "sustainable")
        ((_buildOverrides["sustainable"] = {}), (_sustainableStarted = ![]));
      else {
        if (_0x587da3 === "war-eco")
          ((_buildOverrides["warEco"] = {}), (_warEcoStarted = ![]));
        else {
          if (_0x587da3 === "minmax")
            ((_minMaxConfig = null), (_minMaxStarted = ![]));
          else {
            if (_0x587da3 === "loot")
              ((_lootConfig = null), (_lootStarted = ![]));
            else
              _0x587da3 === "lvlup" &&
                ((_lvlUpConfig = null), (_lvlUpStarted = ![]));
          }
        }
      }
      (state.activeBuild === _0x587da3
        ? ((state.activeBuild = null), _0x613747["classList"]["remove"]("active"))
        : ((state.activeBuild = _0x587da3),
          document["querySelectorAll"](".build-btn[data-build]")["forEach"](
            (_0x4d452d) =>
              _0x4d452d["classList"]["toggle"](
                "active",
                _0x4d452d === _0x613747,
              ),
          )),
        renderBuildPanel());
    });
  },
),
  $("buildPanel")["addEventListener"]("click", async (_0xec65fd) => {
    const _0xb6ec98 = _0xec65fd["target"]["closest"]("#optimizerBtn");
    if (!_0xb6ec98) return;
    const _0x509e1c = _0xb6ec98["dataset"]["payload"],
      _0x42f2ec =
        "https://husarai.vercel.app/optimizer#data=" +
        encodeURIComponent(_0x509e1c);
    (window["open"](_0x42f2ec, "_blank"),
      navigator["clipboard"]?.["writeText"](_0x509e1c)["catch"](() => {}),
      _0xb6ec98["classList"]["add"]("success"),
      (_0xb6ec98["textContent"] = "Opened ✓ — click bookmarklet"),
      setTimeout(() => {
        (_0xb6ec98["classList"]["remove"]("success"),
          (_0xb6ec98["textContent"] = "Open in Optimizer ↗"));
      }, 0x9c4));
  }),
  (async function geoGate() {
    const _0x315753 = document["getElementById"]("geoGate");
    if (!_0x315753) return;
    const _0x8e0ea4 = document["getElementById"]("geoGateTitle"),
      _0x2221b7 = document["getElementById"]("geoGateMsg");
    async function _0x345ec8() {
      try {
        const _0x3a574a = await fetch("https://ipwho.is/", {
          cache: "no-store",
        });
        if (_0x3a574a["ok"]) {
          const _0x45f29e = await _0x3a574a["json"]();
          if (
            _0x45f29e &&
            _0x45f29e["success"] !== ![] &&
            _0x45f29e["country_code"]
          )
            return {
              code: String(_0x45f29e["country_code"])["toLowerCase"](),
              src: "ipwho.is",
            };
        }
      } catch (_0x2736d0) {
        console["warn"]("ipwho.is failed:", _0x2736d0);
      }
      try {
        const _0x9b3d0e = await fetch("https://ipapi.co/json/", {
          cache: "no-store",
        });
        if (_0x9b3d0e["ok"]) {
          const _0x488f27 = await _0x9b3d0e["json"]();
          if (_0x488f27 && _0x488f27["country_code"])
            return {
              code: String(_0x488f27["country_code"])["toLowerCase"](),
              src: "ipapi.co",
            };
        }
      } catch (_0x4f6617) {
        console["warn"]("ipapi.co failed:", _0x4f6617);
      }
      return null;
    }
    const _0x258ab7 = await _0x345ec8();
    if (!_0x258ab7) {
      (console["warn"](
        "Geo-lookup unavailable; failing open. Account whitelist still applies.",
      ),
        _0x315753["remove"]());
      return;
    }
    if (ALLOWED_COUNTRY_CODES["has"](_0x258ab7["code"])) {
      _0x315753["remove"]();
      return;
    }
    (_0x315753["classList"]["add"]("blocked"),
      (_0x8e0ea4["textContent"] = "Not available in your region"),
      (_0x2221b7["textContent"] =
        "This tool is restricted to allied countries. Your IP (" +
        _0x258ab7["code"]["toUpperCase"]() +
        ") isn't on the list."));
  })());
