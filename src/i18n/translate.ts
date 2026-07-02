import { I18nContext } from 'nestjs-i18n';

/**
 * Traduz uma chave usando o contexto de request atual (locale via
 * Accept-Language). Fora de um request — ex.: unit tests, que não montam
 * `I18nContext` — devolve a própria chave (fail-open só na mensagem; a exceção
 * continua sendo lançada). Evita injetar `I18nService` nos services (o que
 * quebraria os `TestingModule` fixos dos specs).
 */
export function tr(key: string, args?: Record<string, unknown>): string {
  const ctx = I18nContext.current();
  return ctx ? ctx.t(key, { args }) : key;
}
