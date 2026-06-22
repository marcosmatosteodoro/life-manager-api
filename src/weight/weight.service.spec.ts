import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWeightDto } from './dto/create-weight.dto';
import { Weight } from './entities/weight.entity';
import { WeightService } from './weight.service';

// Mock tipado do Repository — nenhuma chamada real ao banco.
type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = (): MockRepository<Weight> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

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

describe('WeightService', () => {
  let service: WeightService;
  let repository: MockRepository<Weight>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeightService,
        {
          provide: getRepositoryToken(Weight),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<WeightService>(WeightService);
    repository = module.get<MockRepository<Weight>>(getRepositoryToken(Weight));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria a entidade e persiste, retornando o registro salvo', async () => {
      const dto: CreateWeightDto = { value: 81.55, date: '2026-06-22' };
      const entity = buildWeight({ value: 81.55, time: null });
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
      const rows = [buildWeight({ id: 1 }), buildWeight({ id: 2 })];
      repository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        order: { date: 'DESC', time: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      repository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildWeight();
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
      const updated = buildWeight({ value: 82 });
      repository.preload!.mockResolvedValue(updated);
      repository.save!.mockResolvedValue(updated);

      const result = await service.update(1, { value: 82 });

      expect(repository.preload).toHaveBeenCalledWith({ id: 1, value: 82 });
      expect(repository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('lança NotFoundException quando o id não existe (preload null)', async () => {
      repository.preload!.mockResolvedValue(undefined);

      await expect(service.update(999, { value: 82 })).rejects.toThrow(
        NotFoundException,
      );
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
