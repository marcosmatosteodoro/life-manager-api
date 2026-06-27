/** Período coberto por um feedback. */
export enum FeedbackPeriod {
  SEVEN_DAYS = '7d',
  FIFTEEN_DAYS = '15d',
  THIRTY_DAYS = '30d',
  SIXTY_DAYS = '60d',
  ONE_YEAR = '1y',
  ALL = 'all', // desde o começo do ciclo
}

/** Dias de cada período; null = desde o começo (sem limite inferior de data). */
export const FEEDBACK_PERIOD_DAYS: Record<FeedbackPeriod, number | null> = {
  [FeedbackPeriod.SEVEN_DAYS]: 7,
  [FeedbackPeriod.FIFTEEN_DAYS]: 15,
  [FeedbackPeriod.THIRTY_DAYS]: 30,
  [FeedbackPeriod.SIXTY_DAYS]: 60,
  [FeedbackPeriod.ONE_YEAR]: 365,
  [FeedbackPeriod.ALL]: null,
};
