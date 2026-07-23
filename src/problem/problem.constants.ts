/** Status de um problema a ser resolvido. Fonte única para entidade, DTO e validação. */
export const PROBLEM_STATUSES = [
  'pendente',
  'em_progresso',
  'concluido',
] as const;

export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];

export const DEFAULT_STATUS: ProblemStatus = 'pendente';

/** Prioridade de um problema. Fonte única para entidade, DTO e validação. */
export const PROBLEM_PRIORITIES = [
  'baixa',
  'media',
  'alta',
  'urgente',
] as const;

export type ProblemPriority = (typeof PROBLEM_PRIORITIES)[number];

export const DEFAULT_PRIORITY: ProblemPriority = 'media';
