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
import { trpc, trpcAuth, fetchGearPrices } from '../api.js';
import { extractPlayerSkills, unmodeledReservedSP, wrapForWarEco } from '../transforms.js';
import { state } from '../state.js';
import { $, setStatus, clearDebug, renderDebug, escapeHtml } from '../utils.js';
import { OPT } from '../optimizer.js';
function mapMarketPrices(prices) {
  const defaults = OPT.DEFAULT_MARKET_PRICES;
  return {
    scrapPrice: prices?.scraps ?? defaults.scrapPrice,
    casePrice: prices?.case1 ?? defaults.casePrice,
    redCasePrice: prices?.case2 ?? defaults.redCasePrice,
    bulletPrice:    prices?.lightAmmo  ?? defaults.bulletPrice,
    lightAmmoPrice: prices?.lightAmmo  ?? defaults.lightAmmoPrice,
    ammoPrice:      prices?.ammo       ?? defaults.ammoPrice,
    heavyAmmoPrice: prices?.heavyAmmo  ?? defaults.heavyAmmoPrice,
    pillPrice: prices?.cocain ?? defaults.pillPrice,
    breadPrice: prices?.bread ?? defaults.breadPrice,
    meatPrice: prices?.steak ?? defaults.meatPrice,
    fishPrice: prices?.cookedFish ?? defaults.fishPrice,
  };
}
function buildOptimizerUserData(data) {
  const user = data.user,
    rankPercent = user?.skills?.attack?.militaryRankPercent ?? 20;
  return {
    lvl: user?.leveling?.level || 1,
    marketPrices: mapMarketPrices(data.prices),
    rankBonus: 1 + rankPercent / 100,
    countryBonus: 1.9,
    companyCount: data.totals.companyCount,
    avgAePerCompany: data.totals.avgAePerCompany,
    workersProfit: data.totals.workersNet ?? 0,
    entrep: data.totals.entrep,
    bestEntrepProfitPerPP: data.totals.bestEntrepProfitPerPP ?? 0,
    energy: data.totals.energy,
    aeNet: data.totals.aeNet,
    employer: data.employer
      ? {
          netWage: data.employer.netWagePerPP,
          productionBonus: data.employer.productionBonus,
        }
      : null,
  };
}
let _optWorker = null,
  _optRunId = 0;
const _buildOverrides = { sustainable: {}, warEco: {} },
  _lastBuilds = { sustainable: null, warEco: null },
  _gearCheck = { bounty: 0.15, countryBonus: 90, targetNet: 15 },
  _pillDebuff = { bounty: 0.15, hours: 16, includeNone: true };
let _warEcoStarted = false,
  _sustainableStarted = false;
export const _buildCache = new Map();
function _buildCacheKey(presetName, userData) {
  return JSON.stringify({
    p: presetName,
    l: userData.lvl,
    sl: userData.spentLimitOverride,
    fs: userData.fixedSkills,
    gt: userData.gearTiersOverride,
    ft: userData.foodTypeOverride,
    up: userData.usePillOverride,
    b: userData.bountyOverride,
    h: userData.hoursOverride,
    dm: userData.dmgMultiplierOverride,
    ed: userData.excludeDailyIncomeOverride,
    ei: userData.excludeItemLootOverride,
    o: userData.objectiveOverride,
    rm: userData.rollMultiplier,
    cb: userData.countryBonus,
    ms: userData.minSkillsOverride,
    xs: userData.maxSkillsOverride,
    nc: userData.noStructuralCapsOverride,
    rs: userData.reservedSPOverride,
    go: userData.gearOverrides ? userData._gearOverridesKey : null,
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
  _optWorker && (_optWorker.terminate(), (_optWorker = null));
}
function _spawnEnvelopeWorker(presetName, userData, onProgress) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/optimizer.worker.js', import.meta.url),
      { type: 'module' },
    );
    (worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "progress" && onProgress)
        onProgress(msg.g, msg.total, msg.dmg);
      else {
        if (msg.type === "result")
          (worker.terminate(), resolve(msg.result));
        else
          msg.type === "error" &&
            (worker.terminate(), reject(new Error(msg.message)));
      }
    }),
    (worker.onerror = (e) => {
      (worker.terminate(), reject(new Error(e.message || "worker error")));
    }),
    worker.postMessage({ presetName, userData });
  });
}
export function renderBuildPanel() {
  const panel = $("buildPanel");
  if (!state.activeBuild || !state.lastAnalysis) {
    (_terminateOptWorker(), (panel.innerHTML = ""));
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
  const presetKey = state.activeBuild === "sustainable" ? "sustainable" : "warEco",
    presetLabel = OPT.PRESET_DEFS[presetKey].label,
    userData = buildOptimizerUserData(state.lastAnalysis),
    overrides = _buildOverrides[presetKey];
  if (overrides.spentLimitOverride !== undefined)
    userData.spentLimitOverride = overrides.spentLimitOverride;
  if (overrides.fixedSkills)
    userData.fixedSkills = overrides.fixedSkills;
  if (overrides.lvl) userData.lvl = overrides.lvl;
  const cacheKey = _buildCacheKey(presetKey, userData);
  if (_buildCache.has(cacheKey)) {
    renderBuildResult(presetKey, userData, _buildCache.get(cacheKey));
    return;
  }
  const runId = ++_optRunId;
  ((panel.innerHTML = wrapForWarEco(
    '\n        <div class="build-panel">\n            <h3>' +
      presetLabel +
      '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting optimizer…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n        </div>',
    presetKey,
  )),
    document.getElementById("optCancelBtn").addEventListener(
      "click",
      () => {
        _terminateOptWorker();
        const labelEl = document.getElementById("optProgressLabel");
        if (labelEl) labelEl.textContent = "Cancelled.";
      },
    ),
    _terminateOptWorker());
  const worker = _ensureOptWorker();
  ((worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.runId !== runId) return;
    if (msg.type === "progress") {
      const pct = Math.round((msg.g / msg.total) * 100),
        barEl = document.getElementById("optProgressBar"),
        labelEl = document.getElementById("optProgressLabel");
      if (barEl) barEl.style.width = pct + "%";
      if (labelEl)
        labelEl.textContent =
          "Optimizing " +
          msg.g +
          "/" +
          msg.total +
          " gear sets · " +
          (msg.elapsed / 1000).toFixed(1) +
          "s" +
          (msg.dmg
            ? " · best dmg " +
              Math.round(msg.dmg).toLocaleString()
            : "");
    } else
      msg.type === "result" &&
        (_buildCache.set(cacheKey, msg.result),
        (function () {
          let _res = msg.result;
          if (!_res.bestBuild && userData.gearOverrides) {
            const _fp = Object.assign({}, userData, {
              gearOverrides: null,
            });
            const _fk = _buildCacheKey(presetKey, _fp);
            if (!_buildCache.has(_fk))
              _buildCache.set(_fk, OPT.runOptimizer(_fp, null));
            _res = _buildCache.get(_fk);
          }
          _buildCache.set(cacheKey, _res);
          renderBuildResult(presetKey, userData, _res);
        })());
  }),
    (worker.onerror = (e) => {
      panel.innerHTML = wrapForWarEco(
        '<div class="build-panel"><h3>' +
          presetLabel +
          '</h3>\n            <div class="build-loading">Optimizer error: ' +
          (e.message || "unknown") +
          ".</div></div>",
        presetKey,
      );
    }),
    worker.postMessage({
      runId,
      presetName: presetKey,
      userData,
    }));
}
function renderBuildResult(presetKey, userData, optResult) {
  const panel = $("buildPanel"),
    presetDef = OPT.PRESET_DEFS[presetKey],
    bestBuild = optResult.bestBuild;
  if (!bestBuild) {
    const spentLimit =
      userData.spentLimitOverride !== undefined
        ? userData.spentLimitOverride
        : presetDef.spentLimit({
            entrep: userData.entrep,
            energy: userData.energy,
            aeNet: userData.aeNet,
          });
    panel.innerHTML = wrapForWarEco(
      '\n            <div class="build-panel">\n                <h3>' +
        presetDef.label +
        '</h3>\n                <div class="build-loading">No feasible build under this preset\'s constraints\n                (spent limit $' +
        spentLimit.toFixed(2) +
        "). Try the other preset or raise your company count / target net.</div>\n            </div>",
      presetKey,
    );
    return;
  }
  _lastBuilds[presetKey] = bestBuild;
  const fmtNet = (v) => (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
    netClass = (v) => (v >= 0 ? "positive" : "negative"),
    gearRows = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      .map((slot) => {
        const piece = bestBuild.gear[slot],
          stats = Object.entries(piece)
            .filter(([k]) => k !== "type" && k !== "price" && k !== "buyPrice")
            .map(([k, v]) => k + ": " + v)
            .join(", ");
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          slot +
          '</td>\n            <td><span class="opt-tier ' +
          piece.type +
          '">' +
          piece.type +
          "</span></td>\n            <td>" +
          stats +
          "</td>\n            <td>$" +
          piece.buyPrice.toFixed(2) +
          "</td>\n        </tr>"
        );
      })
      .join(""),
    skillRows = SKILL_DISPLAY.map(([skillKey, skillLabel]) => {
      const lvl = bestBuild.skills[skillKey],
        val = bestBuild.skillValues[skillKey],
        minBound = bestBuild.appliedSkillMin?.[skillKey] ?? 0,
        maxBound = bestBuild.appliedSkillMax?.[skillKey] ?? OPT.MAX_LVL,
        atMin = lvl === minBound,
        atMax = lvl === maxBound;
      return (
        "<tr>\n            <td>" +
        skillLabel +
        "</td>\n            <td>" +
        lvl +
        '</td>\n            <td style="color:' +
        (atMin || atMax ? "#8b8fa3" : "#555a6a") +
        '">' +
        (atMin ? "min" : atMax ? "max" : "—") +
        "</td>\n            <td>" +
        val.toFixed(1) +
        "</td>\n        </tr>"
      );
    }).join(""),
    husaraiPayload = buildHusaraiPayload(presetKey, userData),
    foodLabel = {
      none: "None",
      bread: "Bread (+10%)",
      meat: "Meat (+15%)",
      fish: "Fish (+20%)",
    }[bestBuild.foodType] ?? bestBuild.foodType,
    allowedTiers =
      OPT.GEAR_TIER_ORDER.filter((t) => presetDef.gearTiers[t]).join(" / ") || "—",
    params = OPT.buildPresetParams(presetKey, userData),
    elapsed = optResult.elapsed
      ? (optResult.elapsed / 1000).toFixed(2) + "s"
      : "<1ms",
    isWarEco = presetKey === "warEco",
    defaultTargetNet = -presetDef.spentLimit({
      entrep: userData.entrep,
      energy: userData.energy,
      aeNet: userData.aeNet,
    }),
    currentTargetNet = -params.spentLimit,
    hasCustomTarget = _buildOverrides[presetKey].spentLimitOverride !== undefined,
    targetRow = isWarEco
      ? '\n        <div class="opt-target-row">\n            <label for="optNetTarget">Target net / day</label>\n            <span class="opt-target-prefix">$</span>\n            <input type="number" id="optNetTarget" value="' +
        currentTargetNet.toFixed(2) +
        '" step="1" />\n            <button type="button" class="opt-target-btn" id="optApplyTarget">Apply</button>\n            ' +
        (hasCustomTarget
          ? '<button type="button" class="opt-target-reset" id="optResetTarget" title="Restore the preset\'s default">reset → $' +
            defaultTargetNet.toFixed(0) +
            "</button>"
          : '<span class="opt-target-hint">default: 80% of personal income</span>') +
        "\n        </div>"
      : "",
    breakEvenBtn =
      isWarEco && !userData.fixedSkills
        ? '\n        <button type="button" class="opt-be-btn" id="optBreakEvenBtn">Find break-even gear with these skills →</button>\n        <div id="optBreakEvenResult"></div>'
        : "";
  panel.innerHTML = wrapForWarEco(
    '\n        <div class="build-panel">\n            <h3>' +
      presetDef.label +
      '</h3>\n            <div class="build-meta">Evaluated ' +
      (optResult.gearSetsEvaluated ?? 0).toLocaleString() +
      " gear sets (" +
      (optResult.gearSetsPruned ?? 0).toLocaleString() +
      " pruned) from " +
      (optResult.gearSetsCount - (optResult.gearSetsPruned ?? 0)) +
      "/" +
      optResult.gearSetsCount +
      " feasible · " +
      elapsed +
      "</div>\n\n            " +
      targetRow +
      '\n\n            <div class="opt-hero">\n                <div>\n                    <div class="opt-hero-label">Damage</div>\n                    <div class="opt-hero-value">' +
      bestBuild.dmg.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      }) +
      '</div>\n                </div>\n                <div style="text-align:right">\n                    <div class="opt-hero-label">Net / day</div>\n                    <div class="opt-hero-net ' +
      netClass(-bestBuild.spent) +
      '">' +
      fmtNet(-bestBuild.spent) +
      '</div>\n                </div>\n            </div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Turnover / day</div>\n                    <div class="opt-stat-value positive">$' +
      bestBuild.profit.toFixed(2) +
      '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost / day</div>\n                    <div class="opt-stat-value negative">$' +
      bestBuild.cost.toFixed(2) +
      '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
      bestBuild.startingCost.toFixed(2) +
      '</div>\n                </div>\n            </div>\n\n            <details class="opt-breakdown">\n                <summary>Turnover breakdown · $' +
      bestBuild.profit.toFixed(2) +
      '/day</summary>\n                <table class="opt-bd-table">\n                    <tr><td>Companies (AE)</td><td>$' +
      bestBuild.profitBreakdown.companies.toFixed(2) +
      "</td></tr>\n                    <tr><td>Item loot (dmg × $0.15/1000)</td><td>$" +
      bestBuild.profitBreakdown.loot.toFixed(2) +
      "</td></tr>\n                    <tr><td>Chests (landed × loot% × case$)</td><td>$" +
      bestBuild.profitBreakdown.chests.toFixed(2) +
      "</td></tr>\n                    <tr><td>Red chests</td><td>$" +
      bestBuild.profitBreakdown.redChests.toFixed(2) +
      "</td></tr>\n                    <tr><td>Weekly cases</td><td>$" +
      bestBuild.profitBreakdown.weekly.toFixed(2) +
      "</td></tr>\n                    <tr><td>Daily bonus (2 × case$ + 14)</td><td>$" +
      bestBuild.profitBreakdown.daily.toFixed(2) +
      "</td></tr>\n                    <tr><td>Self-work (entrep slot)</td><td>$" +
      bestBuild.profitBreakdown.selfWork.toFixed(2) +
      "</td></tr>\n                    <tr><td>Work (energy slot)</td><td>$" +
      bestBuild.profitBreakdown.work.toFixed(2) +
      "</td></tr>\n                    <tr><td>Bounty</td><td>$" +
      bestBuild.profitBreakdown.bounty.toFixed(2) +
      '</td></tr>\n                    <tr class="total"><td>Total</td><td>$' +
      bestBuild.profit.toFixed(2) +
      '</td></tr>\n                </table>\n            </details>\n\n            <details class="opt-breakdown">\n                <summary>Cost breakdown · $' +
      bestBuild.cost.toFixed(2) +
      "/day (" +
      bestBuild.gunsUsed.toFixed(1) +
      " guns, " +
      bestBuild.setsUsed.toFixed(1) +
      " gear sets, " +
      bestBuild.bulletsUsed.toFixed(0) +
      " bullets, " +
      Math.round(bestBuild.foodUsed) +
      ' food)</summary>\n                <table class="opt-bd-table">\n                    <tr><td>Guns (dmg/100 × hits, net of scraps)</td><td>$' +
      bestBuild.costBreakdown.guns.toFixed(2) +
      "</td></tr>\n                    <tr><td>Equipment (× hits × (1 − dodge%))</td><td>$" +
      bestBuild.costBreakdown.equipment.toFixed(2) +
      "</td></tr>\n                    <tr><td>Bullets (1 per attack)</td><td>$" +
      bestBuild.costBreakdown.bullets.toFixed(2) +
      "</td></tr>\n                    <tr><td>Food</td><td>$" +
      bestBuild.costBreakdown.food.toFixed(2) +
      "</td></tr>\n                    <tr><td>Pills</td><td>$" +
      bestBuild.costBreakdown.pills.toFixed(2) +
      '</td></tr>\n                    <tr class="total"><td>Total</td><td>$' +
      bestBuild.cost.toFixed(2) +
      '</td></tr>\n                </table>\n            </details>\n\n            <div class="opt-section-title">Gear</div>\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats</th><th>Buy Price</th></tr></thead>\n                <tbody>' +
      gearRows +
      '</tbody>\n            </table>\n\n            <div class="js-export-area skill-export">\n                <div class="opt-section-title">Skills & Attributes</div>\n                <table class="opt-table">\n                    <thead><tr><th>Skill</th><th>Level</th><th>Bound</th><th>Total Value</th></tr></thead>\n                    <tbody>' +
      skillRows +
      '</tbody>\n                </table>\n                <button type="button" class="export-img-btn" data-export-kind="skills">📷 Export image</button>\n            </div>\n\n            <div class="opt-config">\n                <div class="opt-config-item"><span>Food:</span> <b>' +
      foodLabel +
      '</b></div>\n                <div class="opt-config-item"><span>Pill:</span> <b>' +
      (presetDef.usePill ? "on (+60% dmg)" : "off") +
      '</b></div>\n                <div class="opt-config-item"><span>Allowed tiers:</span> <b>' +
      allowedTiers +
      '</b></div>\n                <div class="opt-config-item"><span>Spent limit:</span> <b>' +
      fmtNet(params.spentLimit) +
      '</b></div>\n                <div class="opt-config-item"><span>Lvl:</span> <b>' +
      params.lvl +
      "</b></div>\n            </div>\n\n            " +
      breakEvenBtn +
      '\n\n            <details class="opt-variance">\n                <summary>Roll variance analysis (opt-in)</summary>\n                <div class="opt-variance-body">\n                    <div class="opt-variance-intro">\n                        WarEra gear has random rolls within a range per tier. The default sim uses the\n                        listed reference stats. These toggles let you see how much that affects the\n                        outcome. Leave them off for the original behavior.\n                    </div>\n                    <div class="opt-variance-controls">\n                        <label class="opt-variance-spread">Roll spread ±\n                            <input type="number" id="optVarSpread" value="15" step="1" min="0" max="50" />\n                            %\n                        </label>\n                        <label class="opt-variance-check">\n                            <input type="checkbox" id="optVarStat" />\n                            <span><b>Statistical band</b> on this build · Monte Carlo, instant</span>\n                        </label>\n                        <label class="opt-variance-check">\n                            <input type="checkbox" id="optVarEnvelope" />\n                            <span><b>Min/max envelope</b> · re-optimizes at low and high rolls (2 extra runs)</span>\n                        </label>\n                    </div>\n                    <div id="optVarStatResult"></div>\n                    <div id="optVarEnvelopeResult"></div>\n                </div>\n            </details>\n\n            <details class="opt-fallback">\n                <summary>Open in husarai.vercel.app/optimizer instead</summary>\n                <div class="panel-actions" style="margin-top:8px">\n                    <button class="panel-btn" id="optimizerBtn" data-payload=\'' +
      escapeHtml(JSON.stringify(husaraiPayload)) +
      '\'>Open in Optimizer ↗</button>\n                    <a class="bookmarklet-link" id="bookmarkletLink" draggable="true" title="Drag to your bookmarks bar (or right-click → Bookmark Link in Firefox)">★ Prefill bookmark</a>\n                </div>\n                <div class="setup-hint">\n                    One-time setup: <b>drag</b> the ★ button to your bookmarks bar (Firefox: right-click → <code>Bookmark Link…</code>).\n                    Then click <b>Open in Optimizer</b> — values go into the URL hash, and the bookmark autofills them.\n                </div>\n            </details>\n        </div>',
    presetKey,
  );
  const bookmarkletLink = document.getElementById("bookmarkletLink");
  if (bookmarkletLink) bookmarkletLink.href = PREFILL_BOOKMARKLET;
  const applyBtn = document.getElementById("optApplyTarget"),
    netInput = document.getElementById("optNetTarget");
  if (applyBtn && netInput) {
    const applyTarget = () => {
      const val = Number(netInput.value);
      if (!Number.isFinite(val)) return;
      (_buildOverrides[presetKey].spentLimitOverride = -val, renderBuildPanel());
    };
    (applyBtn.addEventListener("click", applyTarget),
      netInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") applyTarget();
      }));
  }
  const resetBtn = document.getElementById("optResetTarget");
  if (resetBtn)
    resetBtn.addEventListener("click", () => {
      (delete _buildOverrides[presetKey].spentLimitOverride, renderBuildPanel());
    });
  const breakEvenBtnEl = document.getElementById("optBreakEvenBtn"),
    breakEvenResult = document.getElementById("optBreakEvenResult");
  (breakEvenBtnEl &&
    breakEvenResult &&
    breakEvenBtnEl.addEventListener("click", () =>
      runBreakEven(presetKey, userData, bestBuild, breakEvenBtnEl, breakEvenResult),
    ),
    wireRollVarianceToggles(presetKey, userData, bestBuild, params));
}
function wireRollVarianceToggles(presetKey, userData, bestBuild, params) {
  const spreadInput = document.getElementById("optVarSpread"),
    statCheckbox = document.getElementById("optVarStat"),
    envelopeCheckbox = document.getElementById("optVarEnvelope"),
    statResult = document.getElementById("optVarStatResult"),
    envelopeResult = document.getElementById("optVarEnvelopeResult");
  if (!spreadInput || !statCheckbox || !envelopeCheckbox) return;
  const getSpread = () => {
      const v = Number(spreadInput.value);
      return Number.isFinite(v) && v >= 0 ? v / 100 : 0.15;
    },
    fmtDmg = (v) => Math.round(v).toLocaleString(),
    fmtCost = (v) => "$" + v.toFixed(2),
    fmtNet = (v) => (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
    renderStatBand = () => {
      if (!statCheckbox.checked) {
        statResult.innerHTML = "";
        return;
      }
      const spread = getSpread(),
        variance = OPT.varianceAnalysis(bestBuild, params, spread, 1000);
      if (!variance) {
        statResult.innerHTML = "";
        return;
      }
      const baseDmg = bestBuild.dmg,
        halfWidthPct = (((variance.dmg.p90 - variance.dmg.p10) / 2 / baseDmg) * 100).toFixed(1);
      statResult.innerHTML =
        '\n            <div class="opt-variance-stat-out">\n                <h4>Statistical band · ±' +
        (spread * 100).toFixed(0) +
        "% rolls · " +
        variance.samples +
        ' samples</h4>\n                <div class="opt-variance-band">\n                    <span>Damage</span><b>' +
        fmtDmg(variance.dmg.mean) +
        ' <span class="pct">(p10–p90: ' +
        fmtDmg(variance.dmg.p10) +
        " – " +
        fmtDmg(variance.dmg.p90) +
        " · ±" +
        halfWidthPct +
        "%)</span></b>\n                    <span>Net / day</span><b>" +
        fmtNet(-variance.spent.mean) +
        ' <span class="pct">(p10–p90: ' +
        fmtNet(-variance.spent.p90) +
        " – " +
        fmtNet(-variance.spent.p10) +
        ")</span></b>\n                    <span>Turnover / day</span><b>" +
        fmtCost(variance.profit.mean) +
        ' <span class="pct">(p10–p90: ' +
        fmtCost(variance.profit.p10) +
        " – " +
        fmtCost(variance.profit.p90) +
        ")</span></b>\n                    <span>Cost / day</span><b>" +
        fmtCost(variance.profit.mean - -variance.spent.mean) +
        ' <span class="pct">(derived: profit − net)</span></b>\n                </div>\n            </div>';
    },
    renderEnvCard = (title, subtitle, envResult, refBuild) => {
      const envBuild = envResult?.bestBuild;
      if (!envBuild)
        return (
          '\n            <div class="opt-variance-env-card">\n                <h5>' +
          title +
          ' <span style="color:#6b6f80;text-transform:none;letter-spacing:0">· ' +
          subtitle +
          '</span></h5>\n                <div class="env-row">No feasible build at this roll level under the same spent limit.</div>\n            </div>'
        );
      const dmgDelta = envBuild.dmg - refBuild.dmg,
        dmgPct = ((dmgDelta / refBuild.dmg) * 100).toFixed(1),
        sign = dmgDelta >= 0 ? "+" : "",
        gearSummary = ["gun", "helmet", "chest", "pant", "glove", "boot"]
          .map((slot) => slot + ":" + envBuild.gear[slot].type)
          .join(" · ");
      return (
        '\n            <div class="opt-variance-env-card">\n                <h5>' +
        title +
        ' <span style="color:#6b6f80;text-transform:none;letter-spacing:0">· ' +
        subtitle +
        '</span></h5>\n                <div class="env-row"><span>Damage</span><b>' +
        fmtDmg(envBuild.dmg) +
        ' <span style="color:' +
        (dmgDelta >= 0 ? "#22c55e" : "#ef4444") +
        ';font-weight:500">(' +
        sign +
        dmgPct +
        '% vs default)</span></b></div>\n                <div class="env-row"><span>Net / day</span><b>' +
        fmtNet(-envBuild.spent) +
        '</b></div>\n                <div class="env-row"><span>Starting cost</span><b>' +
        fmtCost(envBuild.startingCost) +
        '</b></div>\n                <div class="env-gear">' +
        gearSummary +
        "</div>\n            </div>"
      );
    };
  let envelopeRunId = 0;
  const runEnvelope = async () => {
    if (!envelopeCheckbox.checked) {
      envelopeResult.innerHTML = "";
      return;
    }
    const spread = getSpread(),
      thisRunId = ++envelopeRunId;
    envelopeResult.innerHTML =
      '<div class="opt-variance-loading">Running min-roll + max-roll optimizers (×2)…</div>';
    const baseUserData = { ...userData },
      minRollData = { ...baseUserData, rollMultiplier: Math.max(0.01, 1 - spread) },
      maxRollData = { ...baseUserData, rollMultiplier: 1 + spread };
    try {
      const [minResult, maxResult] = await Promise.all([
        _spawnEnvelopeWorker(presetKey, minRollData),
        _spawnEnvelopeWorker(presetKey, maxRollData),
      ]);
      if (thisRunId !== envelopeRunId) return;
      envelopeResult.innerHTML =
        renderEnvCard(
          "Min-roll build",
          "gear stats × " + (1 - spread).toFixed(2),
          minResult,
          bestBuild,
        ) +
        renderEnvCard(
          "Max-roll build",
          "gear stats × " + (1 + spread).toFixed(2),
          maxResult,
          bestBuild,
        );
    } catch (err) {
      if (thisRunId !== envelopeRunId) return;
      envelopeResult.innerHTML =
        '<div class="opt-variance-error">Envelope run failed: ' +
        err.message +
        "</div>";
    }
  };
  (statCheckbox.addEventListener("change", renderStatBand),
    envelopeCheckbox.addEventListener("change", runEnvelope),
    spreadInput.addEventListener("change", () => {
      renderStatBand();
      if (envelopeCheckbox.checked) runEnvelope();
    }));
}
function renderSustainableForm() {
  const panel = $("buildPanel");
  _terminateOptWorker();
  const presetDef = OPT.PRESET_DEFS.sustainable,
    userData = buildOptimizerUserData(state.lastAnalysis),
    currentLvl = userData.lvl;
  ((panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>' +
    presetDef.label +
    '</h3>\n            <div class="gc-intro">\n                Pick the player level you want to plan for. Default is your loaded level\n                (<b>' +
    currentLvl +
    '</b>). Bump it higher to preview the build you\'ll be able\n                to run after a few level-ups.\n            </div>\n            <div class="opt-target-row" style="margin-top:14px">\n                <label for="suLvlInput">Player level</label>\n                <input type="number" id="suLvlInput" value="' +
    currentLvl +
    '" step="1" min="1" max="100" />\n                <span class="opt-target-hint">SP available = level × 4</span>\n            </div>\n            <button type="button" class="opt-be-btn" id="suRunBtn">Run Sustainable simulation →</button>\n        </div>'),
    document.getElementById("suRunBtn").addEventListener("click", () => {
      const raw = Number(document.getElementById("suLvlInput").value),
        lvl = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : currentLvl;
      (_buildOverrides.sustainable.lvl = lvl,
        _sustainableStarted = true,
        renderBuildPanel());
    }));
}
function renderWarEcoForm() {
  const panel = $("buildPanel");
  _terminateOptWorker();
  const presetDef = OPT.PRESET_DEFS.warEco,
    userData = buildOptimizerUserData(state.lastAnalysis),
    currentLvl = userData.lvl,
    defaultTargetNet = -presetDef.spentLimit({
      entrep: userData.entrep,
      energy: userData.energy,
      aeNet: userData.aeNet,
    });
  ((panel.innerHTML = wrapForWarEco(
    '\n        <div class="build-panel">\n            <h3>' +
      presetDef.label +
      '</h3>\n            <div class="gc-intro">\n                Pick the player level and target net / day before simulating. Level defaults to your\n                loaded level (<b>' +
      currentLvl +
      '</b>) — bump it higher to plan future builds. Target net\n                defaults to <b>80%</b> of your personal daily income at the current level.\n            </div>\n            <div class="opt-target-row" style="margin-top:14px">\n                <label for="weLvlInput">Player level</label>\n                <input type="number" id="weLvlInput" value="' +
      currentLvl +
      '" step="1" min="1" max="100" />\n                <span class="opt-target-hint">SP available = level × 4</span>\n            </div>\n            <div class="opt-target-row" style="margin-top:10px">\n                <label for="weNetTarget">Target net / day</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="weNetTarget" value="' +
      defaultTargetNet.toFixed(2) +
      '" step="1" />\n                <span class="opt-target-hint">default: $' +
      defaultTargetNet.toFixed(0) +
      ' (80% of personal income)</span>\n            </div>\n            <button type="button" class="opt-be-btn" id="weRunBtn">Run War-Eco simulation →</button>\n        </div>',
    "warEco",
  )),
    document.getElementById("weRunBtn").addEventListener("click", () => {
      const rawLvl = Number(document.getElementById("weLvlInput").value),
        lvl =
          Number.isFinite(rawLvl) && rawLvl >= 1
            ? Math.floor(rawLvl)
            : currentLvl,
        rawNet = Number(document.getElementById("weNetTarget").value),
        targetNet = Number.isFinite(rawNet) ? rawNet : defaultTargetNet;
      (_buildOverrides.warEco.lvl = lvl,
        _buildOverrides.warEco.spentLimitOverride = -targetNet,
        _warEcoStarted = true,
        renderBuildPanel());
    }));
}
const MM_SLOT_STATS = {
    gun: ["attack", "cChance"],
    helmet: ["cDmg"],
    chest: ["armor"],
    pant: ["armor"],
    glove: ["precision"],
    boot: ["dodge"],
  };
async function buildPriceOverrides(allowedTiers) {
  const entries = [];
  for (const [slot, tiers] of Object.entries(MM_TIER_TO_CODE))
    for (const [tier, code] of Object.entries(tiers))
      if (!allowedTiers || allowedTiers[tier]) entries.push({ slot, tier, code });

  const prices    = await fetchGearPrices(entries.map(e => e.code));
  const overrides = {}, missing = [];
  for (const { slot, tier, code } of entries) {
    const price = prices[code];
    if (price > 0) {
      (overrides[slot] ??= {})[tier] = { buyPrice: price };
    } else {
      missing.push({ slot, tier, code });
    }
  }
  return { overrides, missing };
}
let _minMaxStarted = false,
  _minMaxConfig = null,
  _lootStarted = false,
  _lootConfig = null,
  _lvlUpStarted = false,
  _lvlUpConfig = null;
function renderMinMaxForm() {
  const panel = $("buildPanel");
  _terminateOptWorker();
  const userData = buildOptimizerUserData(state.lastAnalysis),
    currentLvl = userData.lvl;
  panel.innerHTML =
    '\n        <div class="build-panel mm-form">\n            <h3>🎯 Min-Max (real market)</h3>\n            <div class="gc-intro">\n                Uses real warera.io market data — live average prices fetched fresh from the\n                WarEra API each run (cached 5 min per session).\n                Tier picks are based on what gear actually costs on the current market.\n            </div>\n\n            <div class="mm-radio-row" id="mmPresetRow">\n                <label class="mm-radio selected"><input type="radio" name="mmPreset" value="sustainable" checked /> Sustainable</label>\n                <label class="mm-radio"><input type="radio" name="mmPreset" value="warEco" /> War-Eco</label>\n                <label class="mm-radio"><input type="radio" name="mmPreset" value="gearCheck" /> Gear Check</label>\n                <label class="mm-radio"><input type="radio" name="mmPreset" value="pillDebuff" /> Pill Debuff</label>\n            </div>\n            <div class="mm-pct-hint" id="mmLockedNote" style="display:none"></div>\n\n            <div class="opt-target-row">\n                <label for="mmLvlInput">Player level</label>\n                <input type="number" id="mmLvlInput" value="' +
    currentLvl +
    '" step="1" min="1" max="100" />\n                <span class="opt-target-hint">SP available = level × 4</span>\n            </div>\n\n            <div class="opt-target-row" id="mmSuNetRow" style="display:none">\n                <label for="mmSuNetInput">Target net / day</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="mmSuNetInput" value="0" step="1" />\n                <span class="opt-target-hint">min daily profit — 0 = break even</span>\n            </div>\n\n            <div class="opt-target-row" id="mmFactoriesRow" style="display:none">\n                <label for="mmFactoriesInput">Active factories</label>\n                <input type="number" id="mmFactoriesInput" value="0" step="1" min="0" max="20" />\n                <span class="opt-target-hint">companies skill cap = factories - 2</span>\n            </div>\n\n            <div class="opt-target-row" id="mmNetRow" style="display:none">\n                <label for="mmNetInput">Target net / day</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="mmNetInput" value="0" step="1" />\n                <span class="opt-target-hint">War-Eco only — default 80% of personal income</span>\n            </div>\n            <div id="mmNetWarn" class="mm-net-warn" style="display:none">\n                ⚠ Target net income / day is <b>WITHOUT</b> worker income. If you have workers,\n                you will earn that on top of this number.\n            </div>\n\n            <div class="opt-target-row" id="mmBountyRow" style="display:none">\n                <label for="mmBountyInput">Bounty ($ per 1000 dmg)</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="mmBountyInput" value="' +
    _gearCheck.bounty +
    '" step="0.01" min="0" />\n                <span class="opt-target-hint">e.g. 0.15 = $0.15/1k dmg</span>\n            </div>\n\n            <div class="opt-target-row" id="mmCountryBonusRow" style="display:none">\n                <label for="mmCountryBonusInput">Country dmg bonus</label>\n                <input type="number" id="mmCountryBonusInput" value="' +
    _gearCheck.countryBonus +
    '" step="1" min="0" max="500" />\n                <span class="opt-target-prefix">%</span>\n                <span class="opt-target-hint">default 90% — your country\'s combat dmg bonus</span>\n            </div>\n\n            <div class="opt-target-row" id="mmGcNetRow" style="display:none">\n                <label for="mmGcNetInput">Target net / day</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="mmGcNetInput" value="' +
    _gearCheck.targetNet +
    '" step="1" />\n                <span class="opt-target-hint">spend budget — default $15 (optimizer may run net down to −this)</span>\n            </div>\n\n            <div class="opt-target-row" id="mmHoursRow" style="display:none">\n                <label for="mmHoursInput">Fight hours</label>\n                <input type="number" id="mmHoursInput" value="' +
    _pillDebuff.hours +
    '" step="1" min="1" max="24" />\n                <span class="opt-target-hint">debuff period (damage fixed at −' +
    PILL_DEBUFF_DMG_PENALTY_PCT +
    '%)</span>\n            </div>\n\n            <button type="button" class="opt-be-btn" id="mmRunBtn">Run Min-Max simulation →</button>\n        </div>';
  (function () {
    var _r = document.createElement("div");
    _r.className = "opt-target-row";
    _r.style.cssText = "margin-top:8px";
    _r.innerHTML =
      '<label for="mmBattleBonusInput" style="min-width:130px">Battle bonus %</label><span class="opt-target-prefix">+</span><input type="number" id="mmBattleBonusInput" value="90" step="1" min="0" max="500" style="width:72px"/><span class="opt-target-hint">Total additive damage bonus (e.g. 85 for +85%)</span>';
    var _b = document.getElementById("mmRunBtn");
    if (_b && _b.parentNode) _b.parentNode.insertBefore(_r, _b);
  })();
  const factoriesInput = document.getElementById("mmFactoriesInput");
  if (factoriesInput) factoriesInput.value = userData.companyCount;
  const presetRadios = document.querySelectorAll('input[name="mmPreset"]'),
    netRow = document.getElementById("mmNetRow"),
    netInput = document.getElementById("mmNetInput"),
    bountyRow = document.getElementById("mmBountyRow"),
    countryBonusRow = document.getElementById("mmCountryBonusRow"),
    gcNetRow = document.getElementById("mmGcNetRow"),
    hoursRow = document.getElementById("mmHoursRow"),
    suNetRow = document.getElementById("mmSuNetRow"),
    factoriesRow = document.getElementById("mmFactoriesRow"),
    lockedNote = document.getElementById("mmLockedNote"),
    playerName = state.lastAnalysis?.user?.username || "(loaded player)",
    updatePresetUI = () => {
      const preset = document.querySelector('input[name="mmPreset"]:checked').value;
      (document.querySelectorAll(".mm-radio").forEach((radio) => {
        radio.classList.toggle(
          "selected",
          radio.querySelector("input").value === preset,
        );
      }),
        (netRow.style.display = preset === "warEco" ? "flex" : "none"));
      const netWarn = document.getElementById("mmNetWarn");
      if (netWarn)
        netWarn.style.display = preset === "warEco" ? "block" : "none";
      const isSustainable = preset === "sustainable";
      if (suNetRow) suNetRow.style.display = isSustainable ? "flex" : "none";
      if (factoriesRow) factoriesRow.style.display = isSustainable ? "flex" : "none";
      ((bountyRow.style.display =
        preset === "gearCheck" || preset === "pillDebuff" ? "flex" : "none"),
        (countryBonusRow.style.display = preset === "gearCheck" ? "flex" : "none"),
        (gcNetRow.style.display = preset === "gearCheck" ? "flex" : "none"),
        (hoursRow.style.display = preset === "pillDebuff" ? "flex" : "none"));
      preset === "gearCheck" || preset === "pillDebuff"
        ? ((lockedNote.style.display = "block"),
          (lockedNote.innerHTML =
            "Skills will be <b>locked</b> to <b>" +
            playerName +
            "</b>'s current values." +
            (preset === "pillDebuff"
              ? " Pill <b>off</b>, dmg <b>−" +
                PILL_DEBUFF_DMG_PENALTY_PCT +
                '%</b>, "none" tier included, runs bread vs no-food and picks the winner.'
              : "")))
        : (lockedNote.style.display = "none");
      if (preset === "warEco") {
        const defaultNet = -OPT.PRESET_DEFS.warEco.spentLimit({
          entrep: userData.entrep,
          energy: userData.energy,
          aeNet: userData.aeNet,
        });
        if (!netInput.value || netInput.value === "0")
          netInput.value = defaultNet.toFixed(0);
      }
    };
  (presetRadios.forEach((r) => r.addEventListener("change", updatePresetUI)),
    updatePresetUI(),
    document.getElementById("mmRunBtn").addEventListener("click", () => {
      const preset = document.querySelector('input[name="mmPreset"]:checked').value,
        rawLvl = Number(document.getElementById("mmLvlInput").value),
        lvl =
          Number.isFinite(rawLvl) && rawLvl >= 1
            ? Math.floor(rawLvl)
            : currentLvl,
        rawTargetNet = Number(netInput.value),
        rawBounty = Number(document.getElementById("mmBountyInput").value),
        rawCountryBonus = Number(document.getElementById("mmCountryBonusInput").value),
        rawGcNet = Number(document.getElementById("mmGcNetInput").value),
        rawHours = Number(document.getElementById("mmHoursInput").value);
      ((_minMaxConfig = {
        preset,
        lvl,
        targetNet:
          preset === "warEco" && Number.isFinite(rawTargetNet)
            ? rawTargetNet
            : null,
        gearCheckNet:
          preset === "gearCheck"
            ? Number.isFinite(rawGcNet)
              ? rawGcNet
              : (_gearCheck.targetNet ?? 15)
            : null,
        bounty:
          Number.isFinite(rawBounty) && rawBounty >= 0 ? rawBounty : 0,
        countryBonus:
          Number.isFinite(rawCountryBonus) && rawCountryBonus >= 0 ? rawCountryBonus : 90,
        hours:
          Number.isFinite(rawHours) && rawHours >= 1
            ? Math.floor(rawHours)
            : 16,
        suTargetNet: (() => { const v = Number(document.getElementById("mmSuNetInput")?.value); return Number.isFinite(v) ? v : 0; })(),
        factories: (() => { const v = Math.floor(Number(document.getElementById("mmFactoriesInput")?.value)); return v >= 0 ? v : null; })(),
      }),
        preset === "gearCheck" &&
          ((_gearCheck.bounty = _minMaxConfig.bounty),
          (_gearCheck.countryBonus = _minMaxConfig.countryBonus),
          (_gearCheck.targetNet = _minMaxConfig.gearCheckNet)),
        preset === "pillDebuff" &&
          ((_pillDebuff.bounty = _minMaxConfig.bounty),
          (_pillDebuff.hours = _minMaxConfig.hours)),
        (_minMaxConfig.battleBonus = Number(
          (document.getElementById("mmBattleBonusInput") || { value: "90" })
            .value,
        )),
        (_minMaxStarted = true),
        renderBuildPanel());
    }));
}
async function runMinMaxBuild() {
  const panel = $("buildPanel");
  if (!_minMaxConfig)
    return ((_minMaxStarted = false), renderMinMaxForm());
  const cfg = _minMaxConfig;
  if (cfg.preset === "pillDebuff") return runMinMaxPillDebuff();
  const baseUserData = buildOptimizerUserData(state.lastAnalysis);
  let presetKey,
    allowedTiers,
    extraOverrides = {},
    presetLabel;
  if (cfg.preset === "sustainable" || cfg.preset === "warEco")
    ((presetKey = cfg.preset),
      (allowedTiers = OPT.PRESET_DEFS[presetKey].gearTiers),
      (presetLabel = OPT.PRESET_DEFS[presetKey].label));
  else {
    if (cfg.preset === "gearCheck") {
      ((presetKey = "sustainable"),
        (allowedTiers = OPT.PRESET_DEFS.sustainable.gearTiers));
      const playerSkills = extractPlayerSkills(state.lastAnalysis.user),
        countryPct = cfg.countryBonus ?? 90;
      ((extraOverrides = {
        fixedSkills: playerSkills,
        bountyOverride: cfg.bounty,
        countryBonus: 1 + countryPct / 100,
      }),
        (presetLabel =
          "Gear Check · bounty $" +
          cfg.bounty.toFixed(2) +
          "/1k · country +" +
          countryPct +
          "% · net $" +
          cfg.gearCheckNet +
          "/day"));
    }
  }
  panel.innerHTML = '<div class="build-panel"><h3>🎯 Min-Max \xB7 ' + presetLabel + '</h3><div class="build-loading">Fetching live market prices…</div></div>';
  const { overrides: gearOverrides, missing } = await buildPriceOverrides(allowedTiers);
  const userData = {
      ...baseUserData,
      ...extraOverrides,
      lvl: cfg.lvl,
      gearOverrides,
      _gearOverridesKey: 'live-avg|' + cfg.preset,
    };
  if (cfg.preset === "sustainable") {
    userData.spentLimitOverride = -(cfg.suTargetNet ?? 0);
    if (cfg.factories != null && Number.isFinite(cfg.factories))
      userData.companyCount = cfg.factories;
  }
  cfg.preset === "warEco" &&
    cfg.targetNet != null &&
    (userData.spentLimitOverride = -cfg.targetNet);
  cfg.preset === "gearCheck" &&
    cfg.gearCheckNet != null &&
    (userData.spentLimitOverride = -cfg.gearCheckNet);
  if (Number.isFinite(cfg.battleBonus))
    userData.battleBonus = 1 + cfg.battleBonus / 100;
  const title = "🎯 Min-Max \xB7 " + presetLabel + " \xB7 live prices",
    cacheKey = _buildCacheKey(presetKey, userData);
  if (_buildCache.has(cacheKey))
    return renderMinMaxResult(
      presetKey,
      userData,
      _buildCache.get(cacheKey),
      { label: title, missing },
    );
  const runId = ++_optRunId;
  ((panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>' +
    title +
    '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting optimizer…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n            ' +
    (missing.length
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-top:10px">⚠ Thin samples for ' +
        missing.length +
        " (slot, tier) — those tiers fall back to listed reference values.</div>"
      : "") +
    "\n        </div>"),
    document.getElementById("optCancelBtn").addEventListener(
      "click",
      () => {
        _terminateOptWorker();
        const labelEl = document.getElementById("optProgressLabel");
        if (labelEl) labelEl.textContent = "Cancelled.";
      },
    ),
    _terminateOptWorker());
  const worker = _ensureOptWorker();
  ((worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.runId !== runId) return;
    if (msg.type === "progress") {
      const pct = Math.round((msg.g / msg.total) * 100),
        barEl = document.getElementById("optProgressBar"),
        labelEl = document.getElementById("optProgressLabel");
      if (barEl) barEl.style.width = pct + "%";
      if (labelEl) {
        const comboStr = msg.totalCombos > 1
          ? " · " + msg.label + " (" + msg.combo + "/" + msg.totalCombos + ")"
          : "";
        labelEl.textContent =
          "Optimizing " +
          msg.g +
          "/" +
          msg.total +
          " gear sets · " +
          (msg.elapsed / 1000).toFixed(1) +
          "s" +
          (msg.dmg ? " · best dmg " + Math.round(msg.dmg).toLocaleString() : "") +
          comboStr;
      }
    } else
      msg.type === "result" &&
        (_buildCache.set(cacheKey, msg.result),
        renderMinMaxResult(presetKey, userData, msg.result, {
          label: title,
          missing,
        }));
  }),
    (worker.onerror = (e) => {
      panel.innerHTML =
        '<div class="build-panel"><h3>' +
        title +
        '</h3>\n            <div class="build-loading">Optimizer error: ' +
        (e.message || "unknown") +
        ".</div></div>";
    }),
    worker.postMessage({
      runId,
      presetName: presetKey,
      userData,
    }));
}
function renderLootForm() {
  const panel = $("buildPanel");
  _terminateOptWorker();
  const userData = buildOptimizerUserData(state.lastAnalysis),
    currentLvl = userData.lvl;
  panel.innerHTML =
    '\n        <div class="build-panel mm-form">\n            <h3>💰 Loot Build <span style="color:#8b8fa3;font-size:13px;font-weight:500">· maximise net income</span></h3>\n            <div class="gc-intro">\n                Optimises for <b>net income</b>, not damage. No attack / crit — those only raise\n                damage, and chests come from <b>landed hits × loot%</b> (misses give no chests).\n                Invests only in: <b>precision</b> (land hits), <b>armor / dodge / health / hunger</b>\n                (survive longer → more swings → more landed hits), <b>loot</b> (chest % per landed\n                hit), and <b>energy / production / entre / companies</b> (personal + company income).\n                Pill <b>off</b>. Food is auto-decided — it runs <b>bread</b> vs\n                <b>no food</b> and keeps whichever nets more. Gear priced from live\n                warera market data (fetched fresh each run).\n                <b>Gun &amp; helmet are always left empty</b> (attack &amp; crit-damage never\n                repay their cost for a loot build); any other slot may also be left empty\n                if that\'s cheaper net.\n                <br><br>\n                Skill caps: precision 4–8 · loot 4–10 · armor/dodge/health/hunger 0–8 (≤ precision)\n                · energy/production/entre 0–8 · attack/crit 0. Requires <b>level ≥ 5</b>\n                (precision 4 + loot 4 minimum).\n            </div>\n\n            <div class="opt-target-row">\n                <label for="lootLvlInput">Player level</label>\n                <input type="number" id="lootLvlInput" value="' +
    currentLvl +
    '" step="1" min="5" max="100" />\n                <span class="opt-target-hint">SP available = level × 4</span>\n            </div>\n\n            <div class="opt-target-row" style="align-items:center">\n                <label>Gear tiers</label>\n                <label class="loot-tier-chk"><input type="checkbox" class="lootTier" value="basic" checked /> Basic</label>\n                <label class="loot-tier-chk"><input type="checkbox" class="lootTier" value="green" checked /> Green</label>\n                <label class="loot-tier-chk"><input type="checkbox" class="lootTier" value="blue" checked /> Blue</label>\n            </div>\n            <div class="mm-pct-hint">Applies to chest / pants / gloves / boots (gun &amp; helmet are forced empty). "Empty" is always an option — a higher tier is only bought if its extra loot pays for its higher daily cost.</div>\n\n            <button type="button" class="opt-be-btn" id="lootRunBtn">Run Loot simulation →</button>\n            <div class="mm-pct-hint" style="margin-top:8px;color:#eab308">\n                Full max-net search (no damage pruning). Most levels finish in ~1–3 min;\n                level ~35–45 with many companies can take ~5–7 min. Progress bar + Cancel appear once it starts.\n            </div>\n        </div>';
  document.getElementById("lootRunBtn").addEventListener(
    "click",
    () => {
      const rawLvl = Number(document.getElementById("lootLvlInput").value),
        lvl =
          Number.isFinite(rawLvl) && rawLvl >= 1
            ? Math.floor(rawLvl)
            : currentLvl,
        selectedTiers = {};
      document.querySelectorAll(".lootTier").forEach((cb) => {
        if (cb.checked) selectedTiers[cb.value] = true;
      });
      !Object.keys(selectedTiers).length &&
        (selectedTiers.basic = selectedTiers.green = selectedTiers.blue = true);
      ((_lootConfig = {
        preset: "loot",
        lvl,
        tiers: selectedTiers,
      }),
        (_lootStarted = true),
        renderBuildPanel());
    },
  );
}
async function runLootBuild() {
  const panel = $("buildPanel");
  if (!_lootConfig)
    return ((_lootStarted = false), renderLootForm());
  const cfg = _lootConfig,
    baseUserData = buildOptimizerUserData(state.lastAnalysis),
    lootGearTiers = OPT.PRESET_DEFS.loot.gearTiers,
    allowedTiers = { none: true };
  for (const tier of ["basic", "green", "blue"])
    if (cfg.tiers[tier] && lootGearTiers[tier]) allowedTiers[tier] = true;
  !(allowedTiers.basic || allowedTiers.green || allowedTiers.blue) &&
    (allowedTiers.basic = allowedTiers.green = allowedTiers.blue = true);
  const { overrides: gearOverrides, missing } = await buildPriceOverrides(allowedTiers),
    sharedUserData = {
      ...baseUserData,
      lvl: cfg.lvl,
      gearOverrides,
      gearTiersOverride: allowedTiers,
      objectiveOverride: "minSpent",
      usePillOverride: false,
      _gearOverridesKey:
        "live-avg|loot|" +
        Object.keys(allowedTiers).sort().join(""),
    },
    tierLabel = ["basic", "green", "blue"]
      .filter((t) => allowedTiers[t])
      .join("/");
  ((panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>💰 Loot Build · max-net · ' +
    tierLabel +
    " · pill off" +
    '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting loot optimiser…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n            <div class="mm-pct-hint" style="margin-top:8px">Racing <b>bread</b> vs <b>no food</b> — keeping whichever nets more.</div>\n            ' +
    (missing.length
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-top:6px">⚠ ' +
        missing.length +
        " (slot, tier) prices unavailable — those tiers fall back to listed reference values.</div>"
      : "") +
    "\n        </div>"),
    document.getElementById("optCancelBtn").addEventListener(
      "click",
      () => {
        _terminateOptWorker();
        const labelEl = document.getElementById("optProgressLabel");
        if (labelEl) labelEl.textContent = "Cancelled.";
      },
    ));
  const foodLabels = { bread: "Bread (+10%)", none: "No food" },
    foodVariants = [
      { label: "bread", food: "bread" },
      { label: "no food", food: "none" },
    ],
    results = [],
    startTime = Date.now(),
    runNext = (idx) => {
      if (idx >= foodVariants.length) {
        results.sort(
          (a, b) =>
            (a.result.bestBuild?.spent ?? Infinity) -
            (b.result.bestBuild?.spent ?? Infinity),
        );
        const winner = results[0],
          runner = results[1],
          winnerNet = winner.result.bestBuild
            ? -winner.result.bestBuild.spent
            : null,
          runnerNet =
            runner && runner.result.bestBuild
              ? -runner.result.bestBuild.spent
              : null,
          fmtNet = (v) => (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
          foodClass = (food) => (food === "bread" ? "mm-food-bread" : "mm-food-none");
        let raceBanner = "";
        if (winnerNet != null && runnerNet != null) {
          const diff = winnerNet - runnerNet;
          raceBanner =
            '<div class="mm-food-race"><b>Food race:</b>\n                    <span class="' +
            foodClass(winner.food) +
            '">' +
            foodLabels[winner.food] +
            " " +
            fmtNet(winnerNet) +
            '/day</span>\n                    vs <span class="' +
            foodClass(runner.food) +
            '">' +
            foodLabels[runner.food] +
            " " +
            fmtNet(runnerNet) +
            "/day</span>\n                    → using <b>" +
            foodLabels[winner.food] +
            "</b>" +
            (diff > 0.005
              ? " (saves $" + diff.toFixed(2) + "/day)"
              : " (tie — same net)") +
            "</div>";
        }
        const title =
          "💰 Loot Build · max-net · " +
          tierLabel +
          " · " +
          foodLabels[winner.food] +
          " · pill off";
        renderMinMaxResult("loot", winner.userData, winner.result, {
          label: title,
          missing,
          cfg,
          banner: raceBanner,
        });
        return;
      }
      const variant = foodVariants[idx],
        variantUserData = { ...sharedUserData, foodTypeOverride: variant.food },
        cacheKey = _buildCacheKey("loot", variantUserData);
      if (_buildCache.has(cacheKey))
        return (
          results.push({
            food: variant.food,
            result: _buildCache.get(cacheKey),
            userData: variantUserData,
          }),
          runNext(idx + 1)
        );
      const runId = ++_optRunId;
      _terminateOptWorker();
      const worker = _ensureOptWorker();
      ((worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.runId !== runId) return;
        if (msg.type === "progress") {
          const pct = Math.round((msg.g / msg.total) * 100),
            barEl = document.getElementById("optProgressBar"),
            labelEl = document.getElementById("optProgressLabel");
          if (barEl) barEl.style.width = pct + "%";
          if (labelEl)
            labelEl.textContent =
              variant.label +
              ": gear " +
              msg.g +
              "/" +
              msg.total +
              " · " +
              ((Date.now() - startTime) / 1000).toFixed(1) +
              "s";
        } else
          msg.type === "result" &&
            (_buildCache.set(cacheKey, msg.result),
            results.push({
              food: variant.food,
              result: msg.result,
              userData: variantUserData,
            }),
            runNext(idx + 1));
      }),
        (worker.onerror = (e) => {
          panel.innerHTML =
            '<div class="build-panel"><h3>💰 Loot Build</h3>\n                <div class="build-loading">Optimiser error: ' +
            (e.message || "unknown") +
            ".</div></div>";
        }),
        worker.postMessage({
          runId,
          presetName: "loot",
          userData: variantUserData,
        }));
    };
  runNext(0);
}
function renderLvlUpForm() {
  const panel = $("buildPanel");
  _terminateOptWorker();
  const levelingData = state.lastAnalysis?.user?.leveling || {},
    currentLvl = levelingData.level || 1,
    availableSP = levelingData.availableSkillPoints ?? 0,
    unmodeledSP = unmodeledReservedSP(state.lastAnalysis?.user),
    defaultTargetLvl = Math.min(currentLvl + 1, LVLUP_MAX_PLAYER_LVL);
  panel.innerHTML =
    '\n        <div class="build-panel mm-form">\n            <h3>🎚️ LVL Up Calc <span style="color:#8b8fa3;font-size:13px;font-weight:500">· where do my next points go?</span></h3>\n            <div class="gc-intro">\n                Keeps <b>' +
    (state.lastAnalysis?.user?.username || "the player") +
    "</b>'s current skills as a\n                <b>floor</b> (no respec — it only ever suggests adding points), then finds the best\n                way to spend the points you'll have at the target level.\n                <br><br>\n                <b>Target net / day</b> sets the goal:\n                <b style=\"color:#22c55e\">≥ $" +
    LVLUP_ECO_THRESHOLD +
    '</b> → <b>eco</b> (maximise net income — recommends income skills);\n                <b style="color:#ef4444">&lt; $' +
    LVLUP_ECO_THRESHOLD +
    "</b> → <b>war</b> (maximise damage within that spend budget — recommends combat skills,\n                exactly like Gear Check's net field).\n                <br><br>\n                You currently have <b>" +
    availableSP +
    "</b> unspent point" +
    (availableSP === 1 ? "" : "s") +
    "\n                at level <b>" +
    currentLvl +
    "</b>. Gear is priced from live warera market data. Every\n                skill is a candidate — points go wherever they help the chosen goal most.\n                " +
    (unmodeledSP > 0
      ? "<br><br><b>" +
        unmodeledSP +
        "</b> skill point" +
        (unmodeledSP === 1 ? "" : "s") +
        "\n                " +
        (unmodeledSP === 1 ? "is" : "are") +
        " locked in skills this tool can't model\n                (e.g. <b>Management</b>) — kept exactly as they are, never recommended."
      : "") +
    '\n            </div>\n\n            <div class="opt-target-row">\n                <label for="luLvlInput">Target level</label>\n                <input type="number" id="luLvlInput" value="' +
    defaultTargetLvl +
    '" step="1" min="' +
    currentLvl +
    '" max="' +
    LVLUP_MAX_PLAYER_LVL +
    '" />\n                <span class="opt-target-hint">default = your level + 1 (' +
    currentLvl +
    " → " +
    defaultTargetLvl +
    ')</span>\n            </div>\n\n            <div class="opt-target-row">\n                <label for="luNetInput">Target net / day</label>\n                <input type="number" id="luNetInput" value="' +
    LVLUP_ECO_THRESHOLD +
    '" step="1" />\n                <span class="opt-target-hint">≥ ' +
    LVLUP_ECO_THRESHOLD +
    " = eco (max income) · &lt; " +
    LVLUP_ECO_THRESHOLD +
    ' = war (max damage)</span>\n            </div>\n\n            <button type="button" class="opt-be-btn" id="luRunBtn">Calculate next points →</button>\n            <div class="mm-pct-hint" style="margin-top:8px;color:#6b7080">\n                Fast — your current skills are the floor, so only the points gained up to the\n                target level are searched. Usually well under a second; a few seconds for big level jumps.\n            </div>\n        </div>';
  document.getElementById("luRunBtn").addEventListener("click", () => {
    const rawLvl = Number(
        document.getElementById("luLvlInput").value,
      ),
      lvl = Number.isFinite(rawLvl)
        ? Math.max(
            currentLvl,
            Math.min(LVLUP_MAX_PLAYER_LVL, Math.floor(rawLvl)),
          )
        : defaultTargetLvl,
      rawNet = Number(document.getElementById("luNetInput").value),
      targetNet = Number.isFinite(rawNet)
        ? rawNet
        : LVLUP_ECO_THRESHOLD;
    ((_lvlUpConfig = {
      preset: "lvlup",
      lvl,
      targetLvl: lvl,
      net: targetNet,
    }),
      (_lvlUpStarted = true),
      renderBuildPanel());
  });
}
async function runLvlUpBuild() {
  const panel = $("buildPanel");
  if (!_lvlUpConfig)
    return ((_lvlUpStarted = false), renderLvlUpForm());
  const cfg = _lvlUpConfig,
    baseUserData = buildOptimizerUserData(state.lastAnalysis),
    currentSkills = extractPlayerSkills(state.lastAnalysis.user),
    maxSkillsOverride = {};
  OPT.SKILL_NAMES.forEach((skillName) => {
    maxSkillsOverride[skillName] = OPT.MAX_LVL;
  });
  const isEco = cfg.net >= LVLUP_ECO_THRESHOLD,
    objectiveOverrides = isEco
      ? { objectiveOverride: "minSpent", spentLimitOverride: 1000000000 }
      : { objectiveOverride: "maxDmg", spentLimitOverride: -cfg.net },
    allowedTiers = OPT.PRESET_DEFS.sustainable.gearTiers,
    { overrides: gearOverrides, missing } = await buildPriceOverrides(allowedTiers),
    userData = {
      ...baseUserData,
      ...objectiveOverrides,
      lvl: cfg.targetLvl,
      minSkillsOverride: currentSkills,
      maxSkillsOverride,
      noStructuralCapsOverride: true,
      reservedSPOverride: unmodeledReservedSP(state.lastAnalysis.user),
      gearOverrides,
      _gearOverridesKey:
        "live-avg|lvlup|L" +
        cfg.targetLvl +
        "|net" +
        cfg.net,
    },
    modeLabel = isEco
      ? '<span style="color:#22c55e">eco · max net</span>'
      : '<span style="color:#ef4444">war · max dmg · net $' +
        cfg.net +
        "/day</span>",
    title =
      "🎚️ LVL Up Calc · lvl " +
      cfg.targetLvl +
      " · " +
      modeLabel,
    onResult = (result) => {
      if (!result?.bestBuild) {
        panel.innerHTML =
          '<div class="build-panel"><h3>' +
          title +
          '</h3>\n                <div class="build-loading">No allocation spends exactly the points you\'d have at\n                level ' +
          cfg.targetLvl +
          ". This usually means the target level is too close to your\n                current one to place the gained points cleanly — try a higher target level.</div></div>";
        return;
      }
      const banner = _lvlUpBanner(
        currentSkills,
        result.bestBuild.skills,
        cfg,
        state.lastAnalysis?.user?.leveling || {},
      );
      renderMinMaxResult("sustainable", userData, result, {
        label: title,
        missing,
        cfg,
        banner,
        currentSkills,
      });
    },
    cacheKey = _buildCacheKey("sustainable", userData);
  if (_buildCache.has(cacheKey))
    return onResult(_buildCache.get(cacheKey));
  const runId = ++_optRunId;
  ((panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>' +
    title +
    '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting LVL Up calc…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n            ' +
    (missing.length
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-top:10px">⚠ Thin samples for ' +
        missing.length +
        " (slot, tier) — those tiers fall back to listed reference values.</div>"
      : "") +
    "\n        </div>"),
    document.getElementById("optCancelBtn").addEventListener(
      "click",
      () => {
        _terminateOptWorker();
        const labelEl = document.getElementById("optProgressLabel");
        if (labelEl) labelEl.textContent = "Cancelled.";
      },
    ),
    _terminateOptWorker());
  const worker = _ensureOptWorker();
  ((worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.runId !== runId) return;
    if (msg.type === "progress") {
      const pct = Math.round(
          (msg.g / msg.total) * 100,
        ),
        barEl = document.getElementById("optProgressBar"),
        labelEl = document.getElementById("optProgressLabel");
      if (barEl) barEl.style.width = pct + "%";
      if (labelEl)
        labelEl.textContent =
          "Optimizing " +
          msg.g +
          "/" +
          msg.total +
          " gear sets · " +
          (msg.elapsed / 1000).toFixed(1) +
          "s";
    } else
      msg.type === "result" &&
        (_buildCache.set(cacheKey, msg.result),
        onResult(msg.result));
  }),
    (worker.onerror = (e) => {
      panel.innerHTML =
        '<div class="build-panel"><h3>' +
        title +
        '</h3>\n            <div class="build-loading">Optimizer error: ' +
        (e.message || "unknown") +
        ".</div></div>";
    }),
    worker.postMessage({
      runId,
      presetName: "sustainable",
      userData,
    }));
}
function _lvlUpBanner(currentSkills, recommendedSkills, cfg, levelingData) {
  if (!recommendedSkills) return "";
  const isEco = cfg.net >= LVLUP_ECO_THRESHOLD,
    goalLabel = isEco
      ? '<span style="color:#22c55e">eco — maximise net income</span>'
      : '<span style="color:#ef4444">war — maximise damage (net &lt; $' +
        LVLUP_ECO_THRESHOLD +
        ", budget $" +
        cfg.net +
        "/day)</span>",
    additions = SKILL_DISPLAY.map(([key, label]) => ({
      lbl: label,
      d: (recommendedSkills[key] ?? 0) - (currentSkills[key] ?? 0),
    }))
      .filter((entry) => entry.d > 0)
      .sort((a, b) => b.d - a.d),
    totalAdded = additions.reduce(
      (sum, entry) => sum + entry.d,
      0,
    ),
    availableSP = levelingData.availableSkillPoints ?? 0,
    currentLvl = levelingData.level ?? "?",
    unmodeledSP = unmodeledReservedSP(state.lastAnalysis?.user),
    chipsHtml = additions.length
      ? additions.map(
          (entry) =>
            '<span class="lvlup-chip">+' +
            entry.d +
            " " +
            entry.lbl +
            "</span>",
        ).join(" ")
      : '<span style="color:#8b8fa3">Nothing to add — your build is already optimal for level ' +
        cfg.targetLvl +
        " under this goal.</span>";
  return (
    '<div class="mm-food-race">\n        <div style="margin-bottom:6px"><b>Put your next points here</b>\n            — level ' +
    currentLvl +
    " → <b>" +
    cfg.targetLvl +
    "</b> · goal: " +
    goalLabel +
    '</div>\n        <div style="line-height:1.9">' +
    chipsHtml +
    '</div>\n        <div class="mm-pct-hint" style="margin-top:8px;color:#8b8fa3">\n            Allocates <b>' +
    totalAdded +
    "</b> skill level" +
    (totalAdded === 1 ? "" : "s") +
    " on top of your\n            current skills" +
    (availableSP
      ? " (includes your " +
        availableSP +
        " currently-unspent point" +
        (availableSP === 1 ? "" : "s") +
        ")"
      : "") +
    ".\n            " +
    (unmodeledSP > 0
      ? "<b>" +
        unmodeledSP +
        "</b> point" +
        (unmodeledSP === 1 ? "" : "s") +
        " locked in unmodeled skills (e.g. Management) excluded. "
      : "") +
    "Full recommended distribution is in the Skills table below.\n        </div>\n    </div>"
  );
}
function renderMinMaxResult(presetKey, userData, optResult, opts) {
  const panel = $("buildPanel"),
    bestBuild = optResult.bestBuild,
    cfg = opts.cfg || _minMaxConfig;
  if (!bestBuild) {
    panel.innerHTML =
      '<div class="build-panel"><h3>' +
      opts.label +
      '</h3>\n            <div class="build-loading">No feasible build under this preset\'s constraints.</div></div>';
    return;
  }
  const fmtNet = (v) =>
      (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
    netClass = (v) => (v >= 0 ? "positive" : "negative"),
    slotLabels = {
      gun: "Gun",
      helmet: "Helmet",
      chest: "Chest",
      pant: "Pants",
      glove: "Gloves",
      boot: "Boots",
    },
    gearRows = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      .map((slot) => {
        const item = bestBuild.gear[slot],
          tier = item.type,
          code = MM_TIER_TO_CODE[slot]?.[tier],
          statsStr = MM_SLOT_STATS[slot].map(
            (stat) =>
              stat + ": " + (item[stat] ?? 0).toFixed(1),
          ).join(", ");
        let marketCell = "";
        if (item.buyPrice > 0) {
          marketCell =
            '<div class="mm-market-cell">live avg: <b>$' +
            item.buyPrice.toFixed(2) +
            "</b>" +
            (code ? " · " + code : "") +
            "</div>";
        }
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          (slotLabels[slot] || slot) +
          '</td>\n            <td><span class="opt-tier ' +
          tier +
          '">' +
          tier +
          "</span></td>\n            <td>" +
          statsStr +
          marketCell +
          "</td>\n            <td>$" +
          item.buyPrice.toFixed(2) +
          "</td>\n        </tr>"
        );
      })
      .join(""),
    currentSkills = opts.currentSkills || null,
    skillsHeader = currentSkills
      ? "<th>Skill</th><th>Current</th><th>Recommended</th><th>Total Value</th>"
      : "<th>Skill</th><th>Level</th><th>Total Value</th>",
    skillRows = SKILL_DISPLAY.map(([key, label]) => {
      const lvl = bestBuild.skills[key],
        val = bestBuild.skillValues[key];
      if (currentSkills) {
        const currentLvl = currentSkills[key] ?? 0,
          delta = lvl - currentLvl,
          deltaSpan =
            delta > 0
              ? ' <span class="lvlup-add">+' + delta + "</span>"
              : "";
        return (
          "<tr><td>" +
          label +
          "</td><td>" +
          currentLvl +
          "</td><td>" +
          lvl +
          deltaSpan +
          "</td><td>" +
          val.toFixed(1) +
          "</td></tr>"
        );
      }
      return (
        "<tr><td>" +
        label +
        "</td><td>" +
        lvl +
        "</td><td>" +
        val.toFixed(1) +
        "</td></tr>"
      );
    }).join(""),
    params = OPT.buildPresetParams(presetKey, userData),
    elapsed = optResult.elapsed
      ? (optResult.elapsed / 1000).toFixed(2) + "s"
      : "<1ms",
    foodLabel = {
      none: "None",
      bread: "Bread (+10%)",
      meat: "Meat (+15%)",
      fish: "Fish (+20%)",
    }[bestBuild.foodType] ?? bestBuild.foodType,
    gearCost = ["gun", "helmet", "chest", "pant", "glove", "boot"].reduce(
      (sum, slot) =>
        sum + (bestBuild.gear[slot]?.buyPrice || 0),
      0,
    );
  panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>' +
    opts.label +
    "</h3>\n            " +
    (opts.banner || "") +
    '\n            <div class="build-meta">Evaluated ' +
    (optResult.gearSetsEvaluated ?? 0).toLocaleString() +
    " gear sets (" +
    (optResult.gearSetsPruned ?? 0).toLocaleString() +
    " pruned) from " +
    (optResult.gearSetsCount - (optResult.gearSetsPruned ?? 0)) +
    "/" +
    optResult.gearSetsCount +
    " gear sets · " +
    elapsed +
    '</div>\n\n            <div class="opt-hero">\n                <div>\n                    <div class="opt-hero-label">Damage</div>\n                    <div class="opt-hero-value">' +
    bestBuild.dmg.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }) +
    '</div>\n                </div>\n                <div style="text-align:right">\n                    <div class="opt-hero-label">Net / day</div>\n                    <div class="opt-hero-net ' +
    netClass(-bestBuild.spent) +
    '">' +
    fmtNet(-bestBuild.spent) +
    '</div>\n                </div>\n            </div>\n            <div class="opt-stats">\n                <div class="opt-stat"><div class="opt-stat-label">Turnover / day</div><div class="opt-stat-value positive">$' +
    bestBuild.profit.toFixed(2) +
    '</div></div>\n                <div class="opt-stat"><div class="opt-stat-label">Cost / day</div><div class="opt-stat-value negative">$' +
    bestBuild.cost.toFixed(2) +
    '</div></div>\n                <div class="opt-stat"><div class="opt-stat-label">Gear cost (live avg)</div><div class="opt-stat-value">$' +
    gearCost.toFixed(2) +
    '</div></div>\n            </div>\n\n            <div class="opt-section-title">Gear (real-market prices)</div>\n            ' +
    _mmConsumablesBox(
      bestBuild.foodType,
      params.usePill,
      bestBuild.gear.gun.type,
    ) +
    '\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats / market info</th><th>Live avg price</th></tr></thead>\n                <tbody>' +
    gearRows +
    '</tbody>\n            </table>\n\n            <div class="js-export-area skill-export">\n                <div class="opt-section-title">Skills & Attributes</div>\n                <table class="opt-table">\n                    <thead><tr>' +
    skillsHeader +
    "</tr></thead>\n                    <tbody>" +
    skillRows +
    '</tbody>\n                </table>\n                <button type="button" class="export-img-btn" data-export-kind="skills">📷 Export image</button>\n            </div>\n\n            <div class="opt-config">\n                <div class="opt-config-item"><span>Food:</span> <b>' +
    foodLabel +
    '</b></div>\n                <div class="opt-config-item"><span>Pill:</span> <b>' +
    (params.usePill ? "on (+60% dmg)" : "off") +
    '</b></div>\n                <div class="opt-config-item"><span>Spent limit:</span> <b>' +
    fmtNet(params.spentLimit) +
    '</b></div>\n                <div class="opt-config-item"><span>Lvl:</span> <b>' +
    params.lvl +
    "</b></div>\n                " +
    (userData.bountyOverride != null
      ? '<div class="opt-config-item"><span>Bounty:</span> <b>$' +
        userData.bountyOverride.toFixed(2) +
        "/1k</b></div>"
      : "") +
    "\n                " +
    (userData.fixedSkills
      ? '<div class="opt-config-item"><span>Skills:</span> <b>locked to ' +
        (state.lastAnalysis?.user?.username || "player") +
        "</b></div>"
      : "") +
    '\n            </div>\n\n            <details class="opt-variance" id="mmRollSearch" style="margin-top:14px">\n                <summary class="mm-roll-summary">CLICK HERE: Find best rolls within these tiers (~10–20s)</summary>\n                <div class="opt-variance-body">\n                    <div class="opt-variance-intro">\n                        Locks the optimizer\'s tier picks and skill points, then brute-forces\n                        every roll combination within those tiers. Output is specific roll\n                        targets per slot — e.g. "rifle attack≥87, criticalChance≥14, &lt;$13".\n                    </div>\n                    ' +
    _mmLiveToggleMarkup(userData) +
    '\n                    <button type="button" class="opt-be-btn" id="mmRunRollSearchBtn">Run roll search →</button>\n                    <div id="mmRollSearchResult"></div>\n                </div>\n            </details>\n\n            ' +
    (presetKey === "warEco"
      ? '\n            <div style="margin-top:14px">\n                <button type="button" class="opt-be-btn" id="mmBreakEvenBtn">Find break-even gear with these skills →</button>\n                <div id="mmBreakEvenResult"></div>\n            </div>'
      : "") +
    "\n        </div>";
  const rollSearchBtn = document.getElementById("mmRunRollSearchBtn"),
    rollSearchResult = document.getElementById("mmRollSearchResult");
  if (rollSearchBtn)
    rollSearchBtn.addEventListener("click", () =>
      runMinMaxRollSearch(
        presetKey,
        userData,
        bestBuild,
        params,
        rollSearchBtn,
        rollSearchResult,
      ),
    );
  const breakEvenBtn = document.getElementById("mmBreakEvenBtn"),
    breakEvenResult = document.getElementById("mmBreakEvenResult");
  if (breakEvenBtn)
    breakEvenBtn.addEventListener("click", () =>
      runMinMaxBreakEven(presetKey, userData, bestBuild, breakEvenBtn, breakEvenResult),
    );
}
function runMinMaxRollSearch(
  presetKey,
  userData,
  bestBuild,
  params,
  btn,
  resultEl,
) {
  ((btn.disabled = true),
    (btn.textContent = "Searching…"),
    setTimeout(() => {
      try {
        const startTime = Date.now(),
          searchResult = _mmDoRollSearch(bestBuild, params),
          elapsed = Date.now() - startTime;
        resultEl.innerHTML = _mmRenderRollSearchResult(
          bestBuild,
          searchResult,
          params,
          elapsed,
        );
      } catch (err) {
        resultEl.innerHTML =
          '<div class="opt-variance-error">Roll search failed: ' +
          err.message +
          "</div>";
      } finally {
        ((btn.disabled = false),
          (btn.textContent = "Run roll search →"));
      }
    }, 30));
}
function _mmConsumablesBox(foodType, usePill, gunTier) {
  const foodMap = {
      bread: { txt: "Bread +10%", cls: "mm-food-bread" },
      meat: { txt: "Meat +15%", cls: "mm-food-meat" },
      fish: { txt: "Fish +20%", cls: "mm-food-fish" },
      none: { txt: "None (0%)", cls: "mm-food-none" },
    },
    foodEntry = foodMap[foodType] || foodMap.none,
    pillClass = usePill ? "mm-pill-yes" : "mm-pill-no",
    pillLabel = usePill ? "Yes (+60% dmg)" : "No",
    hasBullets = gunTier && gunTier !== "basic" && gunTier !== "none",
    bulletsClass = hasBullets ? "mm-bullets-val" : "mm-bullets-no",
    bulletsLabel = hasBullets ? "Light Ammo +10%" : "No";
  return (
    '<div class="mm-consumables">\n        <span><b>Food:</b> <span class="' +
    foodEntry.cls +
    '">' +
    foodEntry.txt +
    '</span></span>\n        <span><b>Bullets:</b> <span class="' +
    bulletsClass +
    '">' +
    bulletsLabel +
    '</span></span>\n        <span><b>Pill:</b> <span class="' +
    pillClass +
    '">' +
    pillLabel +
    "</span></span>\n    </div>"
  );
}
function _mmLiveToggleMarkup(_userData) {
  return "";
}
function _mmDoRollSearch(bestBuild, params) {
  const slots = ["gun", "helmet", "chest", "pant", "glove", "boot"],
    scrapPrice = params.marketPrices.scrapPrice,
    variantsBySlot = {};
  for (const slot of slots) {
    const item = bestBuild.gear[slot],
      tier = item.type;
    if (tier === "none") {
      variantsBySlot[slot] = [
        {
          type: "none",
          buyPrice: 0,
          price: 0,
          n: 0,
          _none: true,
          ...Object.fromEntries(
            MM_SLOT_STATS[slot].map((stat) => [stat, 0]),
          ),
        },
      ];
      continue;
    }
    const scrapsPerItem =
        {
          none: 0,
          basic: 2,
          green: 6,
          blue: 18,
          purple: 54,
          gold: 162,
        }[tier] || 0,
      buyPrice = item.buyPrice;
    variantsBySlot[slot] = [
      {
        type: tier,
        buyPrice,
        price: buyPrice - scrapsPerItem * scrapPrice,
        n: 0,
        _fallback: true,
        ...Object.fromEntries(
          MM_SLOT_STATS[slot].map((stat) => [stat, item[stat]]),
        ),
      },
    ];
  }
  const foodMap = OPT.buildFood(params.marketPrices),
    food = foodMap[bestBuild.foodType] ?? foodMap.fish,
    skills = bestBuild.skills,
    attrs = {},
    objective = params.objective ?? "maxDmg",
    isBetter =
      objective === "minSpent"
        ? (a, b) => a.spent < b.spent
        : (a, b) => a.dmg > b.dmg;
  let best = null,
    evaluated = 0,
    infeasibleSkipped = 0;
  for (const gun of variantsBySlot.gun)
    for (const helmet of variantsBySlot.helmet)
      for (const chest of variantsBySlot.chest)
        for (const pant of variantsBySlot.pant)
          for (const glove of variantsBySlot.glove)
            for (const boot of variantsBySlot.boot) {
              const gear = {
                gun,
                helmet,
                chest,
                pant,
                glove,
                boot,
              };
              OPT.writeAttributes(skills, gear, attrs);
              const result = OPT.evalBuild(
                attrs,
                gear,
                params,
                food,
              );
              evaluated++;
              if (result.spent > params.spentLimit + 0.000001) {
                infeasibleSkipped++;
                continue;
              }
              (!best || isBetter(result, best.result)) &&
                (best = { gear, result });
            }
  return {
    best,
    evaluated,
    infeasibleSkipped,
    variants: variantsBySlot,
  };
}
function _mmRenderRollSearchResult(bestBuild, searchResult, params, elapsed) {
  if (!searchResult.best)
    return (
      '<div class="opt-variance-error" style="margin-top:10px">\n            No roll combination fit under the spent limit (' +
      params.spentLimit.toFixed(2) +
      ").\n            Evaluated " +
      searchResult.evaluated.toLocaleString() +
      " combinations · " +
      searchResult.infeasibleSkipped +
      " infeasible.\n        </div>"
    );
  const best = searchResult.best,
    slots = ["gun", "helmet", "chest", "pant", "glove", "boot"],
    slotLabels = {
      gun: "Gun",
      helmet: "Helmet",
      chest: "Chest",
      pant: "Pants",
      glove: "Gloves",
      boot: "Boots",
    },
    dmgDelta = best.result.dmg - bestBuild.dmg,
    dmgPct = ((dmgDelta / bestBuild.dmg) * 100).toFixed(1),
    dmgSign = dmgDelta >= 0 ? "+" : "",
    defaultGearCost = slots.reduce(
      (sum, slot) =>
        sum + (bestBuild.gear[slot]?.buyPrice || 0),
      0,
    ),
    bestGearCost = slots.reduce(
      (sum, slot) =>
        sum + (best.gear[slot]?.buyPrice || 0),
      0,
    ),
    gearCostDelta = bestGearCost - defaultGearCost,
    gearRows = slots.map((slot) => {
      const item = best.gear[slot];
      if (item._none || item.type === "none")
        return (
          "<tr><td>" +
          slotLabels[slot] +
          "</td><td>—</td><td>(no item)</td><td>—</td></tr>"
        );
      const statsStr = MM_SLOT_STATS[slot].map(
          (stat) =>
            stat +
            ": " +
            (item[stat]?.toFixed?.(0) ?? item[stat]),
        ).join(", "),
        sampleCount = item.n != null ? item.n : "?",
        offerSpan = item._offerId
          ? ' <span style="color:#6b8afd">· offer ' +
            String(item._offerId).slice(0, 8) +
            "…</span>"
          : "";
      return (
        "<tr>\n            <td>" +
        slotLabels[slot] +
        '</td>\n            <td><span class="opt-tier ' +
        item.type +
        '">' +
        item.type +
        "</span></td>\n            <td>" +
        statsStr +
        (item._fallback
          ? ' <span style="color:#eab308">(no roll data — fallback)</span>'
          : ' <span style="color:#6b6f80">(n=' + sampleCount + ")</span>") +
        offerSpan +
        "</td>\n            <td>$" +
        item.buyPrice.toFixed(2) +
        "</td>\n        </tr>"
      );
    }).join(""),
    priceSourceLabel = "<b>live market average</b>",
    dmgColor = dmgDelta >= 0 ? "#22c55e" : "#ef4444",
    gearCostColor = gearCostDelta >= 0 ? "#eab308" : "#22c55e",
    netColor = -best.result.spent >= 0 ? "#22c55e" : "#ef4444";
  return (
    '\n        <div class="opt-variance-stat-out js-export-area" style="margin-top:12px">\n            <h4>Best rolls — locked to chosen tiers + skills</h4>\n            <div class="opt-variance-band">\n                <span>Damage</span><b>' +
    Math.round(best.result.dmg).toLocaleString() +
    '\n                    <span style="color:' +
    dmgColor +
    ';font-weight:500">(' +
    dmgSign +
    dmgPct +
    "% vs default — " +
    Math.round(dmgDelta).toLocaleString() +
    ' dmg)</span></b>\n                <span>Net / day</span><b style="color:' +
    netColor +
    '">' +
    ((-best.result.spent >= 0 ? "+$" : "-$") +
      Math.abs(-best.result.spent).toFixed(2)) +
    '\n                    <span class="pct" style="color:#8b8fa3;font-weight:500">(was ' +
    ((-bestBuild.spent >= 0 ? "+$" : "-$") +
      Math.abs(-bestBuild.spent).toFixed(2)) +
    ")</span></b>\n                <span>Turnover / day</span><b>$" +
    best.result.profit.toFixed(2) +
    "</b>\n                <span>Gear cost</span><b>$" +
    bestGearCost.toFixed(2) +
    '\n                    <span style="color:' +
    gearCostColor +
    ';font-weight:500">(' +
    (gearCostDelta >= 0 ? "+" : "") +
    "$" +
    gearCostDelta.toFixed(2) +
    " vs default)</span></b>\n                <span>Searched</span><b>" +
    searchResult.evaluated.toLocaleString() +
    " roll combos in " +
    elapsed +
    ' ms</b>\n            </div>\n            <div class="opt-section-title" style="margin-top:12px">Roll targets — what to shop for</div>\n            ' +
    _mmConsumablesBox(
      bestBuild.foodType,
      params.usePill,
      best.gear.gun.type,
    ) +
    '\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats / sample count</th><th>Target buy ≤</th></tr></thead>\n                <tbody>' +
    gearRows +
    '</tbody>\n            </table>\n            <div class="mm-pct-hint" style="margin-top:10px">\n                Buy each piece with stats <b>at or above</b> the values shown, for <b>up to</b> the listed price.\n                Price source: ' +
    priceSourceLabel +
    '.\n            </div>\n            <button type="button" class="export-img-btn" data-export-kind="rolls">📷 Export image</button>\n        </div>'
  );
}
function _exportFilename(kind) {
  const playerName =
      typeof state.lastAnalysis !== "undefined" &&
      state.lastAnalysis &&
      state.lastAnalysis.user &&
      state.lastAnalysis.user.username
        ? String(state.lastAnalysis.user.username).replace(/[^\w-]/g, "")
        : "build",
    now = new Date(),
    pad = (n) => String(n).padStart(2, "0"),
    timestamp =
      "" +
      now.getFullYear() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      "-" +
      pad(now.getHours()) +
      pad(now.getMinutes());
  return "warera-" + kind + "-" + playerName + "-" + timestamp + ".png";
}
function _onExportClick(e) {
  const target = e.target;
  if (!(target instanceof Element)) return;
  const btn = target.closest(".export-img-btn");
  if (!btn) return;
  const exportArea = btn.closest(".js-export-area");
  if (!exportArea) return;
  if (typeof html2canvas !== "function") {
    alert(
      "Image export library failed to load — needs an internet connection. Try again once online.",
    );
    return;
  }
  const exportKind = btn.dataset.exportKind || "export",
    originalText = btn.textContent;
  ((btn.disabled = true),
    (btn.textContent = "📷 Rendering…"),
    html2canvas(exportArea, {
      backgroundColor: "#1a1d27",
      scale: 2,
      logging: false,
      ignoreElements: (el) =>
        el.classList &&
        el.classList.contains("export-img-btn"),
    })
      .then((canvas) => {
        canvas.toBlob((blob) => {
          if (!blob) throw new Error("canvas.toBlob returned null");
          const link = document.createElement("a");
          ((link.href = URL.createObjectURL(blob)),
            (link.download = _exportFilename(exportKind)),
            document.body.appendChild(link),
            link.click(),
            setTimeout(() => {
              (URL.revokeObjectURL(link.href),
                link.remove());
            }, 1000),
            (btn.disabled = false),
            (btn.textContent = originalText));
        }, "image/png");
      })
      .catch((err) => {
        (console.error("Image export failed", err),
          (btn.disabled = false),
          (btn.textContent = originalText),
          alert(
            "Image export failed: " +
              ((err && err.message) || err),
          ));
      }));
}
document.addEventListener("click", _onExportClick);
async function runMinMaxBreakEven(
  presetKey,
  userData,
  bestBuild,
  btn,
  resultEl,
) {
  if (!_minMaxConfig) return;
  ((btn.disabled = true),
    (btn.textContent = "Computing break-even gear…"),
    (resultEl.innerHTML =
      '\n        <div class="opt-be-card">\n            <div class="opt-progress-wrap">\n                <div class="opt-progress-label" id="mmBeProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="mmBeProgressBar" style="width:0%"></div></div>\n            </div>\n        </div>'));
  const allTiers = {
      basic: true,
      green: true,
      blue: true,
      purple: true,
      gold: true,
    },
    { overrides: gearOverrides } = await buildPriceOverrides(allTiers),
    breakEvenUserData = {
      ...userData,
      fixedSkills: bestBuild.skills,
      spentLimitOverride: 0,
      gearTiersOverride: allTiers,
      foodTypeOverride: "meat",
      gearOverrides,
      _gearOverridesKey: "live-avg|warEco|be",
    },
    cacheKey = _buildCacheKey(presetKey, breakEvenUserData);
  if (_buildCache.has(cacheKey)) {
    (renderMinMaxBreakEvenResult(
      resultEl,
      bestBuild,
      _buildCache.get(cacheKey),
      breakEvenUserData,
      presetKey,
    ),
      (btn.disabled = false),
      (btn.textContent = "Re-run break-even"));
    return;
  }
  const runId = ++_optRunId;
  _terminateOptWorker();
  const worker = _ensureOptWorker(),
    startTime = Date.now();
  ((worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.runId !== runId) return;
    if (msg.type === "progress") {
      const pct = Math.round(
          (msg.g / msg.total) * 100,
        ),
        barEl = document.getElementById("mmBeProgressBar"),
        labelEl = document.getElementById("mmBeProgressLabel");
      if (barEl) barEl.style.width = pct + "%";
      if (labelEl)
        labelEl.textContent =
          "Searching gear " +
          msg.g +
          "/" +
          msg.total +
          " · " +
          ((Date.now() - startTime) / 1000).toFixed(1) +
          "s";
    } else
      msg.type === "result" &&
        (_buildCache.set(cacheKey, msg.result),
        renderMinMaxBreakEvenResult(
          resultEl,
          bestBuild,
          msg.result,
          breakEvenUserData,
          presetKey,
        ),
        (btn.disabled = false),
        (btn.textContent = "Re-run break-even"));
  }),
    worker.postMessage({
      runId,
      presetName: presetKey,
      userData: breakEvenUserData,
    }));
}
function renderMinMaxBreakEvenResult(
  resultEl,
  originalBuild,
  optResult,
  userData,
  presetKey,
) {
  const cfg = _minMaxConfig,
    bestBuild = optResult.bestBuild;
  if (!bestBuild) {
    resultEl.innerHTML =
      '\n            <div class="opt-be-card">\n                <div class="opt-be-title">Break-even gear (same skills)</div>' +
      '\n                <div class="build-loading">No gear in any tier can break even with these skills — the build is fundamentally over-budget at $0 net.</div>\n            </div>';
    return;
  }
  const dmgDelta = bestBuild.dmg - originalBuild.dmg,
    dmgPct = (bestBuild.dmg / originalBuild.dmg) * 100 - 100,
    fmtNet = (v) =>
      (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
    slotLabels = {
      gun: "Gun",
      helmet: "Helmet",
      chest: "Chest",
      pant: "Pants",
      glove: "Gloves",
      boot: "Boots",
    },
    gearRows = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      .map((slot) => {
        const newItem = bestBuild.gear[slot],
          oldItem = originalBuild.gear[slot],
          tierChanged = newItem.type !== oldItem.type,
          tier = newItem.type,
          code = MM_TIER_TO_CODE[slot]?.[tier],
          statsStr = MM_SLOT_STATS[slot].map(
            (stat) =>
              stat + ": " + (newItem[stat] ?? 0).toFixed(1),
          ).join(", ");
        let marketCell = "";
        if (newItem.buyPrice > 0) {
          marketCell =
            '<div class="mm-market-cell">live avg: <b>$' +
            newItem.buyPrice.toFixed(2) +
            "</b>" +
            (code ? " · " + code : "") +
            "</div>";
        }
        return (
          "<tr" +
          (tierChanged ? ' class="opt-be-changed"' : "") +
          '>\n            <td style="text-transform:capitalize">' +
          (slotLabels[slot] || slot) +
          '</td>\n            <td><span class="opt-tier ' +
          tier +
          '">' +
          tier +
          "</span>" +
          (tierChanged
            ? ' <span class="opt-be-was">was ' + oldItem.type + "</span>"
            : "") +
          "</td>\n            <td>" +
          statsStr +
          marketCell +
          "</td>\n            <td>$" +
          newItem.buyPrice.toFixed(2) +
          "</td>\n        </tr>"
        );
      })
      .join(""),
    params = OPT.buildPresetParams(presetKey, userData);
  resultEl.innerHTML =
    '\n        <div class="opt-be-card">\n            <div class="opt-be-title">Break-even gear · same skills, net $0/day</div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Damage</div>\n                    <div class="opt-stat-value">' +
    bestBuild.dmg.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }) +
    '</div>\n                    <div class="opt-stat-sub ' +
    (dmgDelta >= 0 ? "positive" : "negative") +
    '">' +
    (dmgDelta >= 0 ? "+" : "") +
    Math.round(dmgDelta).toLocaleString() +
    " (" +
    (dmgPct >= 0 ? "+" : "") +
    dmgPct.toFixed(1) +
    '%)</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Net / day</div>\n                    <div class="opt-stat-value ' +
    (-bestBuild.spent >= 0 ? "positive" : "negative") +
    '">' +
    fmtNet(-bestBuild.spent) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost / day</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.cost.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.startingCost.toFixed(2) +
    "</div>\n                </div>\n            </div>\n            " +
    _mmConsumablesBox(
      bestBuild.foodType,
      params.usePill,
      bestBuild.gear.gun.type,
    ) +
    '\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats / market info</th><th>Live avg price</th></tr></thead>\n                <tbody>' +
    gearRows +
    '</tbody>\n            </table>\n\n            <details class="opt-variance" id="mmBeRollSearch" style="margin-top:14px">\n                <summary class="mm-roll-summary">CLICK HERE: Find best rolls within these tiers (~10–20s)</summary>\n                <div class="opt-variance-body">\n                    <div class="opt-variance-intro">\n                        Locks the break-even tier picks and skill points, then brute-forces every roll combination within those tiers under the $0 net budget.\n                    </div>\n                    ' +
    _mmLiveToggleMarkup(userData) +
    '\n                    <button type="button" class="opt-be-btn" id="mmBeRunRollSearchBtn">Run roll search →</button>\n                    <div id="mmBeRollSearchResult"></div>\n                </div>\n            </details>\n        </div>';
  const rollSearchBtn = document.getElementById("mmBeRunRollSearchBtn"),
    rollSearchResult = document.getElementById("mmBeRollSearchResult");
  if (rollSearchBtn)
    rollSearchBtn.addEventListener("click", () =>
      runMinMaxRollSearch(
        presetKey,
        userData,
        bestBuild,
        params,
        rollSearchBtn,
        rollSearchResult,
      ),
    );
}
async function runMinMaxPillDebuff() {
  const panel = $("buildPanel"),
    cfg = _minMaxConfig,
    currentSkills = extractPlayerSkills(state.lastAnalysis.user),
    baseUserData = buildOptimizerUserData(state.lastAnalysis),
    allTiers = {
      basic: true,
      green: true,
      blue: true,
      purple: true,
      gold: true,
    };
  const { overrides: gearOverrides, missing } = await buildPriceOverrides(allTiers);
  const sharedUserData = {
      ...baseUserData,
      lvl: cfg.lvl,
      fixedSkills: currentSkills,
      bountyOverride: cfg.bounty,
      usePillOverride: false,
      hoursOverride: cfg.hours,
      dmgMultiplierOverride: 1 - PILL_DEBUFF_DMG_PENALTY_PCT / 100,
      excludeDailyIncomeOverride: true,
      excludeItemLootOverride: true,
      objectiveOverride: "minSpent",
      gearTiersOverride: {
        none: true,
        basic: true,
        green: true,
        blue: true,
        purple: true,
        gold: true,
      },
      spentLimitOverride: 1000000000,
      gearOverrides,
      _gearOverridesKey: "live-avg|pillDebuff",
    },
    title =
      "🎯 Min-Max · Pill Debuff · " +
      cfg.hours +
      "h · bounty $" +
      cfg.bounty.toFixed(2) +
      "/1k";
  ((panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>' +
    title +
    '</h3>\n            <div class="opt-progress-wrap" id="optProgress">\n                <div class="opt-progress-label" id="optProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="optProgressBar" style="width:0%"></div></div>\n                <button type="button" class="opt-cancel-btn" id="optCancelBtn">Cancel</button>\n            </div>\n            ' +
    (missing.length
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-top:10px">⚠ Thin samples for ' +
        missing.length +
        " (slot, tier) — those tiers fall back to listed reference values.</div>"
      : "") +
    "\n        </div>"),
    document.getElementById("optCancelBtn").addEventListener(
      "click",
      () => {
        _terminateOptWorker();
        const labelEl = document.getElementById("optProgressLabel");
        if (labelEl) labelEl.textContent = "Cancelled.";
      },
    ));
  const foodVariants = [
      { label: "bread", foodTypeOverride: "bread" },
      { label: "no food", foodTypeOverride: "none" },
    ],
    results = [],
    startTime = Date.now(),
    runNext = (idx) => {
      if (idx >= foodVariants.length) {
        (results.sort(
          (a, b) =>
            (a.result.bestBuild?.spent ?? Infinity) -
            (b.result.bestBuild?.spent ?? Infinity),
        ),
          renderMinMaxPillDebuffResult(results, title, missing));
        return;
      }
      const variant = foodVariants[idx],
        variantUserData = {
          ...sharedUserData,
          foodTypeOverride: variant.foodTypeOverride,
        },
        cacheKey = _buildCacheKey("sustainable", variantUserData);
      if (_buildCache.has(cacheKey))
        return (
          results.push({
            label: variant.label,
            foodType: variant.foodTypeOverride,
            result: _buildCache.get(cacheKey),
            userData: variantUserData,
          }),
          runNext(idx + 1)
        );
      const runId = ++_optRunId;
      _terminateOptWorker();
      const worker = _ensureOptWorker();
      ((worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.runId !== runId) return;
        if (msg.type === "progress") {
          const pct = Math.round(
              (msg.g / msg.total) * 100,
            ),
            barEl = document.getElementById("optProgressBar"),
            labelEl = document.getElementById("optProgressLabel");
          if (barEl) barEl.style.width = pct + "%";
          if (labelEl)
            labelEl.textContent =
              variant.label +
              ": gear " +
              msg.g +
              "/" +
              msg.total +
              " · " +
              ((Date.now() - startTime) / 1000).toFixed(1) +
              "s";
        } else
          msg.type === "result" &&
            (_buildCache.set(cacheKey, msg.result),
            results.push({
              label: variant.label,
              foodType: variant.foodTypeOverride,
              result: msg.result,
              userData: variantUserData,
            }),
            runNext(idx + 1));
      }),
        worker.postMessage({
          runId,
          presetName: "sustainable",
          userData: variantUserData,
        }));
    };
  runNext(0);
}
function renderMinMaxPillDebuffResult(results, title, missing) {
  const panel = $("buildPanel"),
    cfg = _minMaxConfig,
    winner = results[0],
    bestBuild = winner?.result?.bestBuild;
  if (!bestBuild) {
    panel.innerHTML =
      '<div class="build-panel"><h3>' +
      title +
      '</h3>\n            <div class="build-loading">No feasible build for either food choice.</div></div>';
    return;
  }
  const fmtNet = (v) =>
      (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
    slotLabels = {
      gun: "Gun",
      helmet: "Helmet",
      chest: "Chest",
      pant: "Pants",
      glove: "Gloves",
      boot: "Boots",
    },
    comparisonRows = results.map((entry) => {
      const build = entry.result.bestBuild,
        isWinner = entry === winner,
        winnerBadge = isWinner
          ? '<span class="opt-pd-winner">winner</span>'
          : "",
        netStr = build ? fmtNet(-build.spent) : "—",
        dmgStr = build
          ? build.dmg.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })
          : "—";
      return (
        '<tr class="' +
        (isWinner ? "opt-pd-winner-row" : "") +
        '">\n            <td>' +
        entry.label +
        " " +
        winnerBadge +
        "</td>\n            <td>" +
        dmgStr +
        "</td>\n            <td>$" +
        (build ? build.cost.toFixed(2) : "—") +
        "</td>\n            <td>$" +
        (build ? build.profit.toFixed(2) : "—") +
        "</td>\n            <td>" +
        netStr +
        "</td>\n        </tr>"
      );
    }).join(""),
    gearRows = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      .map((slot) => {
        const item = bestBuild.gear[slot],
          tier = item.type,
          code = MM_TIER_TO_CODE[slot]?.[tier],
          statsStr = (MM_SLOT_STATS[slot] || [])
            .map((stat) => stat + ": " + (item[stat] ?? 0).toFixed(1))
            .join(", ");
        let marketCell = "";
        if (item.buyPrice > 0) {
          marketCell =
            '<div class="mm-market-cell">live avg: <b>$' +
            item.buyPrice.toFixed(2) +
            "</b>" +
            (code ? " · " + code : "") +
            "</div>";
        }
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          (slotLabels[slot] || slot) +
          '</td>\n            <td><span class="opt-tier ' +
          tier +
          '">' +
          tier +
          "</span></td>\n            <td>" +
          (statsStr || '<span style="color:#6b6f80">—</span>') +
          marketCell +
          "</td>\n            <td>$" +
          item.buyPrice.toFixed(2) +
          "</td>\n        </tr>"
        );
      })
      .join(""),
    emptySlotsCount = ["gun", "helmet", "chest", "pant", "glove", "boot"].filter(
      (slot) => bestBuild.gear[slot].type === "none",
    ).length,
    emptySlotsBanner =
      emptySlotsCount > 0
        ? '<div class="gc-intro" style="margin-bottom:10px"><b>' +
          emptySlotsCount +
          "</b> slot" +
          (emptySlotsCount === 1 ? "" : "s") +
          " optimally <b>empty</b> during the debuff.</div>"
        : "",
    winnerUserData = winner.userData,
    params = OPT.buildPresetParams("sustainable", winnerUserData);
  panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>' +
    title +
    "</h3>\n            " +
    (missing.length
      ? '<div class="mm-pct-hint" style="color:#eab308;margin-bottom:10px">⚠ ' +
        missing.length +
        " (slot, tier) prices unavailable — those tiers fell back to listed values.</div>"
      : "") +
    '\n            <div class="opt-section-title" style="margin-top:0">Food comparison</div>\n            <table class="opt-bd-table" style="margin-bottom:10px">\n                <thead><tr><th>Food</th><th>Damage</th><th>Cost</th><th>Profit</th><th>Net</th></tr></thead>\n                <tbody>' +
    comparisonRows +
    "</tbody>\n            </table>\n            " +
    emptySlotsBanner +
    '\n            <div class="opt-section-title">Winning build: <b>' +
    winner.label +
    '</b></div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Damage (debuffed)</div>\n                    <div class="opt-stat-value">' +
    bestBuild.dmg.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Net / debuff</div>\n                    <div class="opt-stat-value ' +
    (-bestBuild.spent >= 0 ? "positive" : "negative") +
    '">' +
    fmtNet(-bestBuild.spent) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.cost.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Fight profit</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.profit.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.startingCost.toFixed(2) +
    '</div>\n                </div>\n            </div>\n\n            <div class="opt-section-title">Winning gear (real-market prices)</div>\n            ' +
    _mmConsumablesBox(
      winner.foodType,
      params.usePill,
      bestBuild.gear.gun.type,
    ) +
    '\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats / market info</th><th>Live avg price</th></tr></thead>\n                <tbody>' +
    gearRows +
    '</tbody>\n            </table>\n\n            <details class="opt-variance" id="mmPdRollSearch" style="margin-top:14px">\n                <summary class="mm-roll-summary">CLICK HERE: Find best rolls within these tiers (~10–20s)</summary>\n                <div class="opt-variance-body">\n                    <div class="opt-variance-intro">\n                        Locks the winning tier picks + skills, then brute-forces every roll combination within those tiers under the pill-debuff budget.\n                    </div>\n                    ' +
    _mmLiveToggleMarkup(winnerUserData) +
    '\n                    <button type="button" class="opt-be-btn" id="mmPdRunRollSearchBtn">Run roll search →</button>\n                    <div id="mmPdRollSearchResult"></div>\n                </div>\n            </details>\n        </div>';
  const rollSearchBtn = document.getElementById("mmPdRunRollSearchBtn"),
    rollSearchResult = document.getElementById("mmPdRollSearchResult");
  if (rollSearchBtn)
    rollSearchBtn.addEventListener("click", () =>
      runMinMaxRollSearch(
        "sustainable",
        winnerUserData,
        bestBuild,
        params,
        rollSearchBtn,
        rollSearchResult,
      ),
    );
}
function renderGearCheckForm() {
  const panel = $("buildPanel");
  _terminateOptWorker();
  const currentSkills = extractPlayerSkills(state.lastAnalysis.user),
    currentLvl = state.lastAnalysis.user?.leveling?.level || "?",
    playerName = state.lastAnalysis.user?.username || "(loaded player)",
    skillRows = SKILL_DISPLAY.map(
      ([key, label]) =>
        "\n        <tr><td>" +
        label +
        "</td><td>" +
        (currentSkills[key] ?? 0) +
        "</td></tr>",
    ).join("");
  ((panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>Gear check · current skills</h3>\n            <div class="gc-intro">\n                Lock <b>' +
    playerName +
    "</b>'s current skill levels (lvl " +
    currentLvl +
    ') and search for the\n                best gear within Sustainable\'s constraints (meat, pill on, −$15 spent limit,\n                green/blue/purple/gold tiers). Set a bounty rate to factor in $/1000 dmg.\n            </div>\n            <table class="opt-table" style="margin:8px 0">\n                <thead><tr><th>Skill</th><th>Current level</th></tr></thead>\n                <tbody>' +
    skillRows +
    '</tbody>\n            </table>\n            <div class="opt-target-row" style="margin-top:14px">\n                <label for="gcBountyInput">Bounty ($ per 1000 dmg)</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="gcBountyInput" value="' +
    _gearCheck.bounty +
    '" step="0.01" min="0" />\n                <span class="opt-target-hint">e.g. 0.15 = $0.15/1k dmg</span>\n            </div>\n            <button type="button" class="opt-be-btn" id="gcRunBtn">Run gear simulation →</button>\n            <div id="gcResultContainer"></div>\n        </div>'),
    document.getElementById("gcRunBtn").addEventListener("click", () => {
      const rawBounty = Number(
        document.getElementById("gcBountyInput").value,
      );
      ((_gearCheck.bounty =
        Number.isFinite(rawBounty) && rawBounty >= 0 ? rawBounty : 0),
        runGearCheck(currentSkills, _gearCheck.bounty));
    }));
}
function runGearCheck(currentSkills, bounty) {
  const resultEl = document.getElementById("gcResultContainer"),
    btn = document.getElementById("gcRunBtn");
  ((btn.disabled = true),
    (btn.textContent = "Optimizing gear…"),
    (resultEl.innerHTML =
      '\n        <div class="opt-be-card">\n            <div class="opt-progress-wrap">\n                <div class="opt-progress-label" id="gcProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="gcProgressBar" style="width:0%"></div></div>\n            </div>\n        </div>'));
  const userData = {
      ...buildOptimizerUserData(state.lastAnalysis),
      fixedSkills: currentSkills,
      bountyOverride: bounty,
    },
    cacheKey = _buildCacheKey("sustainable", userData);
  if (_buildCache.has(cacheKey)) {
    (renderGearCheckResult(resultEl, _buildCache.get(cacheKey), bounty),
      (btn.disabled = false),
      (btn.textContent = "Re-run gear simulation"));
    return;
  }
  const runId = ++_optRunId;
  _terminateOptWorker();
  const worker = _ensureOptWorker(),
    startTime = Date.now();
  ((worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.runId !== runId) return;
    if (msg.type === "progress") {
      const pct = Math.round(
          (msg.g / msg.total) * 100,
        ),
        barEl = document.getElementById("gcProgressBar"),
        labelEl = document.getElementById("gcProgressLabel");
      if (barEl) barEl.style.width = pct + "%";
      if (labelEl)
        labelEl.textContent =
          "Searching gear " +
          msg.g +
          "/" +
          msg.total +
          " · " +
          ((Date.now() - startTime) / 1000).toFixed(1) +
          "s";
    } else
      msg.type === "result" &&
        (_buildCache.set(cacheKey, msg.result),
        renderGearCheckResult(resultEl, msg.result, bounty),
        (btn.disabled = false),
        (btn.textContent = "Re-run gear simulation"));
  }),
    worker.postMessage({
      runId,
      presetName: "sustainable",
      userData,
    }));
}
function renderGearCheckResult(resultEl, optResult, bounty) {
  const bestBuild = optResult.bestBuild;
  if (!bestBuild) {
    resultEl.innerHTML =
      '\n            <div class="opt-be-card">\n                <div class="opt-be-title">Gear check result</div>\n                <div class="build-loading">No feasible gear within Sustainable\'s −$15 spent budget at your current skill levels and bounty $' +
      bounty.toFixed(2) +
      "/1k.</div>\n            </div>";
    return;
  }
  const fmtNet = (v) =>
      (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
    gearRows = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      .map((slot) => {
        const item = bestBuild.gear[slot],
          statsStr = Object.entries(item)
            .filter(
              ([key]) =>
                key !== "type" &&
                key !== "price" &&
                key !== "buyPrice",
            )
            .map(([key, val]) => key + ": " + val)
            .join(", ");
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          slot +
          '</td>\n            <td><span class="opt-tier ' +
          item.type +
          '">' +
          item.type +
          "</span></td>\n            <td>" +
          statsStr +
          "</td>\n            <td>$" +
          item.buyPrice.toFixed(2) +
          "</td>\n        </tr>"
        );
      })
      .join("");
  resultEl.innerHTML =
    '\n        <div class="opt-be-card">\n            <div class="opt-be-title">Gear check · current skills · bounty $' +
    bounty.toFixed(2) +
    '/1k</div>\n            <div class="build-meta">Evaluated ' +
    (optResult.gearSetsEvaluated ?? 0).toLocaleString() +
    " gear sets (" +
    (optResult.gearSetsPruned ?? 0).toLocaleString() +
    " pruned) from " +
    (optResult.gearSetsCount - (optResult.gearSetsPruned ?? 0)) +
    "/" +
    optResult.gearSetsCount +
    " gear sets\n                · " +
    (optResult.elapsed / 1000).toFixed(2) +
    's</div>\n            <div class="opt-hero">\n                <div>\n                    <div class="opt-hero-label">Damage</div>\n                    <div class="opt-hero-value">' +
    bestBuild.dmg.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }) +
    '</div>\n                </div>\n                <div style="text-align:right">\n                    <div class="opt-hero-label">Net / day</div>\n                    <div class="opt-hero-net ' +
    (-bestBuild.spent >= 0 ? "positive" : "negative") +
    '">' +
    fmtNet(-bestBuild.spent) +
    '</div>\n                </div>\n            </div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Turnover / day</div>\n                    <div class="opt-stat-value positive">$' +
    bestBuild.profit.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost / day</div>\n                    <div class="opt-stat-value negative">$' +
    bestBuild.cost.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Bounty / day</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.profitBreakdown.bounty.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.startingCost.toFixed(2) +
    '</div>\n                </div>\n            </div>\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats</th><th>Buy Price</th></tr></thead>\n                <tbody>' +
    gearRows +
    "</tbody>\n            </table>\n        </div>";
}
function renderPillDebuffForm() {
  const panel = $("buildPanel");
  _terminateOptWorker();
  const currentSkills = extractPlayerSkills(state.lastAnalysis.user),
    currentLvl = state.lastAnalysis.user?.leveling?.level || "?",
    playerName = state.lastAnalysis.user?.username || "(loaded player)",
    skillRows = SKILL_DISPLAY.map(
      ([key, label]) =>
        "<tr><td>" +
        label +
        "</td><td>" +
        (currentSkills[key] ?? 0) +
        "</td></tr>",
    ).join("");
  ((panel.innerHTML =
    '\n        <div class="build-panel">\n            <h3>Pill debuff · best gear</h3>\n            <div class="gc-intro">\n                Lock <b>' +
    playerName +
    "</b>'s skills (lvl " +
    currentLvl +
    ') and find the most-profitable gear\n                during the 16-hour pill debuff. Defaults: pill <b>off</b>, damage <b>−60%</b>,\n                fight time <b>16 h</b>. Daily-fixed income (companies, work, daily bonus, weekly\n                cases) <b>and item loot</b> are excluded — only chests / red chests / bounty count.\n                <br><br>\n                Auto-runs <b>twice</b> (bread vs no food) and shows whichever wins.\n                "none" tier is included per slot so the optimizer can recommend skipping a piece.\n            </div>\n            <table class="opt-table" style="margin:8px 0">\n                <thead><tr><th>Skill</th><th>Current level</th></tr></thead>\n                <tbody>' +
    skillRows +
    '</tbody>\n            </table>\n            <div class="opt-target-row" style="margin-top:14px">\n                <label for="pdBountyInput">Bounty ($ per 1000 dmg)</label>\n                <span class="opt-target-prefix">$</span>\n                <input type="number" id="pdBountyInput" value="' +
    _pillDebuff.bounty +
    '" step="0.01" min="0" />\n            </div>\n            <div class="opt-target-row">\n                <label for="pdHoursInput">Fight hours</label>\n                <input type="number" id="pdHoursInput" value="' +
    _pillDebuff.hours +
    '" step="1" min="1" max="24" />\n                <span class="opt-target-hint">debuff period (damage fixed at −60%)</span>\n            </div>\n            <button type="button" class="opt-be-btn" id="pdRunBtn">Run pill-debuff simulation →</button>\n            <div id="pdResultContainer"></div>\n        </div>'),
    document.getElementById("pdRunBtn").addEventListener("click", () => {
      const rawBounty = Number(
          document.getElementById("pdBountyInput").value,
        ),
        rawHours = Number(document.getElementById("pdHoursInput").value);
      ((_pillDebuff.bounty =
        Number.isFinite(rawBounty) && rawBounty >= 0 ? rawBounty : 0),
        (_pillDebuff.hours =
          Number.isFinite(rawHours) && rawHours >= 1 ? rawHours : 16),
        runPillDebuff(currentSkills));
    }));
}
function runPillDebuff(currentSkills) {
  const resultEl = document.getElementById("pdResultContainer"),
    btn = document.getElementById("pdRunBtn");
  ((btn.disabled = true),
    (btn.textContent = "Optimizing pill-debuff gear…"),
    (resultEl.innerHTML =
      '\n        <div class="opt-be-card">\n            <div class="opt-progress-wrap">\n                <div class="opt-progress-label" id="pdProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="pdProgressBar" style="width:0%"></div></div>\n            </div>\n        </div>'));
  const sharedUserData = {
      ...buildOptimizerUserData(state.lastAnalysis),
      fixedSkills: currentSkills,
      bountyOverride: _pillDebuff.bounty,
      usePillOverride: false,
      hoursOverride: _pillDebuff.hours,
      dmgMultiplierOverride: 1 - PILL_DEBUFF_DMG_PENALTY_PCT / 100,
      excludeDailyIncomeOverride: true,
      excludeItemLootOverride: true,
      objectiveOverride: "minSpent",
      gearTiersOverride: {
        none: true,
        basic: true,
        green: true,
        blue: true,
        purple: true,
        gold: true,
      },
      spentLimitOverride: 1000000000,
    },
    foodVariants = [
      { label: "bread", foodTypeOverride: "bread" },
      { label: "no food", foodTypeOverride: "none" },
    ],
    results = [],
    startTime = Date.now(),
    runNext = (idx) => {
      if (idx >= foodVariants.length) {
        (results.sort(
          (a, b) =>
            (a.result.bestBuild?.spent ?? Infinity) -
            (b.result.bestBuild?.spent ?? Infinity),
        ),
          renderPillDebuffResult(resultEl, results),
          (btn.disabled = false),
          (btn.textContent = "Re-run pill-debuff simulation"));
        return;
      }
      const variant = foodVariants[idx],
        variantUserData = {
          ...sharedUserData,
          foodTypeOverride: variant.foodTypeOverride,
        },
        cacheKey = _buildCacheKey("sustainable", variantUserData);
      if (_buildCache.has(cacheKey))
        return (
          results.push({
            label: variant.label,
            foodType: variant.foodTypeOverride,
            result: _buildCache.get(cacheKey),
          }),
          runNext(idx + 1)
        );
      const runId = ++_optRunId;
      _terminateOptWorker();
      const worker = _ensureOptWorker();
      ((worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.runId !== runId) return;
        if (msg.type === "progress") {
          const pct = Math.round(
              (msg.g / msg.total) * 100,
            ),
            barEl = document.getElementById("pdProgressBar"),
            labelEl = document.getElementById("pdProgressLabel");
          if (barEl) barEl.style.width = pct + "%";
          if (labelEl)
            labelEl.textContent =
              variant.label +
              ": gear " +
              msg.g +
              "/" +
              msg.total +
              " · " +
              ((Date.now() - startTime) / 1000).toFixed(1) +
              "s";
        } else
          msg.type === "result" &&
            (_buildCache.set(cacheKey, msg.result),
            results.push({
              label: variant.label,
              foodType: variant.foodTypeOverride,
              result: msg.result,
            }),
            runNext(idx + 1));
      }),
        worker.postMessage({
          runId,
          presetName: "sustainable",
          userData: variantUserData,
        }));
    };
  runNext(0);
}
function renderPillDebuffResult(resultEl, results) {
  const winner = results[0],
    bestBuild = winner?.result?.bestBuild;
  if (!bestBuild) {
    resultEl.innerHTML =
      '\n            <div class="opt-be-card">\n                <div class="opt-be-title">Pill debuff · no feasible gear</div>\n                <div class="build-loading">No feasible build for either food choice. Try lowering bounty or the dmg penalty.</div>\n            </div>';
    return;
  }
  const fmtNet = (v) =>
      (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
    comparisonRows = results.map((entry) => {
      const build = entry.result.bestBuild,
        isWinner = entry === winner,
        winnerBadge = isWinner
          ? '<span class="opt-pd-winner">winner</span>'
          : "",
        netStr = build ? fmtNet(-build.spent) : "—",
        dmgStr = build
          ? build.dmg.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })
          : "—";
      return (
        '<tr class="' +
        (isWinner ? "opt-pd-winner-row" : "") +
        '">\n            <td>' +
        entry.label +
        " " +
        winnerBadge +
        "</td>\n            <td>" +
        dmgStr +
        "</td>\n            <td>$" +
        (build ? build.cost.toFixed(2) : "—") +
        "</td>\n            <td>$" +
        (build ? build.profit.toFixed(2) : "—") +
        "</td>\n            <td>" +
        netStr +
        "</td>\n        </tr>"
      );
    }).join(""),
    gearRows = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      .map((slot) => {
        const item = bestBuild.gear[slot],
          statsStr = Object.entries(item)
            .filter(
              ([key]) =>
                key !== "type" &&
                key !== "price" &&
                key !== "buyPrice",
            )
            .map(([key, val]) => key + ": " + val)
            .join(", ");
        return (
          '<tr>\n            <td style="text-transform:capitalize">' +
          slot +
          '</td>\n            <td><span class="opt-tier ' +
          item.type +
          '">' +
          item.type +
          "</span></td>\n            <td>" +
          (statsStr || '<span style="color:#6b6f80">—</span>') +
          "</td>\n            <td>$" +
          item.buyPrice.toFixed(2) +
          "</td>\n        </tr>"
        );
      })
      .join(""),
    emptySlotsCount = ["gun", "helmet", "chest", "pant", "glove", "boot"].filter(
      (slot) => bestBuild.gear[slot].type === "none",
    ).length,
    emptySlotsBanner =
      emptySlotsCount > 0
        ? '<div class="gc-intro" style="margin-bottom:10px"><b>' +
          emptySlotsCount +
          "</b> slot" +
          (emptySlotsCount === 1 ? "" : "s") +
          " optimally <b>empty</b> during the debuff.</div>"
        : "";
  resultEl.innerHTML =
    '\n        <div class="opt-be-card">\n            <div class="opt-be-title">Pill debuff · fight-only profit · ' +
    _pillDebuff.hours +
    "h · −" +
    PILL_DEBUFF_DMG_PENALTY_PCT +
    '% dmg · item loot excluded</div>\n            <div class="opt-section-title" style="margin-top:0">Food comparison</div>\n            <table class="opt-bd-table" style="margin-bottom:10px">\n                <thead><tr><th>Food</th><th>Damage</th><th>Cost</th><th>Profit</th><th>Net</th></tr></thead>\n                <tbody>' +
    comparisonRows +
    "</tbody>\n            </table>\n            " +
    emptySlotsBanner +
    '\n            <div class="opt-section-title">Winning build: <b>' +
    winner.label +
    '</b></div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Damage (debuffed)</div>\n                    <div class="opt-stat-value">' +
    bestBuild.dmg.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Net / debuff</div>\n                    <div class="opt-stat-value ' +
    (-bestBuild.spent >= 0 ? "positive" : "negative") +
    '">' +
    fmtNet(-bestBuild.spent) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.cost.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Fight profit</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.profit.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.startingCost.toFixed(2) +
    '</div>\n                </div>\n            </div>\n            <details class="opt-breakdown">\n                <summary>Turnover breakdown · $' +
    bestBuild.profit.toFixed(2) +
    '/debuff (item loot excluded)</summary>\n                <table class="opt-bd-table">\n                    <tr><td>Chests (landed × loot% × case$)</td><td>$' +
    bestBuild.profitBreakdown.chests.toFixed(2) +
    "</td></tr>\n                    <tr><td>Red chests</td><td>$" +
    bestBuild.profitBreakdown.redChests.toFixed(2) +
    "</td></tr>\n                    <tr><td>Bounty</td><td>$" +
    bestBuild.profitBreakdown.bounty.toFixed(2) +
    '</td></tr>\n                    <tr class="total"><td>Total</td><td>$' +
    bestBuild.profit.toFixed(2) +
    '</td></tr>\n                </table>\n            </details>\n            <details class="opt-breakdown">\n                <summary>Cost breakdown · $' +
    bestBuild.cost.toFixed(2) +
    '/debuff</summary>\n                <table class="opt-bd-table">\n                    <tr><td>Guns</td><td>$' +
    bestBuild.costBreakdown.guns.toFixed(2) +
    "</td></tr>\n                    <tr><td>Equipment</td><td>$" +
    bestBuild.costBreakdown.equipment.toFixed(2) +
    "</td></tr>\n                    <tr><td>Bullets</td><td>$" +
    bestBuild.costBreakdown.bullets.toFixed(2) +
    "</td></tr>\n                    <tr><td>Food</td><td>$" +
    bestBuild.costBreakdown.food.toFixed(2) +
    "</td></tr>\n                    <tr><td>Pills</td><td>$" +
    bestBuild.costBreakdown.pills.toFixed(2) +
    '</td></tr>\n                    <tr class="total"><td>Total</td><td>$' +
    bestBuild.cost.toFixed(2) +
    '</td></tr>\n                </table>\n            </details>\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats</th><th>Buy Price</th></tr></thead>\n                <tbody>' +
    gearRows +
    "</tbody>\n            </table>\n        </div>";
}
function runBreakEven(presetKey, userData, bestBuild, btn, resultEl) {
  ((btn.disabled = true),
    (btn.textContent = "Computing break-even gear…"),
    (resultEl.innerHTML =
      '\n        <div class="opt-be-card">\n            <div class="opt-progress-wrap">\n                <div class="opt-progress-label" id="beProgressLabel">Starting…</div>\n                <div class="opt-progress-track"><div class="opt-progress-bar" id="beProgressBar" style="width:0%"></div></div>\n            </div>\n        </div>'));
  const breakEvenUserData = {
      ...userData,
      fixedSkills: bestBuild.skills,
      spentLimitOverride: 0,
      gearTiersOverride: {
        basic: true,
        green: true,
        blue: true,
        purple: true,
        gold: true,
      },
      foodTypeOverride: "meat",
    },
    cacheKey = _buildCacheKey(presetKey, breakEvenUserData);
  if (_buildCache.has(cacheKey)) {
    (renderBreakEvenResult(resultEl, bestBuild, _buildCache.get(cacheKey)),
      (btn.disabled = false),
      (btn.textContent = "Re-run break-even"));
    return;
  }
  const runId = ++_optRunId;
  _terminateOptWorker();
  const worker = _ensureOptWorker(),
    startTime = Date.now();
  ((worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.runId !== runId) return;
    if (msg.type === "progress") {
      const pct = Math.round(
          (msg.g / msg.total) * 100,
        ),
        barEl = document.getElementById("beProgressBar"),
        labelEl = document.getElementById("beProgressLabel");
      if (barEl) barEl.style.width = pct + "%";
      if (labelEl)
        labelEl.textContent =
          "Searching gear " +
          msg.g +
          "/" +
          msg.total +
          " · " +
          ((Date.now() - startTime) / 1000).toFixed(1) +
          "s";
    } else
      msg.type === "result" &&
        (_buildCache.set(cacheKey, msg.result),
        renderBreakEvenResult(resultEl, bestBuild, msg.result),
        (btn.disabled = false),
        (btn.textContent = "Re-run break-even"));
  }),
    worker.postMessage({
      runId,
      presetName: presetKey,
      userData: breakEvenUserData,
    }));
}
function renderBreakEvenResult(resultEl, originalBuild, optResult) {
  const bestBuild = optResult.bestBuild;
  if (!bestBuild) {
    resultEl.innerHTML =
      '\n            <div class="opt-be-card">\n                <div class="opt-be-title">Break-even gear (same skills)</div>\n                <div class="build-loading">No gear in this preset\'s allowed tiers can break even with these skills — the build is fundamentally over-budget at $0 net.</div>\n            </div>';
    return;
  }
  const dmgDelta = bestBuild.dmg - originalBuild.dmg,
    dmgPct = (bestBuild.dmg / originalBuild.dmg) * 100 - 100,
    fmtNet = (v) =>
      (v >= 0 ? "+$" : "-$") + Math.abs(v).toFixed(2),
    gearRows = ["gun", "helmet", "chest", "pant", "glove", "boot"]
      .map((slot) => {
        const newItem = bestBuild.gear[slot],
          oldItem = originalBuild.gear[slot],
          tierChanged = newItem.type !== oldItem.type,
          statsStr = Object.entries(newItem)
            .filter(
              ([key]) =>
                key !== "type" &&
                key !== "price" &&
                key !== "buyPrice",
            )
            .map(([key, val]) => key + ": " + val)
            .join(", ");
        return (
          "<tr" +
          (tierChanged ? ' class="opt-be-changed"' : "") +
          '>\n            <td style="text-transform:capitalize">' +
          slot +
          '</td>\n            <td><span class="opt-tier ' +
          newItem.type +
          '">' +
          newItem.type +
          "</span>" +
          (tierChanged
            ? ' <span class="opt-be-was">was ' + oldItem.type + "</span>"
            : "") +
          "</td>\n            <td>" +
          statsStr +
          "</td>\n            <td>$" +
          newItem.buyPrice.toFixed(2) +
          "</td>\n        </tr>"
        );
      })
      .join("");
  resultEl.innerHTML =
    '\n        <div class="opt-be-card">\n            <div class="opt-be-title">Break-even gear · same skills, net $0/day</div>\n            <div class="opt-stats">\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Damage</div>\n                    <div class="opt-stat-value">' +
    bestBuild.dmg.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    }) +
    '</div>\n                    <div class="opt-stat-sub ' +
    (dmgDelta >= 0 ? "positive" : "negative") +
    '">' +
    (dmgDelta >= 0 ? "+" : "") +
    Math.round(dmgDelta).toLocaleString() +
    " (" +
    (dmgPct >= 0 ? "+" : "") +
    dmgPct.toFixed(1) +
    '%)</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Net / day</div>\n                    <div class="opt-stat-value ' +
    (-bestBuild.spent >= 0 ? "positive" : "negative") +
    '">' +
    fmtNet(-bestBuild.spent) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Cost / day</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.cost.toFixed(2) +
    '</div>\n                </div>\n                <div class="opt-stat">\n                    <div class="opt-stat-label">Starting cost</div>\n                    <div class="opt-stat-value">$' +
    bestBuild.startingCost.toFixed(2) +
    '</div>\n                </div>\n            </div>\n            <table class="opt-table">\n                <thead><tr><th>Slot</th><th>Tier</th><th>Stats</th><th>Buy Price</th></tr></thead>\n                <tbody>' +
    gearRows +
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
