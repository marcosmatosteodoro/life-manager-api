import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProblemCategory } from '../problem-category/entities/problem-category.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { ProblemAudio } from './entities/problem-audio.entity';
import { Problem } from './entities/problem.entity';
import { ProblemService } from './problem.service';

const USER_ID = 1;

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
  title: 'Marcar consulta no dentista',
  position: 1,
  description: null,
  status: 'pendente',
  priority: 'media',
  categoryId: null,
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
  let categoryRepo: { findOne: jest.Mock };
  let audioRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
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
    categoryRepo = { findOne: jest.fn() };
    audioRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn((d: unknown) => d),
      save: jest.fn((e: unknown) => Promise.resolve(e)),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        { provide: getRepositoryToken(Problem), useValue: repo },
        {
          provide: getRepositoryToken(ProblemCategory),
          useValue: categoryRepo,
        },
        { provide: getRepositoryToken(ProblemAudio), useValue: audioRepo },
      ],
    }).compile();
    service = module.get(ProblemService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('cria no fim (maior position + 1) com status default', async () => {
      qb.getRawOne.mockResolvedValue({ max: 3 });

      const dto: CreateProblemDto = { title: 'Novo' };
      const result = await service.create(dto, USER_ID);

      expect(result).toMatchObject({
        title: 'Novo',
        status: 'pendente',
        priority: 'media', // default
        position: 4,
        creatorId: USER_ID,
      });
    });

    it('respeita a prioridade enviada', async () => {
      qb.getRawOne.mockResolvedValue({ max: 0 });

      const result = await service.create(
        { title: 'X', priority: 'urgente' },
        USER_ID,
      );

      expect(result).toMatchObject({ priority: 'urgente' });
    });

    it('primeira criação recebe position 1 e respeita o status enviado', async () => {
      qb.getRawOne.mockResolvedValue({ max: null });

      const result = await service.create(
        {
          title: 'Bug',
          status: 'em_progresso',
        },
        USER_ID,
      );

      expect(result).toMatchObject({ position: 1, status: 'em_progresso' });
    });
  });

  describe('findAll', () => {
    it('sem filtro: ordena por position ASC e carrega a categoria', async () => {
      repo.find.mockResolvedValue([buildProblem()]);

      await service.findAll(USER_ID);

      expect(repo.find).toHaveBeenCalledWith({
        where: { creatorId: USER_ID },
        relations: { category: true },
        order: { position: 'ASC' },
      });
    });

    it('com filtro: aplica o where por status', async () => {
      repo.find.mockResolvedValue([]);

      await service.findAll(USER_ID, 'concluido');

      expect(repo.find).toHaveBeenCalledWith({
        where: { creatorId: USER_ID, status: 'concluido' },
        relations: { category: true },
        order: { position: 'ASC' },
      });
    });
  });

  describe('categoria', () => {
    it('cria com categoria válida', async () => {
      qb.getRawOne.mockResolvedValue({ max: 0 });
      categoryRepo.findOne.mockResolvedValue({ id: 2, name: 'Bug' });

      const result = await service.create(
        { title: 'X', categoryId: 2 },
        USER_ID,
      );

      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 2, creatorId: USER_ID },
      });
      expect(result).toMatchObject({ categoryId: 2 });
    });

    it('lança NotFound quando a categoria não existe', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ title: 'X', categoryId: 999 }, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('update com categoryId null limpa a categoria (sem validar)', async () => {
      repo.findOne.mockResolvedValue(buildProblem({ categoryId: 2 }));

      const result = await service.update(1, { categoryId: null }, USER_ID);

      expect(categoryRepo.findOne).not.toHaveBeenCalled();
      expect(result.categoryId).toBeNull();
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildProblem();
      repo.findOne.mockResolvedValue(entity);

      await expect(service.findOne(1, USER_ID)).resolves.toEqual(entity);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 1, creatorId: USER_ID },
        relations: { category: true },
      });
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('atualiza título, descrição e status', async () => {
      repo.findOne.mockResolvedValue(buildProblem());

      const result = await service.update(
        1,
        {
          title: 'Novo título',
          description: 'nova desc',
          status: 'concluido',
          priority: 'alta',
        },
        USER_ID,
      );

      expect(result).toMatchObject({
        title: 'Novo título',
        description: 'nova desc',
        status: 'concluido',
        priority: 'alta',
      });
    });

    it('lança NotFoundException quando o id não existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.update(999, { title: 'X' }, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('reatribui position pela ordem enviada', async () => {
      manager.find.mockResolvedValue([
        buildProblem({ id: 1, position: 1 }),
        buildProblem({ id: 2, position: 2 }),
        buildProblem({ id: 3, position: 3 }),
      ]);

      const result = await service.reorder([3, 1, 2], USER_ID);

      expect(manager.find).toHaveBeenCalledWith(Problem, {
        where: { creatorId: USER_ID },
      });
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

      await expect(service.reorder([1, 99], USER_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove e compacta as posições seguintes', async () => {
      manager.findOne.mockResolvedValue(buildProblem({ id: 1, position: 2 }));

      await service.remove(1, USER_ID);

      expect(manager.findOne).toHaveBeenCalledWith(Problem, {
        where: { id: 1, creatorId: USER_ID },
      });
      expect(manager.remove).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith(
        'position > :threshold AND creator_id = :userId',
        { threshold: 2, userId: USER_ID },
      );
    });

    it('lança NotFoundException quando o id não existe', async () => {
      manager.findOne.mockResolvedValue(null);
      await expect(service.remove(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('nota de voz (áudio)', () => {
    it('getAudio lança NotFound quando não há áudio', async () => {
      repo.findOne.mockResolvedValue(buildProblem()); // problema é do usuário
      audioRepo.findOne.mockResolvedValue(null);
      await expect(service.getAudio(1, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getAudio lança NotFound quando o problema não é do usuário', async () => {
      repo.findOne.mockResolvedValue(null); // findOne escopado não achou
      await expect(service.getAudio(1, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(audioRepo.findOne).not.toHaveBeenCalled();
    });

    it('setAudio faz upsert (cria quando não existe)', async () => {
      repo.findOne.mockResolvedValue(buildProblem());
      audioRepo.findOne.mockResolvedValue(null);
      const result = await service.setAudio(
        1,
        { data: 'AAA', mimeType: 'audio/webm' },
        USER_ID,
      );
      expect(audioRepo.create).toHaveBeenCalledWith({
        problemId: 1,
        data: 'AAA',
        mimeType: 'audio/webm',
      });
      expect(result).toEqual({ data: 'AAA', mimeType: 'audio/webm' });
    });

    it('removeAudio lança NotFound quando nada foi apagado', async () => {
      repo.findOne.mockResolvedValue(buildProblem());
      audioRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.removeAudio(1, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
