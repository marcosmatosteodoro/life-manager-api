import { Test, TestingModule } from '@nestjs/testing';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { Diary } from './entities/diary.entity';
import { DiaryType } from './enums/diary-type.enum';

const buildDiary = (overrides: Partial<Diary> = {}): Diary => ({
  id: 1,
  day: '2026-06-24',
  description: 'Hoje foi um dia produtivo',
  type: DiaryType.DAILY,
  createdAt: new Date('2026-06-24T08:30:00.000Z'),
  updatedAt: new Date('2026-06-24T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('DiaryController', () => {
  let controller: DiaryController;
  let service: jest.Mocked<DiaryService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<DiaryService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiaryController],
      providers: [{ provide: DiaryService, useValue: serviceMock }],
    }).compile();

    controller = module.get<DiaryController>(DiaryController);
    service = module.get(DiaryService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service e retorna o resultado', async () => {
    const dto: CreateDiaryDto = {
      day: '2026-06-24',
      description: 'Hoje foi um dia produtivo',
      type: DiaryType.DAILY,
    };
    const created = buildDiary();
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll repassa o type para o service', async () => {
    const payload = { count: 1, rows: [buildDiary({ type: DiaryType.GRATITUDE })] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll(DiaryType.GRATITUDE)).resolves.toEqual(
      payload,
    );
    expect(service.findAll).toHaveBeenCalledWith(DiaryType.GRATITUDE);
  });

  it('findAll sem type chama o service com undefined', async () => {
    const payload = { count: 0, rows: [] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll()).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findOne repassa o id para o service', async () => {
    const entity = buildDiary();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update repassa id e dto para o service', async () => {
    const dto: UpdateDiaryDto = { description: 'editado' };
    const updated = buildDiary({ description: 'editado' });
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
