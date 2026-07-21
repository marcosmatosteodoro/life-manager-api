import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProblemDto } from './dto/create-problem.dto';
import { Problem } from './entities/problem.entity';
import { ProblemService } from './problem.service';

// QueryBuilder encadeável (maxPosition usa select/getRawOne; remove usa update/set/where/execute).
const makeQb = (raw: { max: number | null } = { max: null }) => ({
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getRawOne: jest.fn().mockResolvedValue(raw),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({ affected: 0 }),
});

const buildProblem = (o: Partial<Problem> = {}): Problem => ({
  id: 1,
  title: 'Login lento em produção',
  position: 1,
  description: null,
  status: 'pendente',
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...o,
});

describe('ProblemService', () => {
  let service: ProblemService;
  let repo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    manager: { transaction: jest.Mock; createQueryBuilder: jest.Mock };
  };
  let manager: {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let qb: ReturnType<typeof makeQb>;

  beforeEach(async () => {
    qb = makeQb();
    manager = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((e) => Promise.resolve(e)),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn(() => qb),
    };
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((d: unknown) => d),
      save: jest.fn((e: unknown) => Promise.resolve(e)),
      manager: {
        transaction: jest.fn((cb: (m: unknown) => unknown) => cb(manager)),
        createQueryBuilder: jest.fn(() => qb),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        { provide: getRepositoryToken(Problem), useValue: repo },
      ],
    }).compile();
    service = module.get(ProblemService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('cria no fim (maior position + 1) com status default', async () => {
      qb.getRawOne.mockResolvedValue({ max: 3 });

      const dto: CreateProblemDto = { title: 'Novo' };
      const result = await service.create(dto);

      expect(result).toMatchObject({
        title: 'Novo',
        status: 'pendente',
        position: 4,
      });
    });

    it('primeira criação recebe position 1 e respeita o status enviado', async () => {
      qb.getRawOne.mockResolvedValue({ max: null });

      const result = await service.create({
        title: 'Bug',
        status: 'em_progresso',
      });

      expect(result).toMatchObject({ position: 1, status: 'em_progresso' });
    });
  });

  describe('findAll', () => {
    it('sem filtro: ordena por position ASC', async () => {
      repo.find.mockResolvedValue([buildProblem()]);

      await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        where: {},
        order: { position: 'ASC' },
      });
    });

    it('com filtro: aplica o where por status', async () => {
      repo.find.mockResolvedValue([]);

      await service.findAll('concluido');

      expect(repo.find).toHaveBeenCalledWith({
        where: { status: 'concluido' },
        order: { position: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildProblem();
      repo.findOne.mockResolvedValue(entity);

      await expect(service.findOne(1)).resolves.toEqual(entity);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza título, descrição e status', async () => {
      repo.findOne.mockResolvedValue(buildProblem());

      const result = await service.update(1, {
        title: 'Novo título',
        description: 'nova desc',
        status: 'concluido',
      });

      expect(result).toMatchObject({
        title: 'Novo título',
        description: 'nova desc',
        status: 'concluido',
      });
    });

    it('lança NotFoundException quando o id não existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(999, { title: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reorder', () => {
    it('reatribui position pela ordem enviada', async () => {
      manager.find.mockResolvedValue([
        buildProblem({ id: 1, position: 1 }),
        buildProblem({ id: 2, position: 2 }),
        buildProblem({ id: 3, position: 3 }),
      ]);

      const result = await service.reorder([3, 1, 2]);

      const byId = new Map(result.rows.map((r) => [r.id, r.position]));
      expect(byId.get(3)).toBe(1);
      expect(byId.get(1)).toBe(2);
      expect(byId.get(2)).toBe(3);
    });

    it('rejeita ordem que não bate com o conjunto existente', async () => {
      manager.find.mockResolvedValue([
        buildProblem({ id: 1 }),
        buildProblem({ id: 2 }),
      ]);

      await expect(service.reorder([1, 99])).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove e compacta as posições seguintes', async () => {
      manager.findOne.mockResolvedValue(buildProblem({ id: 1, position: 2 }));

      await service.remove(1);

      expect(manager.remove).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith('position > :threshold', {
        threshold: 2,
      });
    });

    it('lança NotFoundException quando o id não existe', async () => {
      manager.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
