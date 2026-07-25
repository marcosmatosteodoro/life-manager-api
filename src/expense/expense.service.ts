import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { tr } from '../i18n/translate';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseAudioResponseDto } from './dto/expense-audio-response.dto';
import { ExpenseListResponseDto } from './dto/expense-list-response.dto';
import { ExpenseSummaryResponseDto } from './dto/expense-summary-response.dto';
import { SetExpenseAudioDto } from './dto/set-expense-audio.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseAudio } from './entities/expense-audio.entity';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,
    @InjectRepository(ExpenseAudio)
    private readonly audioRepository: Repository<ExpenseAudio>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const categoryId = await this.resolveCategory(dto);
    const expense = this.repository.create({
      title: dto.title,
      value: dto.value,
      type: dto.type,
      // Parcelas só no crédito.
      installments: dto.type === 'credito' ? (dto.installments ?? null) : null,
      date: dto.date,
      categoryId,
      description: dto.description ?? null,
    });
    const saved = await this.repository.save(expense);
    return this.findOne(saved.id);
  }

  /** Lista os gastos (mais recentes primeiro) com categoria e flag hasAudio. */
  async findAll(): Promise<ExpenseListResponseDto> {
    const rows = await this.repository.find({
      relations: { category: true },
      order: { date: 'DESC', id: 'DESC' },
    });
    await this.attachHasAudio(rows);
    return { count: rows.length, rows };
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.repository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!expense) {
      throw new NotFoundException(tr('expense.notFound', { id }));
    }
    return expense;
  }

  async update(id: number, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    if (dto.title !== undefined) expense.title = dto.title;
    if (dto.value !== undefined) expense.value = dto.value;
    if (dto.type !== undefined) expense.type = dto.type;
    if (dto.date !== undefined) expense.date = dto.date;
    if (dto.description !== undefined) {
      expense.description = dto.description ?? null;
    }
    // Categoria só muda quando categoryId/categoryName vêm no payload.
    if (dto.categoryId !== undefined || dto.categoryName !== undefined) {
      expense.categoryId = await this.resolveCategory(dto);
    }
    // Parcelas dependem do tipo final.
    const finalType = dto.type ?? expense.type;
    if (finalType !== 'credito') {
      expense.installments = null;
    } else if (dto.installments !== undefined) {
      expense.installments = dto.installments;
    }
    await this.repository.save(expense);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('expense.notFound', { id }));
    }
  }

  /** Resumo do mês corrente: total, quantidade e total por categoria. */
  async summary(): Promise<ExpenseSummaryResponseDto> {
    const now = new Date();
    const monthStart = this.monthStart(now);
    const nextMonthStart = this.monthStart(
      new Date(now.getFullYear(), now.getMonth() + 1, 1),
    );

    const totalsQb = this.repository
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.value), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('e.date >= :start AND e.date < :end', {
        start: monthStart,
        end: nextMonthStart,
      });

    const byCategoryQb = this.repository
      .createQueryBuilder('e')
      .leftJoin('e.category', 'c')
      .select('e.category_id', 'categoryId')
      .addSelect('c.name', 'name')
      .addSelect('SUM(e.value)', 'total')
      .where('e.date >= :start AND e.date < :end', {
        start: monthStart,
        end: nextMonthStart,
      })
      .groupBy('e.category_id')
      .addGroupBy('c.name')
      .orderBy('SUM(e.value)', 'DESC');

    const [totals, byCategory] = await Promise.all([
      totalsQb.getRawOne<{ total: string; count: string }>(),
      byCategoryQb.getRawMany<{
        categoryId: number | null;
        name: string | null;
        total: string;
      }>(),
    ]);

    return {
      month: monthStart.slice(0, 7),
      monthTotal: Number(totals?.total ?? 0),
      count: Number(totals?.count ?? 0),
      byCategory: byCategory.map((r) => ({
        categoryId: r.categoryId != null ? Number(r.categoryId) : null,
        name: r.name ?? '',
        total: Number(r.total),
      })),
    };
  }

  // ----- Áudio (descrição em voz) -----

  async getAudio(id: number): Promise<ExpenseAudioResponseDto> {
    const audio = await this.audioRepository.findOne({
      where: { expenseId: id },
    });
    if (!audio) {
      throw new NotFoundException(tr('expense.audioNotFound', { id }));
    }
    return { data: audio.data, mimeType: audio.mimeType };
  }

  async setAudio(
    id: number,
    dto: SetExpenseAudioDto,
  ): Promise<ExpenseAudioResponseDto> {
    await this.findOne(id); // garante 404 se o gasto não existe
    const existing = await this.audioRepository.findOne({
      where: { expenseId: id },
    });
    const audio = existing
      ? Object.assign(existing, { data: dto.data, mimeType: dto.mimeType })
      : this.audioRepository.create({
          expenseId: id,
          data: dto.data,
          mimeType: dto.mimeType,
        });
    const saved = await this.audioRepository.save(audio);
    return { data: saved.data, mimeType: saved.mimeType };
  }

  async removeAudio(id: number): Promise<void> {
    const result = await this.audioRepository.delete({ expenseId: id });
    if (!result.affected) {
      throw new NotFoundException(tr('expense.audioNotFound', { id }));
    }
  }

  // ----- Helpers -----

  /** Resolve a categoria: id existente, ou findOrCreate por nome, ou null. */
  private async resolveCategory(dto: {
    categoryId?: number;
    categoryName?: string;
  }): Promise<number | null> {
    if (dto.categoryId != null) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          tr('expense.categoryNotFound', { id: dto.categoryId }),
        );
      }
      return category.id;
    }
    const name = dto.categoryName?.trim();
    if (!name) return null;
    const existing = await this.categoryRepository
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:name)', { name })
      .getOne();
    if (existing) return existing.id;
    const created = await this.categoryRepository.save(
      this.categoryRepository.create({ name }),
    );
    return created.id;
  }

  /** Marca hasAudio sem carregar o blob (uma query pelos ids). */
  private async attachHasAudio(rows: Expense[]): Promise<void> {
    if (rows.length === 0) return;
    const audios = await this.audioRepository.find({
      where: { expenseId: In(rows.map((r) => r.id)) },
      select: { expenseId: true },
    });
    const withAudio = new Set(audios.map((a) => a.expenseId));
    for (const row of rows) row.hasAudio = withAudio.has(row.id);
  }

  private monthStart(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
  }
}
