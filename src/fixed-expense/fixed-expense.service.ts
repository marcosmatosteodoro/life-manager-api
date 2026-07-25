import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { tr } from '../i18n/translate';
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { FixedExpenseListResponseDto } from './dto/fixed-expense-list-response.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import { FixedExpense } from './entities/fixed-expense.entity';

@Injectable()
export class FixedExpenseService {
  constructor(
    @InjectRepository(FixedExpense)
    private readonly repository: Repository<FixedExpense>,
  ) {}

  create(dto: CreateFixedExpenseDto): Promise<FixedExpense> {
    return this.repository.save(
      this.repository.create({
        name: dto.name,
        value: dto.value,
        paymentDay: dto.paymentDay,
        isVariable: dto.isVariable ?? false,
        description: dto.description ?? null,
      }),
    );
  }

  /** Lista por dia de pagamento e traz o total mensal (soma dos valores). */
  async findAll(): Promise<FixedExpenseListResponseDto> {
    const rows = await this.repository.find({
      order: { paymentDay: 'ASC', name: 'ASC' },
    });
    const monthTotal = this.round(rows.reduce((sum, r) => sum + r.value, 0));
    return { count: rows.length, rows, monthTotal };
  }

  async findOne(id: number): Promise<FixedExpense> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(tr('expense.fixedNotFound', { id }));
    }
    return item;
  }

  async update(
    id: number,
    dto: UpdateFixedExpenseDto,
  ): Promise<FixedExpense> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const item = await this.repository.preload({ id, ...dto });
    if (!item) {
      throw new NotFoundException(tr('expense.fixedNotFound', { id }));
    }
    return this.repository.save(item);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('expense.fixedNotFound', { id }));
    }
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
