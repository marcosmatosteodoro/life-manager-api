import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseService } from '../expense/expense.service';
import { tr } from '../i18n/translate';
import { CreateDebtPaymentDto } from './dto/create-debt-payment.dto';
import { CreateDebtDto } from './dto/create-debt.dto';
import { DebtListResponseDto } from './dto/debt-list-response.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { DebtPayment } from './entities/debt-payment.entity';
import { Debt } from './entities/debt.entity';

/** Categoria dos gastos gerados pelas quitações (agrupa no resumo de gastos). */
const DEBT_EXPENSE_CATEGORY = 'Dívidas';

@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly repository: Repository<Debt>,
    @InjectRepository(DebtPayment)
    private readonly paymentRepository: Repository<DebtPayment>,
    private readonly expenseService: ExpenseService,
  ) {}

  async create(dto: CreateDebtDto): Promise<Debt> {
    const saved = await this.repository.save(
      this.repository.create({
        name: dto.name,
        totalAmount: dto.totalAmount,
        description: dto.description ?? null,
      }),
    );
    return this.findOne(saved.id);
  }

  /** Lista as dívidas com saldo calculado e os totais gerais. */
  async findAll(): Promise<DebtListResponseDto> {
    const rows = await this.repository.find({
      relations: { payments: true },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    rows.forEach((d) => this.attachBalance(d));
    const totalOwed = this.round(rows.reduce((s, d) => s + d.totalAmount, 0));
    const totalRemaining = this.round(
      rows.reduce((s, d) => s + (d.remaining ?? 0), 0),
    );
    return { count: rows.length, rows, totalOwed, totalRemaining };
  }

  async findOne(id: number): Promise<Debt> {
    const debt = await this.repository.findOne({
      where: { id },
      relations: { payments: true },
    });
    if (!debt) {
      throw new NotFoundException(tr('debt.notFound', { id }));
    }
    // Quitações mais recentes primeiro.
    debt.payments?.sort((a, b) => (a.date < b.date ? 1 : -1));
    this.attachBalance(debt);
    return debt;
  }

  async update(id: number, dto: UpdateDebtDto): Promise<Debt> {
    const debt = await this.findOne(id);
    if (dto.name !== undefined) debt.name = dto.name;
    if (dto.totalAmount !== undefined) debt.totalAmount = dto.totalAmount;
    if (dto.description !== undefined) debt.description = dto.description ?? null;
    await this.repository.save(debt);
    return this.findOne(id);
  }

  /** Remove a dívida e reverte os gastos gerados pelas suas quitações. */
  async remove(id: number): Promise<void> {
    const debt = await this.findOne(id);
    await this.deleteLinkedExpenses(debt.payments ?? []);
    // O CASCADE do FK apaga as quitações junto com a dívida.
    await this.repository.delete(id);
  }

  /**
   * Registra uma quitação (parcial ou total) e lança o gasto correspondente.
   * `settleAll` quita o saldo restante inteiro. Não permite pagar mais que o
   * saldo, nem quitar uma dívida já quitada.
   */
  async addPayment(debtId: number, dto: CreateDebtPaymentDto): Promise<Debt> {
    const debt = await this.findOne(debtId);
    const remaining = debt.remaining ?? 0;
    if (remaining <= 0) {
      throw new BadRequestException(tr('debt.alreadySettled', { id: debtId }));
    }

    const value = dto.settleAll ? remaining : this.round(dto.value ?? 0);
    if (value <= 0) {
      throw new BadRequestException(tr('debt.invalidValue'));
    }
    if (value > remaining) {
      throw new BadRequestException(
        tr('debt.valueExceedsRemaining', { remaining }),
      );
    }

    // 1) Gasto (vai para Finanças/Gastos, categoria "Dívidas").
    const expense = await this.expenseService.create({
      title: `${DEBT_EXPENSE_CATEGORY}: ${debt.name}`,
      value,
      type: 'debito',
      date: dto.date,
      categoryName: DEBT_EXPENSE_CATEGORY,
      description: dto.description,
    });

    // 2) Quitação vinculada ao gasto.
    await this.paymentRepository.save(
      this.paymentRepository.create({
        debtId,
        value,
        date: dto.date,
        description: dto.description ?? null,
        expenseId: expense.id,
      }),
    );

    return this.findOne(debtId);
  }

  /** Remove uma quitação e apaga o gasto que ela gerou (reverte). */
  async removePayment(debtId: number, paymentId: number): Promise<Debt> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, debtId },
    });
    if (!payment) {
      throw new NotFoundException(
        tr('debt.paymentNotFound', { id: paymentId }),
      );
    }
    await this.deleteLinkedExpenses([payment]);
    await this.paymentRepository.delete(payment.id);
    return this.findOne(debtId);
  }

  // ----- Helpers -----

  /** Preenche paidAmount/remaining/isSettled a partir das quitações. */
  private attachBalance(debt: Debt): void {
    const paid = this.round(
      (debt.payments ?? []).reduce((s, p) => s + p.value, 0),
    );
    debt.paidAmount = paid;
    debt.remaining = this.round(Math.max(0, debt.totalAmount - paid));
    debt.isSettled = debt.remaining <= 0;
  }

  /** Apaga os gastos vinculados às quitações (ignora os já removidos à parte). */
  private async deleteLinkedExpenses(payments: DebtPayment[]): Promise<void> {
    for (const p of payments) {
      if (p.expenseId == null) continue;
      await this.expenseService.remove(p.expenseId).catch(() => undefined);
    }
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
