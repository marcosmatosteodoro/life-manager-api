import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeightModule } from './weight/weight.module';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [
    // Carrega variáveis de ambiente do .env e as valida em tempo de boot.
    ConfigModule.forRoot({ isGlobal: true }),
    // Configuração assíncrona: credenciais vêm SEMPRE do ambiente, nunca hardcoded.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        // synchronize só em desenvolvimento — em produção use migrações.
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    WeightModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
