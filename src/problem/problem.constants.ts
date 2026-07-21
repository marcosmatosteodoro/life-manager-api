/** Status de um problema a ser resolvido. Fonte única para entidade, DTO e validação. */
export const PROBLEM_STATUSES = [
  'pendente',
  'em_progresso',
  'concluido',
] as const;

export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];

export const DEFAULT_STATUS: ProblemStatus = 'pendente';
