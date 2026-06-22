import { Test, TestingModule } from '@nestjs/testing';
import { CreateWeightDto } from './dto/create-weight.dto';
import { UpdateWeightDto } from './dto/update-weight.dto';
import { Weight } from './entities/weight.entity';
import { WeightController } from './weight.controller';
import { WeightService } from './weight.service';

const buildWeight = (overrides: Partial<Weight> = {}): Weight => ({
  id: 1,
  value: 81.55,
  date: '2026-06-22',
  time: '08:30:00',
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('WeightController', () => {
  let controller: WeightController;
  let service: jest.Mocked<WeightService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<WeightService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeightController],
      providers: [{ provide: WeightService, useValue: serviceMock }],
    }).compile();

    controller = module.get<WeightController>(WeightController);
    service = module.get(WeightService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service e retorna o resultado', async () => {
    const dto: CreateWeightDto = { value: 81.55, date: '2026-06-22' };
    const created = buildWeight();
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll retorna { count, rows } do service', async () => {
    const payload = { count: 1, rows: [buildWeight()] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll()).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne repassa o id para o service', async () => {
    const entity = buildWeight();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update repassa id e dto para o service', async () => {
    const dto: UpdateWeightDto = { value: 82 };
    const updated = buildWeight({ value: 82 });
    service.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove repassa o id e resolve void', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
