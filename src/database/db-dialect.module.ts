import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbDialect, createDbDialect } from './db-dialect';

/**
 * Provê o {@link DbDialect} resolvido pela env `DB_TYPE` para toda a aplicação.
 * Global: qualquer service injeta `DbDialect` sem importar este módulo.
 */
@Global()
@Module({
  providers: [
    {
      provide: DbDialect,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createDbDialect(config.get<string>('DB_TYPE') ?? 'postgres'),
    },
  ],
  exports: [DbDialect],
})
export class DbDialectModule {}
