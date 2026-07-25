import { Test, TestingModule } from '@nestjs/testing';
import { DogWalkController } from './dog-walk.controller';
import { DogWalkService } from './dog-walk.service';

describe('DogWalkController', () => {
  let controller: DogWalkController;
  let service: jest.Mocked<DogWalkService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<DogWalkService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DogWalkController],
      providers: [{ provide: DogWalkService, useValue: serviceMock }],
    }).compile();
    controller = module.get(DogWalkController);
    service = module.get(DogWalkService);
  });

  it('create repassa o dto (recurso compartilhado, sem userId)', async () => {
    const dto = {
      dogIds: [1],
      locationId: 2,
      startedAt: '2026-07-22T08:00:00.000Z',
      endedAt: '2026-07-22T08:30:00.000Z',
      durationSeconds: 1800,
    };
    service.create.mockResolvedValue({ id: 10 } as never);

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
