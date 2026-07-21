import { createDbDialect } from './db-dialect';

describe('createDbDialect', () => {
  it('postgres → RANDOM()', () => {
    expect(createDbDialect('postgres').randomOrder()).toBe('RANDOM()');
  });

  it('mysql → RAND()', () => {
    expect(createDbDialect('mysql').randomOrder()).toBe('RAND()');
  });

  it('banco não suportado → lança erro com mensagem amigável', () => {
    expect(() => createDbDialect('sqlite')).toThrow(/DB_TYPE "sqlite"/);
    expect(() => createDbDialect('sqlite')).toThrow(/postgres, mysql/);
  });
});
