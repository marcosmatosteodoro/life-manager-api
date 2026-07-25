/** Tipo de pagamento do gasto. Fonte única para entidade, DTO e validação. */
export const EXPENSE_TYPES = ['debito', 'credito', 'a_vista', 'pix'] as const;

export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export const DEFAULT_EXPENSE_TYPE: ExpenseType = 'debito';
