import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProblemDto } from './dto/create-problem.dto';
import { Problem } from './entities/problem.entity';
import { ProblemService } from './problem.service';

// Mock tipado do Repository — nenhuma chamada real ao banco.
type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <T extends object>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const buildProblem = (overrides: Partial<Problem> = {}): Problem => ({
  id: 1,
  title: 'Login lento em produção',
  description: null,
  status: 'pendente',
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('ProblemService', () => {
  let service: ProblemService;
  let repository: MockRepository<Problem>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        {
          provide: getRepositoryToken(Problem),
          useValue: createMockRepository<Problem>(),
        },
      ],
    }).compile();

    service = module.get<ProblemService>(ProblemService);
    repository = module.get(getRepositoryToken(Problem));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria com status default (pendente) quando não informado', async () => {
      const dto: CreateProblemDto = { title: 'Login lento' };
      const entity = buildProblem({ title: 'Login lento' });
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Login lento',
        description: null,
        status: 'pendente',
        creatorId: null,
      });
      expect(result).toEqual(entity);
    });

    it('respeita o status informado na criação', async () => {
      const dto: CreateProblemDto = {
        title: 'Bug X',
        status: 'em_progresso',
      };
      const entity = buildProblem({ title: 'Bug X', status: 'em_progresso' });
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'em_progresso' }),
      );
    });
  });

  describe('findAll', () => {
    it('sem filtro: lista todos ordenados por createdAt DESC', async () => {
      const rows = [buildProblem({ id: 2 }), buildProblem({ id: 1 })];
      repository.find!.mockResolvedValue(rows);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('com filtro: aplica o where por status', async () => {
      repository.find!.mockResolvedValue([]);

      await service.findAll('concluido');

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: 'concluido' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildProblem();
      repository.findOne!.mockResolvedValue(entity);

      await expect(service.findOne(1)).resolves.toEqual(entity);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza título, descrição e status quando enviados', async () => {
      const entity = buildProblem();
      repository.findOne!.mockResolvedValue(entity);
      repository.save!.mockImplementation((p: Problem) => Promise.resolve(p));

      const result = await service.update(1, {
        title: 'Novo título',
        description: 'nova desc',
        status: 'concluido',
      });

      expect(result.title).toBe('Novo título');
      expect(result.description).toBe('nova desc');
      expect(result.status).toBe('concluido');
    });

    it('lança NotFoundException quando o id não existe', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.update(999, { title: 'X' })).rejects.toThrow(
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
