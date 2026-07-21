import {
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { CUSTOM_COLOR_KEYS } from '../user.constants';

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const ALLOWED_KEYS = new Set<string>(CUSTOM_COLOR_KEYS);

/**
 * Valida o mapa de cores do tema custom: objeto plano cujas chaves ∈
 * CUSTOM_COLOR_KEYS e valores são cores hex (#rgb ou #rrggbb). Como o valor é
 * aplicado como CSS no front, restringir a hex é defense-in-depth (evita valores
 * arbitrários — OWASP A05). Aceita objeto parcial (só as chaves enviadas).
 */
@ValidatorConstraint({ name: 'isCustomColors', async: false })
export class IsCustomColors implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value)
    ) {
      return false;
    }
    return Object.entries(value).every(
      ([key, val]) =>
        ALLOWED_KEYS.has(key) && typeof val === 'string' && HEX_COLOR.test(val),
    );
  }

  defaultMessage(): string {
    return 'customColors deve ser um objeto de tokens conhecidos com cores hex válidas (#rgb ou #rrggbb).';
  }
}
