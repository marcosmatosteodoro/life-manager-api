import { ValueTransformer } from 'typeorm';

/**
 * Converte colunas `decimal` do MySQL (que o driver retorna como string)
 * de volta para `number`, preservando null.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | null): number | null =>
    value === null ? null : Number(value),
};
