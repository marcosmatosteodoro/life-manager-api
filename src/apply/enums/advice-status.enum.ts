/**
 * Conselho da extensão do Chrome sobre a vaga (1 = pior → 4 = melhor).
 * `EVALUATE` = a extensão não soube decidir (é o foco do relatório do Conselheiro).
 */
export enum AdviceStatus {
  DONT_APPLY = 1, // não aplique
  EVALUATE = 2, // avaliar você mesmo (não soube)
  APPLY = 3, // aplique
  GREAT_MATCH = 4, // ótimo match
}

/** Valores válidos (para validação/relatórios). */
export const ADVICE_STATUSES = [
  AdviceStatus.DONT_APPLY,
  AdviceStatus.EVALUATE,
  AdviceStatus.APPLY,
  AdviceStatus.GREAT_MATCH,
] as const;
