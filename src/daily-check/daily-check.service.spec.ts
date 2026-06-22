import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyCheckService } from './daily-check.service';
import { CreateDailyCheckDto } from './dto/create-daily-check.dto';
import { DailyCheck } from './entities/daily-check.entity';

// Mock tipado do Repository — nenhuma chamada real ao banco.
type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = (): MockRepository<DailyCheck> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

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

describe('DailyCheckService', () => {
  let service: DailyCheckService;
  let repository: MockRepository<DailyCheck>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyCheckService,
        {
          provide: getRepositoryToken(DailyCheck),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<DailyCheckService>(DailyCheckService);
    repository = module.get<MockRepository<DailyCheck>>(
      getRepositoryToken(DailyCheck),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria a entidade e persiste, retornando o registro salvo', async () => {
      const dto: CreateDailyCheckDto = { date: '2026-06-22' };
      const entity = buildDailyCheck();
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('retorna no formato { count, rows } ordenado por data desc', async () => {
      const rows = [buildDailyCheck({ id: 1 }), buildDailyCheck({ id: 2 })];
      repository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        order: { date: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      repository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('today', () => {
    beforeEach(() => {
      // Fixa "hoje" para tornar a data determinística.
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-22T10:00:00'));
    });

    afterEach(() => jest.useRealTimers());

    it('retorna o registro do dia quando já existe (sem criar)', async () => {
      const existing = buildDailyCheck({ date: '2026-06-22' });
      repository.findOne!.mockResolvedValue(existing);

      const result = await service.today();

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { date: '2026-06-22' },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    it('cria e retorna um novo registro quando não existe para hoje', async () => {
      const created = buildDailyCheck({ date: '2026-06-22' });
      repository.findOne!.mockResolvedValue(null);
      repository.create!.mockReturnValue(created);
      repository.save!.mockResolvedValue(created);

      const result = await service.today();

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { date: '2026-06-22' },
      });
      expect(repository.create).toHaveBeenCalledWith({ date: '2026-06-22' });
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildDailyCheck();
      repository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('faz preload e salva o registro atualizado', async () => {
      const updated = buildDailyCheck({ readingSkills: true });
      repository.preload!.mockResolvedValue(updated);
      repository.save!.mockResolvedValue(updated);

      const result = await service.update(1, { readingSkills: true });

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        readingSkills: true,
      });
      expect(repository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('lança NotFoundException quando o id não existe (preload null)', async () => {
      repository.preload!.mockResolvedValue(undefined);

      await expect(
        service.update(999, { readingSkills: true }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove quando o registro existe', async () => {
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      repository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
