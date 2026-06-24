import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { Diary } from './entities/diary.entity';
import { DiaryType } from './enums/diary-type.enum';

// Mock tipado do Repository — nenhuma chamada real ao banco.
type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = (): MockRepository<Diary> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

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

describe('DiaryService', () => {
  let service: DiaryService;
  let repository: MockRepository<Diary>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiaryService,
        { provide: getRepositoryToken(Diary), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<DiaryService>(DiaryService);
    repository = module.get<MockRepository<Diary>>(getRepositoryToken(Diary));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria a entidade e persiste, retornando o registro salvo', async () => {
      const dto: CreateDiaryDto = {
        day: '2026-06-24',
        description: 'Hoje foi um dia produtivo',
        type: DiaryType.DAILY,
      };
      const entity = buildDiary();
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('sem type: lista tudo ordenado por day desc', async () => {
      const rows = [buildDiary({ id: 1 }), buildDiary({ id: 2 })];
      repository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { day: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('com type: filtra pelo tipo informado', async () => {
      const rows = [buildDiary({ type: DiaryType.GRATITUDE })];
      repository.findAndCount!.mockResolvedValue([rows, 1]);

      const result = await service.findAll(DiaryType.GRATITUDE);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { type: DiaryType.GRATITUDE },
        order: { day: 'DESC' },
      });
      expect(result).toEqual({ count: 1, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      repository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll(DiaryType.DAILY);

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildDiary();
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
      const updated = buildDiary({ description: 'editado' });
      repository.preload!.mockResolvedValue(updated);
      repository.save!.mockResolvedValue(updated);

      const result = await service.update(1, { description: 'editado' });

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        description: 'editado',
      });
      expect(repository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('lança NotFoundException quando o id não existe (preload null)', async () => {
      repository.preload!.mockResolvedValue(undefined);

      await expect(
        service.update(999, { description: 'x' }),
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
