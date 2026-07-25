import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FixedExpense } from './entities/fixed-expense.entity';
import { FixedExpenseService } from './fixed-expense.service';

describe('FixedExpenseService', () => {
  let service: FixedExpenseService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    preload: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve({ id: 1, ...e })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FixedExpenseService,
        { provide: getRepositoryToken(FixedExpense), useValue: repo },
      ],
    }).compile();

    service = module.get(FixedExpenseService);
  });

  describe('create', () => {
    it('cria com isVariable=false por padrão', async () => {
      await service.create({ name: 'Aluguel', value: 1200, paymentDay: 5 });
      expect(repo.create).toHaveBeenCalledWith({
        name: 'Aluguel',
        value: 1200,
        paymentDay: 5,
        isVariable: false,
        description: null,
      });
    });

    it('respeita isVariable=true (ex.: conta de luz)', async () => {
      await service.create({
        name: 'Luz',
        value: 189.9,
        paymentDay: 10,
        isVariable: true,
      });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isVariable: true }),
      );
    });
  });

  describe('findAll', () => {
    it('lista por dia de pagamento e soma o total mensal', async () => {
      repo.find.mockResolvedValue([
        { id: 1, value: 1200, paymentDay: 5 },
        { id: 2, value: 189.9, paymentDay: 10 },
      ]);
      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({
        order: { paymentDay: 'ASC', name: 'ASC' },
      });
      expect(result.count).toBe(2);
      expect(result.monthTotal).toBe(1389.9);
    });

    it('total mensal é 0 quando não há gastos', async () => {
      repo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual({ count: 0, rows: [], monthTotal: 0 });
    });
  });

  describe('findOne', () => {
    it('retorna o gasto fixo', async () => {
      repo.findOne.mockResolvedValue({ id: 1 });
      await expect(service.findOne(1)).resolves.toEqual({ id: 1 });
    });

    it('lança 404 quando não existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza via preload', async () => {
      repo.preload.mockResolvedValue({ id: 1, value: 200 });
      await service.update(1, { value: 200 });
      expect(repo.preload).toHaveBeenCalledWith({ id: 1, value: 200 });
      expect(repo.save).toHaveBeenCalledWith({ id: 1, value: 200 });
    });

    it('lança 404 quando o id não existe', async () => {
      repo.preload.mockResolvedValue(undefined);
      await expect(service.update(99, { value: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('remove quando existe', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('lança 404 quando nada é removido', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
