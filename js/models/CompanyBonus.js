// Bonus de produção da empresa — breakdown por origem.
// A API retorna bonus.region + bonus.deposito + bonus.partido, e o total já somado.
export class CompanyBonus {
  constructor(data) {
    this.region   = data?.region   ?? 0;
    this.deposito = data?.deposito ?? 0;
    this.partido  = data?.partido  ?? 0;
    this.total    = data?.total    ?? 0;
  }

  static zero() {
    return new CompanyBonus(null);
  }
}
