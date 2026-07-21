/** Temas suportados. `custom` usa as cores de `customColors`. Fonte única p/ entidade+DTO. */
export const THEMES = ['light', 'dark', 'custom'] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = 'light';

/**
 * Tokens de cor editáveis no tema `custom`. As chaves espelham as variáveis CSS
 * do front (sem o prefixo `--`); fonte única para entidade, DTO e validação.
 */
export const CUSTOM_COLOR_KEYS = [
  'background',
  'foreground',
  'surface',
  'surface-muted',
  'surface-subtle',
  'surface-inverse',
  'fg',
  'fg-soft',
  'fg-muted',
  'fg-subtle',
  'edge',
  'edge-strong',
  'edge-inverse',
] as const;

export type CustomColorKey = (typeof CUSTOM_COLOR_KEYS)[number];

/** Mapa parcial token → cor hex (ex.: `{ "fg": "#171717" }`). */
export type CustomColors = Partial<Record<CustomColorKey, string>>;

/** Idiomas suportados. Ainda não controla nada (sem i18n). */
export const LANGUAGES = ['pt-BR', 'en-US'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en-US';
