import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExpenseService } from '../expense/expense.service';
import { DebtPayment } from './entities/debt-payment.entity';
import { Debt } from './entities/debt.entity';
import { DebtService } from './debt.service';

describe('DebtService', () => {
  let service: DebtService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let paymentRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let expenseService: { create: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve({ id: 1, ...e })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    paymentRepo = {
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve({ id: 10, ...e })),
      findOne: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    expenseService = {
      create: jest.fn().mockResolvedValue({ id: 42 }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebtService,
        { provide: getRepositoryToken(Debt), useValue: repo },
        { provide: getRepositoryToken(DebtPayment), useValue: paymentRepo },
        { provide: ExpenseService, useValue: expenseService },
      ],
    }).compile();

    service = module.get(DebtService);
  });

  /** Dívida com quitações para os testes de findOne. */
  const debtWith = (totalAmount: number, payments: Partial<DebtPayment>[]) =>
    ({ id: 1, name: 'Cartão', totalAmount, payments }) as Debt;

  describe('findAll', () => {
    it('calcula saldo por dívida e os totais gerais', async () => {
      repo.find.mockResolvedValue([
        { id: 1, totalAmount: 1000, payments: [{ value: 300 }] },
        { id: 2, totalAmount: 500, payments: [] },
      ]);
      const res = await service.findAll();
      expect(res.rows[0].paidAmount).toBe(300);
      expect(res.rows[0].remaining).toBe(700);
      expect(res.rows[0].isSettled).toBe(false);
      expect(res.totalOwed).toBe(1500);
      expect(res.totalRemaining).toBe(1200);
    });
  });

  describe('findOne', () => {
    it('marca isSettled quando o saldo zera', async () => {
      repo.findOne.mockResolvedValue(debtWith(300, [{ value: 300 }]));
      const debt = await service.findOne(1);
      expect(debt.remaining).toBe(0);
      expect(debt.isSettled).toBe(true);
    });

    it('lança 404 quando não existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(9)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addPayment', () => {
    it('quitação parcial: cria gasto e vincula', async () => {
      repo.findOne.mockResolvedValue(debtWith(1000, [{ value: 200 }]));
      await service.addPayment(1, { value: 300, date: '2026-07-25' });

      expect(expenseService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 300,
          type: 'debito',
          categoryName: 'Dívidas',
          date: '2026-07-25',
        }),
      );
      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ debtId: 1, value: 300, expenseId: 42 }),
      );
    });

    it('settleAll usa o saldo restante como valor', async () => {
      repo.findOne.mockResolvedValue(debtWith(1000, [{ value: 200 }]));
      await service.addPayment(1, { date: '2026-07-25', settleAll: true });
      expect(expenseService.create).toHaveBeenCalledWith(
        expect.objectContaining({ value: 800 }),
      );
    });

    it('rejeita valor maior que o saldo', async () => {
      repo.findOne.mockResolvedValue(debtWith(1000, [{ value: 900 }]));
      await expect(
        service.addPayment(1, { value: 300, date: '2026-07-25' }),
      ).rejects.toThrow(BadRequestException);
      expect(expenseService.create).not.toHaveBeenCalled();
    });

    it('rejeita quitar dívida já quitada', async () => {
      repo.findOne.mockResolvedValue(debtWith(500, [{ value: 500 }]));
      await expect(
        service.addPayment(1, { value: 10, date: '2026-07-25' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removePayment', () => {
    it('apaga o gasto vinculado e a quitação', async () => {
      paymentRepo.findOne.mockResolvedValue({
        id: 10,
        debtId: 1,
        expenseId: 42,
      });
      repo.findOne.mockResolvedValue(debtWith(1000, []));
      await service.removePayment(1, 10);
      expect(expenseService.remove).toHaveBeenCalledWith(42);
      expect(paymentRepo.delete).toHaveBeenCalledWith(10);
    });

    it('lança 404 quando a quitação não existe', async () => {
      paymentRepo.findOne.mockResolvedValue(null);
      await expect(service.removePayment(1, 99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('reverte os gastos das quitações e apaga a dívida', async () => {
      repo.findOne.mockResolvedValue(
        debtWith(1000, [{ expenseId: 42 }, { expenseId: 43 }]),
      );
      await service.remove(1);
      expect(expenseService.remove).toHaveBeenCalledWith(42);
      expect(expenseService.remove).toHaveBeenCalledWith(43);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });
  });
});
