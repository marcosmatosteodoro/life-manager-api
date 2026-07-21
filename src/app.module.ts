import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
} from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserThrottlerGuard } from './common/throttler/user-throttler.guard';
import { WeightModule } from './weight/weight.module';
import { ArticleModule } from './article/article.module';
import { CountryModule } from './country/country.module';
import { CompanyModule } from './company/company.module';
import { ApplyModule } from './apply/apply.module';
import { DiaryModule } from './diary/diary.module';
import { FlashCardGroupModule } from './flash-card-group/flash-card-group.module';
import { FlashCardModule } from './flash-card/flash-card.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AuthModule } from './auth/auth.module';
import { JobSearchModule } from './job-search/job-search.module';
import { ConverterModule } from './converter/converter.module';
import { TodoModule } from './todo/todo.module';
import { UserModule } from './user/user.module';
import { BacklogModule } from './backlog/backlog.module';
import { ProblemCategoryModule } from './problem-category/problem-category.module';
import { ProblemModule } from './problem/problem.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [
    // Carrega variáveis de ambiente do .env e as valida em tempo de boot.
    ConfigModule.forRoot({ isGlobal: true }),
    // i18n: locale resolvido pelo Accept-Language (fallback en). Traduções em
    // src/i18n/{en,pt}/*.json (copiadas para dist via nest-cli.json assets).
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: { path: join(__dirname, '/i18n/'), watch: true },
      resolvers: [AcceptLanguageResolver, new HeaderResolver(['x-lang'])],
    }),
    // Rate limit global (deny-by-default de abuso): 100 req/min por usuário
    // (ou IP). Endpoints caros de IA e o login têm limites próprios via @Throttle.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
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
    CountryModule,
    CompanyModule,
    ApplyModule,
    DiaryModule,
    FlashCardGroupModule,
    FlashCardModule,
    FeedbackModule,
    AuthModule,
    JobSearchModule,
    ConverterModule,
    TodoModule,
    UserModule,
    BacklogModule,
    ProblemCategoryModule,
    ProblemModule,
    HomeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global de rate limit (por usuário/IP). O JwtAuthGuard (AuthModule)
    // roda antes e anexa req.user, usado como chave do throttler.
    { provide: APP_GUARD, useClass: UserThrottlerGuard },
  ],
})
export class AppModule {}
