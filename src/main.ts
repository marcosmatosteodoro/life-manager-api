import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Corpo JSON até 5 MB: notas de voz vão como base64 (o padrão do Express é
  // 100 KB). A Vercel ainda limita o corpo em ~4,5 MB, então o front limita o
  // áudio com folga abaixo disso.
  app.useBodyParser('json', { limit: '5mb' });

  // Confia em 1 hop de proxy (ex.: Vercel) para obter o IP real do cliente em
  // req.ip — usado como chave do rate limit quando não há usuário autenticado.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // CORS restrito à origem do front-end (deny-by-default a outras origens).
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  // I18nValidationPipe estende o ValidationPipe (mesmas opções) e traduz as
  // mensagens de validação pelo locale do request.
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true, // remove propriedades não declaradas nos DTOs
      forbidNonWhitelisted: true, // rejeita payload com campos extras
      transform: true, // converte tipos (ex.: query string -> number)
    }),
  );
  // Mantém o corpo de erro como { message: string[] } (front não muda).
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Life Manager API')
    .setDescription('API de gerenciamento — começando pelo controle de peso')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
