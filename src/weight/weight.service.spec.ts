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

const USER_ID = 1;

const buildWeight = (overrides: Partial<Weight> = {}): Weight => ({
  id: 1,
  value: 81.55,
  date: '2026-06-22',
  time: '08:30:00',
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: USER_ID,
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

      const result = await service.create(dto, USER_ID);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        creatorId: USER_ID,
      });
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('retorna no formato { count, rows } ordenado por data desc', async () => {
      const rows = [buildWeight({ id: 1 }), buildWeight({ id: 2 })];
      repository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll(USER_ID);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { creatorId: USER_ID },
        order: { date: 'DESC', time: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      repository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll(USER_ID);

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildWeight();
      repository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne(1, USER_ID);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, creatorId: USER_ID },
      });
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('carrega o registro do dono e salva o atualizado', async () => {
      const existing = buildWeight({ value: 81.55 });
      repository.findOne!.mockResolvedValue(existing);
      repository.save!.mockImplementation((w) => Promise.resolve(w as Weight));

      const result = await service.update(1, { value: 82 }, USER_ID);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, creatorId: USER_ID },
      });
      expect(result.value).toBe(82);
    });

    it('lança NotFoundException quando o id não é do usuário', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.update(999, { value: 82 }, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove quando o registro existe', async () => {
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(1, USER_ID)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith({
        id: 1,
        creatorId: USER_ID,
      });
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      repository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
