/** Janela de tempo da busca de vagas. */
export enum JobSearchPeriod {
  TODAY = 'today',
  THREE_DAYS = '3d',
  SEVEN_DAYS = '7d',
  ONE_MONTH = '1m',
}

/** Quantos dias cada período cobre (provedores que filtram por nº de dias). */
export const PERIOD_MAX_DAYS: Record<JobSearchPeriod, number> = {
  [JobSearchPeriod.TODAY]: 1,
  [JobSearchPeriod.THREE_DAYS]: 3,
  [JobSearchPeriod.SEVEN_DAYS]: 7,
  [JobSearchPeriod.ONE_MONTH]: 30,
};
