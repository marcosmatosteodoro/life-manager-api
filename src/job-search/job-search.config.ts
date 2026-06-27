/**
 * Configuração fixa da busca de vagas (stack do usuário e heurísticas).
 * Stack fixa por enquanto — quando virar configurável, mover para o banco.
 */

/** Stack principal — entra na query enviada às APIs e pontua mais alto. */
export const STACK_PRIMARY = ['react', 'typescript', 'node'];

/** Stack secundária — só pontua/ranqueia (não entra na query, p/ não diluir). */
export const STACK_SECONDARY = ['php', 'ruby', 'python'];

/**
 * Sinais (heurística) de que a vaga contrata estrangeiro/brasileiro/latino.
 * Não há filtro nativo nas APIs para isso, então detectamos no texto e damos
 * boost no ranking (não é um filtro rígido — o dado nem sempre está na vaga).
 */
export const INTERNATIONAL_HINTS = [
  'visa sponsorship',
  'sponsorship',
  'sponsor',
  'international',
  'worldwide',
  'work anywhere',
  'anywhere in the world',
  'globally',
  'global remote',
  'latam',
  'latin america',
  'brazil',
  'brasil',
];

/** País padrão quando o usuário não informa countryId ("eu" = Brasil). */
export const DEFAULT_COUNTRY_CODE = 'BR';
