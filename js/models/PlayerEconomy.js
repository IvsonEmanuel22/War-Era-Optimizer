import { NAMES } from '../config.js';
import { Company } from './Company.js';

// Agrega todas as empresas do jogador e resolve:
//   1. ownership   — produção e custo médio por item
//   2. consumerFifo — alocação FIFO de insumos por empresa consumidora
//   3. producerFifo — alocação FIFO de consumo sobre produtoras de matéria-prima
//
// FIFO usa a ordem de chegada da API como prioridade de abastecimento.
// Empresas inativas são excluídas dos três passes.
//
// O segundo argumento opcional (apiUser) permite que a classe calcule também
// a renda pessoal do jogador (energia e empreendedorismo).
export class PlayerEconomy {
  // itemCode -> { total: unidades/dia, wages: $/dia }
  #ownership = {};
  // itemCode -> unidades/dia consumidas por empresas processadoras
  #consumption = {};
  // itemCode -> min(own, demand) — oferta interna disponível
  #internalSupply = {};
  // itemCode -> custo médio ponderado por unidade (salários/produção)
  #avgCost = {};
  // companyId -> { alloc: { itemCode: qty }, total: totalItemsPerDay }
  #consumerFifo = new Map();
  // companyId -> { consumed: qty, total: totalItemsPerDay }
  #producerFifo = new Map();
  // skills vindas de apiUser.skills (pode ser {})
  #skills = {};
  // cache lazy de bestEntrep (calculado uma única vez por instância)
  #bestEntrepCache = undefined;

  constructor(apiCompanies, prices, apiUser = null, employer = null) {
    this.prices    = prices;
    this.employer  = employer ?? null;
    this.#skills   = apiUser?.skills ?? {};
    this.companies = apiCompanies.map(c => new Company(c, prices));
    this.#buildOwnership();
    this.#runConsumerFifo();
    this.#runProducerFifo();
  }

  // ─── Getters de skill ────────────────────────────────────────────────────

  get #entrepSkill()     { return this.#skills.entrepreneurship?.total ?? 0; }
  get #energySkill()     { return this.#skills.energy?.total           ?? 0; }
  get #productionSkill() { return this.#skills.production?.total       ?? 0; }

  get mgmtLevel() { return this.#skills.management?.level ?? 0; }
  get mgmtSlots() {
    return this.#skills.management?.total ?? (4 + 2 * this.mgmtLevel);
  }

  // ─── Pre-passe 1: ownership + consumption ────────────────────────────────

  #buildOwnership() {
    for (const co of this.companies) {
      if (!co.active || !co.recipe) continue;

      const { itemCode, aeItemsPerDay, workerItemsPerDay, wagesPerDay, recipe } = co;
      const total = aeItemsPerDay + workerItemsPerDay;

      const own = this.#ownership[itemCode] ??= { total: 0, wages: 0 };
      own.total += total;
      own.wages += wagesPerDay;

      for (const inp of recipe.inputs) {
        this.#consumption[inp.item] = (this.#consumption[inp.item] ?? 0) + total * inp.amount;
      }
    }

    for (const [item, { total, wages }] of Object.entries(this.#ownership)) {
      const demand = this.#consumption[item] ?? 0;
      this.#internalSupply[item] = Math.min(total, demand);
      this.#avgCost[item]        = total > 0 ? wages / total : 0;
    }
  }

  // ─── Pre-passe 2: consumer FIFO ──────────────────────────────────────────

  #runConsumerFifo() {
    const remaining = { ...this.#internalSupply };

    for (const co of this.companies) {
      if (!co.active || !co.recipe || co.recipe.inputs.length === 0) continue;

      const total = co.totalItemsPerDay;
      const alloc = {};

      for (const inp of co.recipe.inputs) {
        const need  = total * inp.amount;
        const avail = remaining[inp.item] ?? 0;
        const take  = Math.min(avail, need);
        remaining[inp.item] = avail - take;
        alloc[inp.item] = take;
      }

      this.#consumerFifo.set(co.id, { alloc, total });
    }
  }

  // ─── Pre-passe 3: producer FIFO ──────────────────────────────────────────

  #runProducerFifo() {
    // Soma do que foi alocado via FIFO para consumidoras, por item
    const totalConsumed = {};
    for (const { alloc } of this.#consumerFifo.values()) {
      for (const [item, qty] of Object.entries(alloc)) {
        totalConsumed[item] = (totalConsumed[item] ?? 0) + qty;
      }
    }

    const remaining = { ...totalConsumed };

    for (const co of this.companies) {
      if (!co.active || !co.recipe || co.recipe.inputs.length > 0) continue;

      const total    = co.totalItemsPerDay;
      const consumed = Math.min(remaining[co.itemCode] ?? 0, total);
      remaining[co.itemCode] = (remaining[co.itemCode] ?? 0) - consumed;
      this.#producerFifo.set(co.id, { consumed, total });
    }
  }

  // ─── Métodos públicos de consulta ────────────────────────────────────────

  // Custo de matéria-prima por item de output, baseado na alocação FIFO desta empresa
  matCostFor(co) {
    const { alloc = {}, total = 0 } = this.#consumerFifo.get(co.id) ?? {};
    if (total <= 0) return 0;

    let cost = 0;
    for (const inp of co.recipe.inputs) {
      const need      = total * inp.amount;
      const fifoQty   = alloc[inp.item] ?? 0;
      const marketQty = need - fifoQty;
      cost += (marketQty * (this.prices[inp.item] ?? 0)
             + fifoQty   * (this.#avgCost[inp.item] ?? 0)) / total;
    }
    return cost;
  }

  // Lucro líquido AE/dia (já com ajuste FIFO de output para produtoras RAW)
  aeNetFor(co) {
    const matCost = this.matCostFor(co);
    let net = co.aeItemsPerDay * (co.sellPrice - matCost);

    const pf = this.#producerFifo.get(co.id);
    if (pf?.consumed > 0 && pf.total > 0) {
      const adj = pf.consumed * (co.sellPrice - (this.#avgCost[co.itemCode] ?? 0));
      net -= adj * (co.aeItemsPerDay / pf.total);
    }
    return net;
  }

  // Lucro líquido workers/dia (já com ajuste FIFO de output)
  wkNetFor(co) {
    const matCost = this.matCostFor(co);
    let net = co.workers.reduce((sum, w) => sum + w.netPerDay(matCost, co.sellPrice), 0);

    const pf = this.#producerFifo.get(co.id);
    if (pf?.consumed > 0 && pf.total > 0) {
      const adj = pf.consumed * (co.sellPrice - (this.#avgCost[co.itemCode] ?? 0));
      net -= adj * (co.workerItemsPerDay / pf.total);
    }
    return net;
  }

  profitFor(co) {
    return this.aeNetFor(co) + this.wkNetFor(co);
  }

  // Lista de insumos abastecidos internamente por esta empresa (para exibição)
  suppliedFor(co) {
    const { alloc = {} } = this.#consumerFifo.get(co.id) ?? {};
    return (co.recipe?.inputs ?? []).flatMap(inp => {
      const ownProd = this.#ownership[inp.item]?.total ?? 0;
      if (ownProd <= 0) return [];
      const supplied = alloc[inp.item] ?? 0;
      if (supplied <= 0) return [];
      return [{ name: NAMES[inp.item] ?? inp.item, supplied, ownProd }];
    });
  }

  // ─── Renda pessoal do jogador ────────────────────────────────────────────

  // Lucro de empreendedorismo do jogador nesta empresa (0 se inativa ou sem recipe)
  entrepProfitAt(co) {
    if (!co.recipe || !co.active) return 0;
    const itemsDay = ((this.#entrepSkill / 10) * this.#productionSkill
      * (1 + co.bonus.total / 100) * 2.4) / co.recipe.pp;
    return itemsDay * (co.sellPrice - this.matCostFor(co));
  }

  // Melhor empresa para empreendedorismo — { profit, companyName } ou null
  // Resultado é cacheado: o getter pode ser chamado várias vezes sem reprocessamento.
  get bestEntrep() {
    if (this.#bestEntrepCache !== undefined) return this.#bestEntrepCache;
    let best = null;
    for (const co of this.companies) {
      const profit = this.entrepProfitAt(co);
      if (!best || profit > best.profit) {
        best = { profit, companyName: co.name };
      }
    }
    return (this.#bestEntrepCache = best);
  }

  // Ajuste FIFO de output por item produzido pelo trabalhador em fábricas RAW.
  // Produtoras cujo output é consumido internamente têm parte da receita descontada
  // ao custo médio interno. Este valor é subtraído do netDay individual do worker
  // para que a soma dos workers bata com wkNetFor(co).
  // Retorna 0 quando não há ajuste (empresa processadora ou sem consumo interno).
  workerFifoAdjPerItemFor(co) {
    const pf = this.#producerFifo.get(co.id);
    if (!pf || pf.consumed <= 0 || pf.total <= 0) return 0;
    const adj = pf.consumed * (co.sellPrice - (this.#avgCost[co.itemCode] ?? 0));
    return adj / pf.total;
  }

  // Renda de energia (trabalhar como empregado) — null se sem empregador
  get energyProfit() {
    if (!this.employer) return null;
    return (this.#energySkill / 10) * this.#productionSkill * 2.4 * this.employer.netWagePerPP;
  }

  // ─── Totais agregados ────────────────────────────────────────────────────

  // Inclui renda pessoal (energia + empreendedorismo) além dos totais de empresa.
  get totals() {
    let totalAeNet = 0, activeAeNet = 0, activeAeCount = 0;
    let totalWkNet = 0, totalWages  = 0, totalWorkers  = 0;

    for (const co of this.companies) {
      if (!co.recipe) continue;
      const aeNet = this.aeNetFor(co);
      const wkNet = this.wkNetFor(co);
      totalAeNet  += aeNet;
      totalWkNet  += wkNet;
      totalWages  += co.wagesPerDay;
      totalWorkers += co.workers.length;
      if (co.active) { activeAeNet += aeNet; activeAeCount++; }
    }

    const count       = this.companies.filter(co => co.recipe).length;
    const entrepProfit = this.bestEntrep?.profit  ?? 0;
    const energyProfit = this.energyProfit         ?? 0;

    return {
      totalAeNet, activeAeNet, activeAeCount,
      totalWkNet, totalWages, totalWorkers,
      entrepProfit, energyProfit,
      total:        totalAeNet + totalWkNet,
      grand:        totalAeNet + totalWkNet + entrepProfit + energyProfit,
      activeGrand:  activeAeNet + totalWkNet + entrepProfit + energyProfit,
      avg:          count ? (totalAeNet + totalWkNet) / count : 0,
      avgAe:        count ? totalAeNet / count : 0,
      count,
    };
  }
}
