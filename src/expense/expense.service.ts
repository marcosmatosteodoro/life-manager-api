import { randomUUID } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { del, get, put } from '@vercel/blob';
import { Between, In, Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { tr } from '../i18n/translate';
import { AddExpensePhotoDto } from './dto/add-expense-photo.dto';
import { AnalyzeExpenseDto } from './dto/analyze-expense.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseAnalysisResponseDto } from './dto/expense-analysis-response.dto';
import { ExpenseAudioResponseDto } from './dto/expense-audio-response.dto';
import { ExpenseListResponseDto } from './dto/expense-list-response.dto';
import { ExpensePhotoResponseDto } from './dto/expense-photo-response.dto';
import { ExpenseSummaryResponseDto } from './dto/expense-summary-response.dto';
import { SetExpenseAudioDto } from './dto/set-expense-audio.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import {
  buildExpenseAnalysisInput,
  EXPENSE_ANALYSIS_SYSTEM,
} from './prompts/expense-analysis.prompt';
import { ExpenseAudio } from './entities/expense-audio.entity';
import { ExpensePhoto } from './entities/expense-photo.entity';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,
    @InjectRepository(ExpenseAudio)
    private readonly audioRepository: Repository<ExpenseAudio>,
    @InjectRepository(ExpensePhoto)
    private readonly photoRepository: Repository<ExpensePhoto>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
    private readonly aiService: AiService,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const categoryId = await this.resolveCategory(dto);
    const installments =
      dto.type === 'credito' ? (dto.installments ?? null) : null;

    // Crédito com 2+ parcelas: gera um lançamento por mês (valor = valor da
    // parcela), recorrendo a partir da data até acabar. Cada parcela cai no seu
    // mês, então resumo/análise (que somam por data) já funcionam sozinhos.
    if (installments && installments >= 2) {
      const groupId = randomUUID();
      const parcels = Array.from({ length: installments }, (_, i) =>
        this.repository.create({
          title: dto.title,
          value: dto.value,
          type: dto.type,
          installments,
          parcelGroupId: groupId,
          parcelNumber: i + 1,
          date: this.addMonths(dto.date, i),
          categoryId,
          description: dto.description ?? null,
        }),
      );
      const saved = await this.repository.save(parcels);
      return this.findOne(saved[0].id);
    }

    const expense = this.repository.create({
      title: dto.title,
      value: dto.value,
      type: dto.type,
      installments,
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
    await Promise.all([this.attachHasAudio(rows), this.attachPhotoCount(rows)]);
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

  /**
   * Remove um gasto. Se for uma parcela, remove a compra inteira (todas as
   * parcelas do grupo) — parcelamento é tratado como uma coisa só.
   */
  async remove(id: number): Promise<void> {
    const expense = await this.repository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(tr('expense.notFound', { id }));
    }
    if (expense.parcelGroupId) {
      await this.repository.delete({ parcelGroupId: expense.parcelGroupId });
      return;
    }
    await this.repository.delete(id);
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

  /** Análise dos gastos do período via IA (não persiste; chamada paga). */
  async analyze(dto: AnalyzeExpenseDto): Promise<ExpenseAnalysisResponseDto> {
    const expenses = await this.repository.find({
      where: { date: Between(dto.from, dto.to) },
      relations: { category: true },
      order: { date: 'ASC' },
    });

    const total = this.round(expenses.reduce((s, e) => s + e.value, 0));
    const days = Math.max(1, this.daysBetween(dto.from, dto.to) + 1);

    const byCategory = this.groupTotals(
      expenses,
      (e) => e.category?.name ?? 'Sem categoria',
    );
    const byType = this.groupTotals(expenses, (e) => e.type);

    const topExpenses = [...expenses]
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((e) => ({
        titulo: e.title,
        valor: e.value,
        data: e.date,
        categoria: e.category?.name ?? null,
        tipo: e.type,
        parcelas: e.installments,
      }));

    const data = {
      periodo: { de: dto.from, ate: dto.to, dias: days },
      total,
      quantidade: expenses.length,
      mediaPorDia: this.round(total / days),
      porCategoria: byCategory.map((c) => ({
        categoria: c.key,
        total: c.total,
        qtd: c.count,
      })),
      porTipo: byType.map((tt) => ({ tipo: tt.key, total: tt.total, qtd: tt.count })),
      maioresGastos: topExpenses,
    };

    const analysis = await this.aiService.complete({
      system: EXPENSE_ANALYSIS_SYSTEM,
      user: buildExpenseAnalysisInput(dto.from, dto.to, data),
    });

    return {
      from: dto.from,
      to: dto.to,
      total,
      count: expenses.length,
      byCategory: byCategory.map((c) => ({
        name: c.key,
        total: c.total,
        count: c.count,
      })),
      byType: byType.map((tt) => ({
        type: tt.key,
        total: tt.total,
        count: tt.count,
      })),
      analysis,
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

  // ----- Fotos (Vercel Blob privado; Postgres guarda só a referência) -----

  /**
   * Fotos do gasto em base64, lidas do Blob (privado) sob demanda. A leitura
   * passa pelo back autenticado — o binário nunca fica exposto por URL pública.
   */
  async listPhotos(id: number): Promise<ExpensePhotoResponseDto[]> {
    const photos = await this.photoRepository.find({
      where: { expenseId: id },
      order: { id: 'ASC' },
    });
    return Promise.all(
      photos.map(async (p) => ({
        id: p.id,
        mimeType: p.mimeType,
        data: await this.readBlobBase64(p.pathname),
      })),
    );
  }

  async addPhoto(
    id: number,
    dto: AddExpensePhotoDto,
  ): Promise<ExpensePhotoResponseDto> {
    await this.findOne(id); // garante 404 se o gasto não existe
    const ext = dto.mimeType.split('/')[1]?.replace(/[^\w]/g, '') || 'bin';
    const buffer = Buffer.from(dto.data, 'base64');
    // Blob privado; addRandomSuffix evita colisão de nome.
    const blob = await put(`expenses/${id}/photo.${ext}`, buffer, {
      access: 'private',
      contentType: dto.mimeType,
      addRandomSuffix: true,
    });
    const saved = await this.photoRepository.save(
      this.photoRepository.create({
        expenseId: id,
        pathname: blob.pathname,
        url: blob.url,
        mimeType: dto.mimeType,
      }),
    );
    return { id: saved.id, data: dto.data, mimeType: saved.mimeType };
  }

  async removePhoto(id: number, photoId: number): Promise<void> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId, expenseId: id },
    });
    if (!photo) {
      throw new NotFoundException(tr('expense.photoNotFound', { id: photoId }));
    }
    // Apaga o blob e depois a linha (se o blob já não existir, ignora).
    await del(photo.url).catch(() => undefined);
    await this.photoRepository.delete(photo.id);
  }

  /** Lê um blob privado e devolve o conteúdo em base64. */
  private async readBlobBase64(pathname: string): Promise<string> {
    const result = await get(pathname, { access: 'private' });
    if (!result?.stream) return '';
    const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
    return buffer.toString('base64');
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

  /** Conta fotos por gasto (uma query agregada, sem carregar os blobs). */
  private async attachPhotoCount(rows: Expense[]): Promise<void> {
    if (rows.length === 0) return;
    const counts = await this.photoRepository
      .createQueryBuilder('p')
      .select('p.expense_id', 'expenseId')
      .addSelect('COUNT(*)', 'count')
      .where('p.expense_id IN (:...ids)', { ids: rows.map((r) => r.id) })
      .groupBy('p.expense_id')
      .getRawMany<{ expenseId: number; count: string }>();
    const byId = new Map(counts.map((c) => [Number(c.expenseId), Number(c.count)]));
    for (const row of rows) row.photoCount = byId.get(row.id) ?? 0;
  }

  private monthStart(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }

  /** Agrupa por uma chave, somando valores e contando, ordenado por total DESC. */
  private groupTotals(
    expenses: Expense[],
    keyOf: (e: Expense) => string,
  ): { key: string; total: number; count: number }[] {
    const map = new Map<string, { total: number; count: number }>();
    for (const e of expenses) {
      const key = keyOf(e);
      const acc = map.get(key) ?? { total: 0, count: 0 };
      acc.total += e.value;
      acc.count += 1;
      map.set(key, acc);
    }
    return [...map.entries()]
      .map(([key, v]) => ({ key, total: this.round(v.total), count: v.count }))
      .sort((a, b) => b.total - a.total);
  }

  private daysBetween(from: string, to: string): number {
    const a = new Date(`${from}T00:00:00`);
    const b = new Date(`${to}T00:00:00`);
    return Math.round((b.getTime() - a.getTime()) / 86_400_000);
  }

  /**
   * Soma `months` meses a uma data YYYY-MM-DD (só string, sem fuso). Ajusta o
   * dia para o último do mês quando o mês alvo é mais curto (ex.: 31/jan +1 mês
   * = 28/fev).
   */
  private addMonths(date: string, months: number): string {
    const [y, m, d] = date.split('-').map(Number);
    const total = (m - 1) + months;
    const year = y + Math.floor(total / 12);
    const month = (total % 12) + 1;
    const lastDay = new Date(year, month, 0).getDate();
    const day = Math.min(d, lastDay);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}`;
  }
}
