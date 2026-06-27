import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeightModule } from './weight/weight.module';
import { ArticleModule } from './article/article.module';
import { DailyCheckModule } from './daily-check/daily-check.module';
import { CountryModule } from './country/country.module';
import { CompanyModule } from './company/company.module';
import { ApplyModule } from './apply/apply.module';
import { DiaryModule } from './diary/diary.module';
import { FlashCardGroupModule } from './flash-card-group/flash-card-group.module';
import { FlashCardModule } from './flash-card/flash-card.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    // Carrega variáveis de ambiente do .env e as valida em tempo de boot.
    ConfigModule.forRoot({ isGlobal: true }),
    // Configuração assíncrona: credenciais vêm SEMPRE do ambiente, nunca hardcoded.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Postgres por padrão (dev e prod). DB_TYPE permite alternar se preciso.
        type: config.get<'postgres' | 'mysql'>('DB_TYPE', 'postgres'),
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        // synchronize só em desenvolvimento — em produção use migrações.
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        // Provedores gerenciados (ex.: Vercel/Neon) exigem SSL: DB_SSL=true.
        ssl:
          config.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    WeightModule,
    ArticleModule,
    DailyCheckModule,
    CountryModule,
    CompanyModule,
    ApplyModule,
    DiaryModule,
    FlashCardGroupModule,
    FlashCardModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
