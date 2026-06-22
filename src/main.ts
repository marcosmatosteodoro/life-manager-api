import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas nos DTOs
      forbidNonWhitelisted: true, // rejeita payload com campos extras
      transform: true, // converte tipos (ex.: query string -> number)
    }),
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
