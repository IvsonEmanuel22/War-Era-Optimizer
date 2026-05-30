import { NAMES } from "./config.js";
import { state } from "./state.js";
import { $, setStatus, clearDebug, renderDebug, escapeHtml } from "./utils.js";
import { fetchByUserId, fetchDirect } from "./api.js";
import { _buildCache, renderBuildPanel } from "./ui/buildPanel.js";
import { PlayerEconomy } from "./models/PlayerEconomy.js";

export async function analyze(userId, usernameArg) {
  const query = usernameArg ?? $("username").value.trim();
  if (!query && !userId) {
    setStatus("Insira um nome de usuário", "error");
    return;
  }

  $("goBtn").disabled = true;
  $("results").style.display = "none";
  clearDebug();
  _buildCache.clear();

  const onCompanyProgress = (partial, loaded, total) => {
    if (partial.companies.length > 0) render(partial);
    setStatus(`Empresa ${loaded}/${total} — ${partial.user?.username || query}`);
  };

  try {
    let data;
    if (userId) {
      data = await fetchByUserId(userId, { onCompanyProgress });
    } else {
      data = await fetchDirect(query, { onCompanyProgress });
    }

    if (data.error) { setStatus(data.error, "error"); return; }
    if (data.needsPick) { renderUserPicker(data.query, data.candidates); return; }
    if (!data.companies?.length) {
      setStatus((data.user?.username || query) + " não tem empresas", "warn");
      return;
    }

    render(data);

    const level         = data.user?.leveling?.level;
    const userLabel     = (data.user?.username || query) + (level ? " lvl " + level : "");
    const truncatedNote = data.companiesTruncated
      ? " — ⚠ Bug de paginação da WarEra limitou a lista; o jogador pode ter mais empresas"
      : "";

    setStatus(
      `Carregadas ${data.companies.length} empresas de ${userLabel}${truncatedNote}`,
      data.companiesTruncated ? "warn" : "",
    );
    $("buildBar").style.display   = "flex";
    $("buildDivider").style.display = "block";

  } catch (err) {
    let detail = "";
    if (err.kind === "network") {
      detail = " — todos os hosts da API WarEra (api2/api6/api3/api4) estão inacessíveis."
             + " Causas comuns: (1) Cloudflare retornando 503 sem cabeçalhos CORS;"
             + " (2) sua rede/VPN/bloqueador está bloqueando *.warera.io;"
             + " (3) WarEra está fora do ar.";
    } else if (err.status >= 500) {
      detail = " — API da WarEra instável. Tente novamente em um minuto.";
    } else if (err.status >= 400) {
      detail = " — API rejeitou a requisição. Tente outro nome de usuário.";
    }
    setStatus("Requisição falhou: " + (err?.message || String(err)) + detail, "error");
    renderDebug(err);
  } finally {
    $("goBtn").disabled = false;
  }
}

export function renderUserPicker(query, candidates) {
  const statusEl = $("status");
  const buttonsHtml = candidates
    .map(c =>
      `<button type="button" class="user-pick-btn" data-id="${escapeHtml(c.id)}" data-name="${escapeHtml(c.username)}">${escapeHtml(c.username)}</button>`,
    )
    .join(" ");

  statusEl.className = "warn";
  statusEl.innerHTML = `Múltiplos usuários correspondem a "${escapeHtml(query)}" — escolha um: ${buttonsHtml}`;
  statusEl.querySelectorAll(".user-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $("username").value = btn.dataset.name;
      analyze(btn.dataset.id, btn.dataset.name);
    });
  });
}

export function render(data) {
  const economy = new PlayerEconomy(
    data.companies || [],
    data.prices    || {},
    data.user,
    data.employer  ?? null,
  );
  const prices  = data.prices || {};
  const totals  = economy.totals;

  const bestEntrep    = economy.bestEntrep;
  const energyProfitDay = economy.energyProfit;

  // ─── Linhas da tabela ─────────────────────────────────────────────────────
  const rows = economy.companies
    .filter(co => co.recipe)
    .map(co => {
      const aeNet     = economy.aeNetFor(co);
      const wkNet     = economy.wkNetFor(co);
      const matCost   = economy.matCostFor(co);
      const supplied  = economy.suppliedFor(co);

      const fifoAdjPerItem = economy.workerFifoAdjPerItemFor(co);
      const workerRows = co.workers.map(w => ({
        username:   w.username,
        level:      w.level,
        energy:     w.energy,
        production: w.production,
        fidelity:   w.fidelity,
        wagePerPp:  w.wagePerPp,
        ppDay:      w.ppPerDay,
        itemsDay:   w.itemsPerDay,
        wageDay:    w.wagePerDay,
        netDay:     w.netPerDay(matCost, co.sellPrice) - fifoAdjPerItem * w.itemsPerDay,
      }));

      return {
        id:             co.id,
        name:           co.name,
        code:           co.itemCode,
        isRaw:          co.isRaw,
        active:         co.active,
        disabledAt:     co.disabledAt,
        bonus:          co.bonus.total,
        aeLevel:        co.aeLevel,
        sellPrice:      co.sellPrice,
        inputParts:     (co.recipe.inputs ?? []).map(i => `${i.amount}× ${NAMES[i.item] ?? i.item}`),
        suppliedInputs: supplied,
        matCostMarket:  matCost,
        aeItemsDay:     co.aeItemsPerDay,
        aeNetDay:       aeNet,
        workerRows,
        workerItemsDay: co.workerItemsPerDay,
        workerWageDay:  co.wagesPerDay,
        workerNetDay:   wkNet,
        itemsDay:       co.totalItemsPerDay,
        profitDay:      aeNet + wkNet,
      };
    })
    .sort((a, b) => b.profitDay - a.profitDay);

  // ─── Atualiza state para o sistema de builds ──────────────────────────────
  state.lastAnalysis = {
    user:    data.user,
    prices,
    employer: economy.employer,
    economy,
    totals: {
      aeNet:                 totals.totalAeNet,
      workersNet:            totals.totalWkNet,
      entrep:                totals.entrepProfit,
      bestEntrepProfitPerPP: totals.bestEntrepProfitPerPP,
      energy:                totals.energyProfit,
      grand:                 totals.grand,
      avgPerCompany:         totals.avg,
      avgAePerCompany:       totals.avgAe,
      companyCount:          totals.count,
    },
  };

  if (state.activeBuild) renderBuildPanel();

  // ─── Renderização ─────────────────────────────────────────────────────────
  const fmt  = (n, d = 2) => "$" + Math.abs(n).toFixed(d);
  const fmtP = n => (n >= 0 ? "+$" : "-$") + Math.abs(n).toFixed(2);

  const signCss = n => n >= 0 ? "positive" : "negative";

  // Grand total card
  $("grandTotal").innerHTML = `
    <div class="grand-total-card">
      <div>
        <div class="gt-label">Lucro total / dia</div>
        <div class="gt-value ${signCss(totals.grand)}">${fmtP(totals.grand)}</div>
        <div class="gt-subline">Lucro total ativo / dia <b class="${signCss(totals.activeGrand)}">${fmtP(totals.activeGrand)}</b></div>
      </div>
      <div class="gt-breakdown">
        <span>Empreendedorismo <b>${fmtP(totals.entrepProfit)}</b></span>
        <span>Energia <b>${fmtP(totals.energyProfit)}</b></span>
        <span>Empresas (AE) <b>${fmtP(totals.totalAeNet)}</b></span>
        <span>Trabalhadores <b>${fmtP(totals.totalWkNet)}</b></span>
      </div>
    </div>`;

  // Cards pessoais
  const employer = economy.employer;
  const energyCardHtml = energyProfitDay !== null
    ? `<div class="stat-card">
        <div class="stat-label">Lucro energia / dia</div>
        <div class="stat-value ${signCss(energyProfitDay)}">${fmt(energyProfitDay)}</div>
        <div class="stat-sub">${fmt(employer.netWagePerPP, 3)} líquido/PP · bruto ${fmt(employer.grossWage, 3)} − imposto ${employer.incomeTaxPct}% (fid. ${employer.fidelity}%) · ${escapeHtml(employer.companyName)} · ${escapeHtml(employer.countryName)}</div>
      </div>`
    : `<div class="stat-card">
        <div class="stat-label">Lucro energia / dia</div>
        <div class="stat-value muted">—</div>
        <div class="stat-sub">sem empregador atual</div>
      </div>`;

  const entrepCardHtml = bestEntrep
    ? `<div class="stat-card">
        <div class="stat-label">Lucro empreend. / dia</div>
        <div class="stat-value ${signCss(totals.entrepProfit)}">${fmt(totals.entrepProfit)}</div>
        <div class="stat-sub">melhor em ${escapeHtml(bestEntrep.companyName)}</div>
      </div>`
    : `<div class="stat-card">
        <div class="stat-label">Lucro empreend. / dia</div>
        <div class="stat-value muted">—</div>
      </div>`;

  const skills = data.user?.skills ?? {};
  $("summaryPersonal").innerHTML = `
    <div class="stat-card"><div class="stat-label">Empreendedorismo</div><div class="stat-value">${skills.entrepreneurship?.total ?? 0}</div></div>
    <div class="stat-card"><div class="stat-label">Energia</div><div class="stat-value">${skills.energy?.total ?? 0}</div></div>
    <div class="stat-card"><div class="stat-label">Produção</div><div class="stat-value">${skills.production?.total ?? 0}</div></div>
    ${entrepCardHtml}
    ${energyCardHtml}`;

  $("personalLabel").style.display  = "block";
  $("summaryDivider").style.display = "block";
  $("companiesLabel").style.display = "block";

  // Summary de empresas
  $("summary").innerHTML = `
    <div class="stat-card"><div class="stat-label">Empresas</div><div class="stat-value">${rows.length}</div></div>
    <div class="stat-card">
      <div class="stat-label">Trabalhadores</div>
      <div class="stat-value">${totals.totalWorkers}<span class="muted" style="font-size:16px;font-weight:500;">/${economy.mgmtSlots}</span></div>
      <div class="stat-sub">nível de gestão ${economy.mgmtLevel}</div>
    </div>
    <div class="stat-card"><div class="stat-label">Salários / dia</div><div class="stat-value negative">$${totals.totalWages.toFixed(2)}</div></div>
    <div class="stat-card">
      <div class="stat-label">AE líq. / dia</div>
      <div class="stat-value ${signCss(totals.totalAeNet)}">$${totals.totalAeNet.toFixed(2)}</div>
      <div class="stat-sub">todas as ${rows.length} empresas</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">AE líq. / dia (só ativas)</div>
      <div class="stat-value ${signCss(totals.activeAeNet)}">$${totals.activeAeNet.toFixed(2)}</div>
      <div class="stat-sub">${totals.activeAeCount}/${rows.length} empresas ativas</div>
    </div>
    <div class="stat-card"><div class="stat-label">Trabalhadores líq. / dia</div><div class="stat-value ${signCss(totals.totalWkNet)}">$${totals.totalWkNet.toFixed(2)}</div></div>
    <div class="stat-card"><div class="stat-label">Líquido total / dia</div><div class="stat-value ${signCss(totals.total)}">$${totals.total.toFixed(2)}</div></div>
    <div class="stat-card"><div class="stat-label">Média líq. / dia por empresa</div><div class="stat-value ${signCss(totals.avg)}">$${totals.avg.toFixed(2)}</div></div>`;

  // Tabela de empresas
  const tbody = $("tbody");
  tbody.innerHTML = rows.map(row => {
    const typeTag     = row.isRaw
      ? '<span class="tag raw">RAW</span>'
      : '<span class="tag processed">PROC</span>';
    const disabledTag = row.active ? "" :
      `<span class="tag aeoff" title="Empresa inativa${row.disabledAt ? " desde " + new Date(row.disabledAt).toLocaleString() : ""} — excluída do total ativo">INATIVA</span>`;
    const rowClass    = row.active ? "" : ' class="row-ae-off"';
    const workerBtn   = row.workerRows.length === 0
      ? '<span class="muted">—</span>'
      : `<button class="expand-btn" data-target="w-${row.id}">${row.workerRows.length} ▾</button>`;

    const mainRow = `
      <tr${rowClass}>
        <td>${escapeHtml(row.name)}${disabledTag}</td>
        <td>${NAMES[row.code] ?? row.code} ${typeTag}</td>
        <td>${row.bonus.toFixed(2)}%</td>
        <td>${row.aeLevel}</td>
        <td>${row.aeItemsDay.toFixed(3)}</td>
        <td>${workerBtn}</td>
        <td>${row.workerItemsDay.toFixed(3)}</td>
        <td>${row.itemsDay.toFixed(3)}</td>
        <td>$${row.sellPrice.toFixed(4)}</td>
        <td class="muted">${row.inputParts.length ? row.inputParts.join(", ") : "—"}</td>
        <td class="muted">${row.suppliedInputs.length
          ? row.suppliedInputs.map(s => `${escapeHtml(s.name)}: ${s.supplied.toFixed(3)}/${s.ownProd.toFixed(3)}`).join("<br>")
          : "—"}</td>
        <td>$${row.workerWageDay.toFixed(2)}</td>
        <td class="${signCss(row.aeNetDay)}">${row.aeNetDay >= 0 ? "+" : ""}$${row.aeNetDay.toFixed(2)}</td>
        <td class="${signCss(row.workerNetDay)}">${row.workerNetDay >= 0 ? "+" : ""}$${row.workerNetDay.toFixed(2)}</td>
        <td class="profit-cell ${signCss(row.profitDay)}">${row.profitDay >= 0 ? "+" : ""}$${row.profitDay.toFixed(2)}</td>
      </tr>`;

    if (row.workerRows.length === 0) return mainRow;

    const workerDetail = `
      <tr class="worker-row" id="w-${row.id}" style="display:none;">
        <td colspan="15">
          <div class="worker-block">
            <table class="worker-table">
              <thead><tr>
                <th>Trabalhador</th><th>Nível</th><th>Energia</th><th>Produção</th>
                <th>Sal./PP</th><th>Fidelidade</th>
                <th>PP/dia</th><th>Items/dia</th><th>Sal./dia</th><th>Líq./dia</th>
              </tr></thead>
              <tbody>
                ${row.workerRows.map(wr => `
                  <tr>
                    <td>${escapeHtml(wr.username)}</td>
                    <td>${wr.level}</td>
                    <td>${wr.energy}</td>
                    <td>${wr.production}</td>
                    <td>$${wr.wagePerPp.toFixed(3)}</td>
                    <td>${wr.fidelity}%</td>
                    <td>${wr.ppDay.toFixed(3)}</td>
                    <td>${wr.itemsDay.toFixed(3)}</td>
                    <td>$${wr.wageDay.toFixed(2)}</td>
                    <td class="${signCss(wr.netDay)}">${wr.netDay >= 0 ? "+" : ""}$${wr.netDay.toFixed(2)}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </td>
      </tr>`;

    return mainRow + workerDetail;
  }).join("");

  // Expand/collapse workers
  tbody.querySelectorAll(".expand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const open = target.style.display !== "none";
      target.style.display = open ? "none" : "table-row";
      btn.textContent = btn.textContent.replace(/[▾▴]/, open ? "▾" : "▴");
    });
  });

  $("results").style.display = "block";
}
