import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BacklogService } from './backlog.service';
import { BacklogItem } from './entities/backlog-item.entity';

// QueryBuilder encadeável reutilizado por maxPendingPosition e shiftPendingAfter.
const makeQb = (raw: { max: number | null } = { max: null }) => ({
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getRawOne: jest.fn().mockResolvedValue(raw),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({ affected: 0 }),
});

const buildItem = (o: Partial<BacklogItem> = {}): BacklogItem => ({
  id: 1,
  name: 'Item',
  position: 1,
  description: null,
  status: 'pendente',
  completedAt: null,
  createdAt: new Date('2026-07-01T08:00:00.000Z'),
  updatedAt: new Date('2026-07-01T08:00:00.000Z'),
  creatorId: null,
  ...o,
});

describe('BacklogService', () => {
  let service: BacklogService;
  let repo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    manager: {
      transaction: jest.Mock;
      createQueryBuilder: jest.Mock;
    };
  };
  // Manager fake usado dentro das transações.
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
        BacklogService,
        { provide: getRepositoryToken(BacklogItem), useValue: repo },
      ],
    }).compile();
    service = module.get(BacklogService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('cria pendente no fim (maior position + 1)', async () => {
      qb.getRawOne.mockResolvedValue({ max: 3 });

      const result = await service.create({ name: 'Novo' });

      expect(result).toMatchObject({ status: 'pendente', position: 4 });
    });

    it('primeira criação recebe position 1', async () => {
      qb.getRawOne.mockResolvedValue({ max: null });
      const result = await service.create({ name: 'Primeiro' });
      expect(result.position).toBe(1);
    });
  });

  describe('complete', () => {
    it('zera position, marca completedAt e fecha o buraco', async () => {
      manager.findOne.mockResolvedValue(buildItem({ id: 2, position: 2 }));

      const result = await service.complete(2);

      expect(result.status).toBe('concluido');
      expect(result.position).toBeNull();
      expect(result.completedAt).toBeInstanceOf(Date);
      // Decrementa os pendentes com position > 2.
      expect(qb.set).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith(
        'status = :status AND position > :threshold',
        { status: 'pendente', threshold: 2 },
      );
    });

    it('é idempotente para itens já concluídos', async () => {
      manager.findOne.mockResolvedValue(
        buildItem({ status: 'concluido', position: null }),
      );
      const result = await service.complete(1);
      expect(result.status).toBe('concluido');
      expect(qb.execute).not.toHaveBeenCalled();
    });

    it('lança NotFound quando não existe', async () => {
      manager.findOne.mockResolvedValue(null);
      await expect(service.complete(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reopen', () => {
    it('volta a pendente no fim da fila', async () => {
      manager.findOne.mockResolvedValue(
        buildItem({ status: 'concluido', position: null }),
      );
      qb.getRawOne.mockResolvedValue({ max: 5 });

      const result = await service.reopen(1);

      expect(result.status).toBe('pendente');
      expect(result.completedAt).toBeNull();
      expect(result.position).toBe(6);
    });
  });

  describe('reorder', () => {
    it('reatribui position pela ordem enviada', async () => {
      manager.find.mockResolvedValue([
        buildItem({ id: 1, position: 1 }),
        buildItem({ id: 2, position: 2 }),
        buildItem({ id: 3, position: 3 }),
      ]);

      const result = await service.reorder([3, 1, 2]);

      const byId = new Map(result.rows.map((r) => [r.id, r.position]));
      expect(byId.get(3)).toBe(1);
      expect(byId.get(1)).toBe(2);
      expect(byId.get(2)).toBe(3);
    });

    it('rejeita ordem que não bate com o conjunto de pendentes', async () => {
      manager.find.mockResolvedValue([
        buildItem({ id: 1 }),
        buildItem({ id: 2 }),
      ]);
      await expect(service.reorder([1, 99])).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove e compacta as posições seguintes quando era pendente', async () => {
      manager.findOne.mockResolvedValue(buildItem({ id: 1, position: 1 }));
      await service.remove(1);
      expect(manager.remove).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith(
        'status = :status AND position > :threshold',
        { status: 'pendente', threshold: 1 },
      );
    });

    it('não compacta quando o item era concluído (position null)', async () => {
      manager.findOne.mockResolvedValue(
        buildItem({ id: 1, status: 'concluido', position: null }),
      );
      await service.remove(1);
      expect(manager.remove).toHaveBeenCalled();
      expect(qb.execute).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('pendente: ordena por position ASC', async () => {
      repo.find.mockResolvedValue([buildItem()]);
      await service.findAll('pendente');
      expect(repo.find).toHaveBeenCalledWith({
        where: { status: 'pendente' },
        order: { position: 'ASC' },
      });
    });

    it('concluido: ordena por completedAt DESC', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll('concluido');
      expect(repo.find).toHaveBeenCalledWith({
        where: { status: 'concluido' },
        order: { completedAt: 'DESC' },
      });
    });
  });
});
