import {
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
} from '../config.js';
import { trpc, trpcAuth, getGearSnapshotState } from '../api.js';
import { extractPlayerSkills, unmodeledReservedSP, wrapForWarEco } from '../transforms.js';
import { state } from '../state.js';
import { $, setStatus, clearDebug, renderDebug, escapeHtml } from '../utils.js';
import { OPT } from '../optimizer.js';
import '../liveOffers.js';
// Local mirror — kept in sync via the api.js listener so existing build-panel
// code can still reference _gearSnapshot directly.
let _gearSnapshot = null;
export function refreshMinMaxButtonState() {
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
function mapMarketPrices(_0x6c2565) {
  const _0x38aa4b = OPT["DEFAULT_MARKET_PRICES"];
  return {
    scrapPrice: _0x6c2565?.["scraps"] ?? _0x38aa4b["scrapPrice"],
    casePrice: _0x6c2565?.["case1"] ?? _0x38aa4b["casePrice"],
    redCasePrice: _0x6c2565?.["case2"] ?? _0x38aa4b["redCasePrice"],
    bulletPrice:    _0x6c2565?.["lightAmmo"]  ?? _0x38aa4b["bulletPrice"],
    lightAmmoPrice: _0x6c2565?.["lightAmmo"]  ?? _0x38aa4b["lightAmmoPrice"],
    ammoPrice:      _0x6c2565?.["ammo"]       ?? _0x38aa4b["ammoPrice"],
    heavyAmmoPrice: _0x6c2565?.["heavyAmmo"]  ?? _0x38aa4b["heavyAmmoPrice"],
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
          netWage: _0x1fa024["employer"]["netWagePerPP"],
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
  return (_optWorker = new Worker(
    new URL('../workers/optimizer.worker.js', import.meta.url),
    { type: 'module' },
  ));
}
function _terminateOptWorker() {
  _optWorker && (_optWorker["terminate"](), (_optWorker = null));
}
function _spawnEnvelopeWorker(_0x5a7dff, _0x290506, _0x1218f5) {
  return new Promise((_0x53c4a4, _0x19f11c) => {
      _0x12a11e = new Worker(
        new URL('../workers/optimizer.worker.js', import.meta.url),
        { type: 'module' },
      );
    ((_0x12a11e["onmessage"] = (_0x1f1e9b) => {
      const _0x1fabb6 = _0x1f1e9b["data"];
      if (_0x1fabb6["type"] === "progress" && _0x1218f5)
        _0x1218f5(_0x1fabb6["g"], _0x1fabb6["total"], _0x1fabb6["dmg"]);
      else {
        if (_0x1fabb6["type"] === "result")
          (_0x12a11e["terminate"](),
            _0x53c4a4(_0x1fabb6["result"]));
        else
          _0x1fabb6["type"] === "error" &&
            (_0x12a11e["terminate"](),
            _0x19f11c(new Error(_0x1fabb6["message"])));
      }
    }),
      (_0x12a11e["onerror"] = (_0x3281fb) => {
        (_0x12a11e["terminate"](),
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
export function initBuildButtons() {
  document.querySelectorAll('.build-btn[data-build]').forEach(btn => {
    btn.addEventListener('click', () => {
      const build = btn.dataset.build;
      if (build === 'sustainable')      { _buildOverrides.sustainable = {}; _sustainableStarted = false; }
      else if (build === 'war-eco')     { _buildOverrides.warEco = {};      _warEcoStarted      = false; }
      else if (build === 'minmax')      { _minMaxConfig = null;              _minMaxStarted      = false; }
      else if (build === 'loot')        { _lootConfig   = null;              _lootStarted        = false; }
      else if (build === 'lvlup')       { _lvlUpConfig  = null;              _lvlUpStarted       = false; }

      if (state.activeBuild === build) {
        state.activeBuild = null;
        btn.classList.remove('active');
      } else {
        state.activeBuild = build;
        document.querySelectorAll('.build-btn[data-build]').forEach(b =>
          b.classList.toggle('active', b === btn),
        );
      }
      renderBuildPanel();
    });
  });

  $('buildPanel').addEventListener('click', async e => {
    const btn = e.target.closest('#optimizerBtn');
    if (!btn) return;
    const payload = btn.dataset.payload;
    const url     = 'https://husarai.vercel.app/optimizer#data=' + encodeURIComponent(payload);
    window.open(url, '_blank');
    navigator.clipboard?.writeText(payload).catch(() => {});
    btn.classList.add('success');
    btn.textContent = 'Opened ✓ — click bookmarklet';
    setTimeout(() => {
      btn.classList.remove('success');
      btn.textContent = 'Open in Optimizer ↗';
    }, 2500);
  });
}
