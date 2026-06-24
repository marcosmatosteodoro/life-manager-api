import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController (health check)', () => {
  function createController(query: jest.Mock) {
    return Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: getDataSourceToken(), useValue: { query } },
      ],
    }).compile();
  }

  it('retorna status ok e db up quando o banco responde', async () => {
    const app: TestingModule = await createController(
      jest.fn().mockResolvedValue([{ result: 1 }]),
    );
    const controller = app.get<AppController>(AppController);

    const result = await controller.healthCheck();

    expect(result.status).toBe('ok');
    expect(result.db).toBe('up');
    expect(typeof result.uptime).toBe('number');
    expect(typeof result.timestamp).toBe('string');
  });

  it('lança 503 com db down quando o banco falha', async () => {
    const app: TestingModule = await createController(
      jest.fn().mockRejectedValue(new Error('connection refused')),
    );
    const controller = app.get<AppController>(AppController);

    await expect(controller.healthCheck()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
