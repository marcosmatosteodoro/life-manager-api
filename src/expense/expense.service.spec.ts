import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { del, put } from '@vercel/blob';
import { AiService } from '../ai/ai.service';

// Mock do SDK do Vercel Blob (não sobe nada de verdade nos testes).
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ pathname: 'expenses/1/p.jpg', url: 'https://blob/x' }),
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(undefined),
}));
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { ExpenseAudio } from './entities/expense-audio.entity';
import { ExpensePhoto } from './entities/expense-photo.entity';
import { Expense } from './entities/expense.entity';
import { ExpenseService } from './expense.service';

// Query builder do resumo: encadeável, com getRawOne/getRawMany.
const makeExpenseQb = () => ({
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getRawOne: jest.fn(),
  getRawMany: jest.fn().mockResolvedValue([]),
});

// Query builder da categoria (findOrCreate por nome).
const makeCategoryQb = (found: unknown = null) => ({
  where: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(found),
});

describe('ExpenseService', () => {
  let service: ExpenseService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let audioRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let categoryRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let photoRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let ai: { complete: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve({ id: 1, ...e })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => makeExpenseQb()),
    };
    audioRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve(e)),
      delete: jest.fn(),
    };
    categoryRepo = {
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve({ id: 7, ...e })),
      createQueryBuilder: jest.fn(() => makeCategoryQb(null)),
    };

    photoRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve({ id: 9, ...e })),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      })),
    };
    ai = { complete: jest.fn().mockResolvedValue('<p>análise</p>') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: getRepositoryToken(Expense), useValue: repo },
        { provide: getRepositoryToken(ExpenseAudio), useValue: audioRepo },
        { provide: getRepositoryToken(ExpensePhoto), useValue: photoRepo },
        { provide: getRepositoryToken(ExpenseCategory), useValue: categoryRepo },
        { provide: AiService, useValue: ai },
      ],
    }).compile();
    service = module.get(ExpenseService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('cria categoria nova pelo nome e zera parcelas fora do crédito', async () => {
      repo.findOne.mockResolvedValue({ id: 1 }); // findOne pós-save
      await service.create({
        title: 'Mercado',
        value: 100,
        type: 'debito',
        date: '2026-07-25',
        categoryName: 'Mercado',
        installments: 3, // deve ser ignorado (não é crédito)
      });

      expect(categoryRepo.save).toHaveBeenCalled(); // categoria criada
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 7, installments: null }),
      );
    });

    it('mantém parcelas quando é crédito', async () => {
      repo.findOne.mockResolvedValue({ id: 1 });
      await service.create({
        title: 'TV',
        value: 1200,
        type: 'credito',
        date: '2026-07-25',
        installments: 10,
      });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ installments: 10, categoryId: null }),
      );
    });
  });

  describe('summary', () => {
    it('agrega total do mês e por categoria', async () => {
      const qb = makeExpenseQb();
      qb.getRawOne.mockResolvedValue({ total: '540.50', count: '3' });
      qb.getRawMany.mockResolvedValue([
        { categoryId: 7, name: 'Mercado', total: '400.00' },
        { categoryId: null, name: null, total: '140.50' },
      ]);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.summary();

      expect(result.monthTotal).toBe(540.5);
      expect(result.count).toBe(3);
      expect(result.byCategory[1]).toEqual({
        categoryId: null,
        name: '',
        total: 140.5,
      });
    });
  });

  describe('áudio', () => {
    it('getAudio lança NotFound quando não há', async () => {
      audioRepo.findOne.mockResolvedValue(null);
      await expect(service.getAudio(1)).rejects.toThrow(NotFoundException);
    });

    it('setAudio faz upsert (cria quando não existe)', async () => {
      repo.findOne.mockResolvedValue({ id: 1 });
      audioRepo.findOne.mockResolvedValue(null);
      const result = await service.setAudio(1, {
        data: 'AAA',
        mimeType: 'audio/webm',
      });
      expect(audioRepo.create).toHaveBeenCalledWith({
        expenseId: 1,
        data: 'AAA',
        mimeType: 'audio/webm',
      });
      expect(result).toEqual({ data: 'AAA', mimeType: 'audio/webm' });
    });

    it('removeAudio lança NotFound quando nada foi apagado', async () => {
      audioRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.removeAudio(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('analyze', () => {
    it('agrega o período, chama a IA e devolve totais + análise', async () => {
      repo.find.mockResolvedValue([
        { value: 100, type: 'debito', date: '2026-07-02', title: 'A', category: { name: 'Mercado' }, installments: null },
        { value: 300, type: 'credito', date: '2026-07-05', title: 'B', category: null, installments: 3 },
      ]);

      const result = await service.analyze({ from: '2026-07-01', to: '2026-07-31' });

      expect(ai.complete).toHaveBeenCalled();
      expect(result.total).toBe(400);
      expect(result.count).toBe(2);
      // Maior primeiro (300 -> categoria "Sem categoria").
      expect(result.byCategory[0]).toEqual({
        name: 'Sem categoria',
        total: 300,
        count: 1,
      });
      expect(result.analysis).toBe('<p>análise</p>');
    });
  });

  describe('fotos', () => {
    it('addPhoto sobe pro Blob e guarda a referência', async () => {
      repo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.addPhoto(1, {
        data: Buffer.from('img').toString('base64'),
        mimeType: 'image/jpeg',
      });
      expect(put).toHaveBeenCalledWith(
        expect.stringContaining('expenses/1/photo'),
        expect.any(Buffer),
        expect.objectContaining({ access: 'private', contentType: 'image/jpeg' }),
      );
      expect(photoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expenseId: 1,
          pathname: 'expenses/1/p.jpg',
          url: 'https://blob/x',
          mimeType: 'image/jpeg',
        }),
      );
      expect(result).toMatchObject({ mimeType: 'image/jpeg' });
    });

    it('removePhoto lança NotFound quando a foto não existe', async () => {
      photoRepo.findOne.mockResolvedValue(null);
      await expect(service.removePhoto(1, 5)).rejects.toThrow(NotFoundException);
    });

    it('removePhoto apaga o blob e a linha', async () => {
      photoRepo.findOne.mockResolvedValue({ id: 5, url: 'https://blob/x' });
      photoRepo.delete.mockResolvedValue({ affected: 1 });
      await service.removePhoto(1, 5);
      expect(del).toHaveBeenCalledWith('https://blob/x');
      expect(photoRepo.delete).toHaveBeenCalledWith(5);
    });
  });

  describe('findAll', () => {
    it('marca hasAudio pelas rows com áudio', async () => {
      repo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      audioRepo.find.mockResolvedValue([{ expenseId: 2 }]);
      const { rows } = await service.findAll();
      expect(rows.find((r) => r.id === 1)?.hasAudio).toBe(false);
      expect(rows.find((r) => r.id === 2)?.hasAudio).toBe(true);
    });
  });
});
