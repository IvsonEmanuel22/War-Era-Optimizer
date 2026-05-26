// Um trabalhador em uma empresa.
// energy e production são skills do jogador-trabalhador (vêm enriquecidos pela API).
// Salário é pago apenas sobre o PP base (fidelidade e bônus da empresa aumentam
// produção mas não o custo salarial).

const WORKER_SCALE = 0.24; // energy/10 actions per full bar × 2.4 bars/day

export class Worker {
  constructor(apiData, recipe, companyBonusPct) {
    this.id         = apiData._id ?? apiData.id ?? null;
    this.username   = apiData.username ?? '';
    this.level      = apiData.level    ?? 0;
    this.energy     = apiData.energy     ?? 0;
    this.production = apiData.production ?? 0;
    this.fidelity   = apiData.fidelity   ?? 0;
    this.wagePerPp  = apiData.wage       ?? 0;

    this._recipe = recipe;
    this._bonus  = companyBonusPct; // bonus.total da empresa em %
  }

  // PP produzidos por dia (com fidelidade e bônus da empresa)
  get ppPerDay() {
    return this.energy
      * this.production
      * (1 + this.fidelity / 100 + this._bonus / 100)
      * WORKER_SCALE;
  }

  // PP base por dia — usado para calcular salário (sem fidelidade/bônus)
  get basePpPerDay() {
    return this.energy * this.production * WORKER_SCALE;
  }

  get itemsPerDay() {
    return this._recipe.pp > 0 ? this.ppPerDay / this._recipe.pp : 0;
  }

  get wagePerDay() {
    return this.basePpPerDay * this.wagePerPp;
  }

  // Lucro líquido deste trabalhador dado um custo de matéria-prima e preço de venda
  netPerDay(matCost, sellPrice) {
    return this.itemsPerDay * (sellPrice - matCost) - this.wagePerDay;
  }
}
