import { Logger } from '@nestjs/common';

/**
 * Strategy de dialeto do banco: encapsula o SQL que varia entre provedores
 * (funções específicas de cada banco). A implementação é escolhida pela env
 * `DB_TYPE` via {@link createDbDialect} (ver `DbDialectModule`). Serve também
 * como token de injeção.
 *
 * Só há método para o que o app realmente usa hoje (ordenação aleatória). Ao
 * precisar de outra função dialeto-específica, adicione um método aqui e
 * implemente em cada dialeto suportado.
 */
export abstract class DbDialect {
  /** Expressão de ordenação aleatória — `RANDOM()` no Postgres, `RAND()` no MySQL. */
  abstract randomOrder(): string;
}

class PostgresDialect extends DbDialect {
  randomOrder(): string {
    return 'RANDOM()';
  }
}

class MysqlDialect extends DbDialect {
  randomOrder(): string {
    return 'RAND()';
  }
}

/**
 * Fábrica de dialetos, keyed por `DB_TYPE`. Para suportar um novo banco, basta
 * mapear a chave para o dialeto correspondente aqui.
 */
const DIALECTS: Record<string, () => DbDialect> = {
  postgres: () => new PostgresDialect(),
  mysql: () => new MysqlDialect(),
};

/**
 * Resolve o dialeto pela `DB_TYPE`. Se o banco não estiver mapeado, aborta o
 * boot com uma mensagem amigável no terminal (falha cedo e explícita, em vez de
 * quebrar depois no meio de uma query).
 */
export function createDbDialect(dbType: string): DbDialect {
  const factory = DIALECTS[dbType];
  if (!factory) {
    const supported = Object.keys(DIALECTS).join(', ');
    const message =
      `DB_TYPE "${dbType}" não é suportado. ` +
      `Bancos suportados: ${supported}. ` +
      `Ajuste a env DB_TYPE ou adicione o dialeto em src/database/db-dialect.ts.`;
    // Mensagem limpa no terminal antes de derrubar a aplicação.
    new Logger('DbDialect').error(message);
    throw new Error(message);
  }
  return factory();
}
