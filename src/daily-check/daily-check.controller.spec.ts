import { Test, TestingModule } from '@nestjs/testing';
import { DailyCheckController } from './daily-check.controller';
import { DailyCheckService } from './daily-check.service';
import { CreateDailyCheckDto } from './dto/create-daily-check.dto';
import { UpdateDailyCheckDto } from './dto/update-daily-check.dto';
import { DailyCheck } from './entities/daily-check.entity';

const buildDailyCheck = (overrides: Partial<DailyCheck> = {}): DailyCheck => ({
  id: 1,
  readingSkills: false,
  writingSkills: false,
  listeningSkills: false,
  speakingSkills: false,
  applyJobs: false,
  date: '2026-06-22',
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('DailyCheckController', () => {
  let controller: DailyCheckController;
  let service: jest.Mocked<DailyCheckService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<DailyCheckService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      today: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyCheckController],
      providers: [{ provide: DailyCheckService, useValue: serviceMock }],
    }).compile();

    controller = module.get<DailyCheckController>(DailyCheckController);
    service = module.get(DailyCheckService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service e retorna o resultado', async () => {
    const dto: CreateDailyCheckDto = { date: '2026-06-22' };
    const created = buildDailyCheck();
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll retorna { count, rows } do service', async () => {
    const payload = { count: 1, rows: [buildDailyCheck()] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll()).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('today delega para o service', async () => {
    const todayCheck = buildDailyCheck();
    service.today.mockResolvedValue(todayCheck);

    await expect(controller.today()).resolves.toEqual(todayCheck);
    expect(service.today).toHaveBeenCalledTimes(1);
  });

  it('findOne repassa o id para o service', async () => {
    const entity = buildDailyCheck();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update repassa id e dto para o service', async () => {
    const dto: UpdateDailyCheckDto = { readingSkills: true };
    const updated = buildDailyCheck({ readingSkills: true });
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
