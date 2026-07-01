/** Status de um item do backlog. Fonte única para entidade, DTO e validação. */
export const BACKLOG_STATUSES = ['pendente', 'concluido'] as const;

export type BacklogStatus = (typeof BACKLOG_STATUSES)[number];

export const DEFAULT_STATUS: BacklogStatus = 'pendente';
