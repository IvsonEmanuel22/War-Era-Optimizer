import { RECIPES, NAMES } from '../config.js';
import { CompanyBonus } from './CompanyBonus.js';
import { Worker } from './Worker.js';

// Uma empresa do jogador.
// A camada de fetch (via _recovered.js) transforma a API e entrega company.detail
// como o objeto principal da empresa. Esta classe normaliza esse shape.
export class Company {
  constructor(apiData, prices) {
    const detail = apiData.detail ?? {};

    this.id         = apiData.id ?? apiData._id ?? null;
    this.name       = detail.name       ?? apiData.name ?? '(sem nome)';
    this.itemCode   = detail.itemCode;
    this.recipe     = RECIPES[this.itemCode] ?? null;
    this.bonus      = new CompanyBonus(apiData.bonus);
    this.aeLevel    = detail.activeUpgradeLevels?.automatedEngine ?? 0;
    this.breakRoom  = detail.activeUpgradeLevels?.breakRoom       ?? 0;
    this.active     = apiData.aeActive === true;
    this.disabledAt = apiData.disabledAt ?? null;

    this._prices = prices;

    this.workers = (this.recipe && apiData.workers?.length)
      ? apiData.workers.map(w => new Worker(w, this.recipe, this.bonus.total))
      : [];
  }

  get isRaw()     { return (this.recipe?.inputs.length ?? 1) === 0; }
  get sellPrice() { return this._prices[this.itemCode] ?? 0; }
  get itemName()  { return NAMES[this.itemCode] ?? this.itemCode ?? ''; }

  // Produção do Motor Automatizado — 0 se inativa ou sem recipe
  get aeItemsPerDay() {
    if (!this.active || !this.recipe || this.recipe.pp <= 0) return 0;
    return this.aeLevel * 24 * (1 + this.bonus.total / 100) / this.recipe.pp;
  }

  get workerItemsPerDay() {
    return this.workers.reduce((sum, w) => sum + w.itemsPerDay, 0);
  }

  get totalItemsPerDay() {
    return this.aeItemsPerDay + this.workerItemsPerDay;
  }

  get wagesPerDay() {
    return this.workers.reduce((sum, w) => sum + w.wagePerDay, 0);
  }
}
