/** Temas suportados. `custom` reservado (ainda sem efeito). Fonte única p/ entidade+DTO. */
export const THEMES = ['light', 'dark', 'custom'] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = 'light';

/** Idiomas suportados. Ainda não controla nada (sem i18n). */
export const LANGUAGES = ['pt-BR', 'en-US'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en-US';
