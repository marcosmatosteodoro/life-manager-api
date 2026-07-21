import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { tr } from '../i18n/translate';
import { CreateProblemDto } from './dto/create-problem.dto';
import { ProblemListResponseDto } from './dto/problem-list-response.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { Problem } from './entities/problem.entity';
import { DEFAULT_STATUS, type ProblemStatus } from './problem.constants';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private readonly repository: Repository<Problem>,
  ) {}

  /** Cria no fim da lista (position = maior + 1). */
  async create(dto: CreateProblemDto): Promise<Problem> {
    const next = (await this.maxPosition(this.repository.manager)) + 1;
    const problem = this.repository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? DEFAULT_STATUS,
      position: next,
      creatorId: dto.creatorId ?? null,
    });
    return this.repository.save(problem);
  }

  /** Lista os problemas (opcionalmente por status), na ordem manual (position ASC). */
  async findAll(status?: ProblemStatus): Promise<ProblemListResponseDto> {
    const rows = await this.repository.find({
      where: status ? { status } : {},
      order: { position: 'ASC' },
    });
    return { count: rows.length, rows };
  }

  async findOne(id: number): Promise<Problem> {
    const problem = await this.repository.findOne({ where: { id } });
    if (!problem) {
      throw new NotFoundException(tr('problem.notFound', { id }));
    }
    return problem;
  }

  /** Edita título, descrição e/ou status (a position muda pela rota de reorder). */
  async update(id: number, dto: UpdateProblemDto): Promise<Problem> {
    const problem = await this.findOne(id);
    if (dto.title !== undefined) problem.title = dto.title;
    if (dto.description !== undefined) {
      problem.description = dto.description ?? null;
    }
    if (dto.status !== undefined) problem.status = dto.status;
    return this.repository.save(problem);
  }

  /**
   * Reordena TODOS os problemas conforme a lista de ids (position = índice + 1).
   * Exige exatamente o conjunto existente (sem faltar/sobrar nem duplicar).
   */
  async reorder(orderedIds: number[]): Promise<ProblemListResponseDto> {
    return this.repository.manager.transaction(async (manager) => {
      const all = await manager.find(Problem, {});

      const existingIds = new Set(all.map((p) => p.id));
      const uniqueGiven = new Set(orderedIds);
      const sameSize =
        orderedIds.length === uniqueGiven.size &&
        uniqueGiven.size === existingIds.size;
      const sameSet = [...uniqueGiven].every((id) => existingIds.has(id));
      if (!sameSize || !sameSet) {
        throw new BadRequestException(tr('problem.reorderMismatch'));
      }

      const byId = new Map(all.map((p) => [p.id, p]));
      const toSave = orderedIds.map((id, index) => {
        const item = byId.get(id)!;
        item.position = index + 1;
        return item;
      });
      await manager.save(toSave);

      return {
        count: toSave.length,
        rows: [...toSave].sort((a, b) => a.position - b.position),
      };
    });
  }

  /** Remove e compacta as posições seguintes (decrementa quem vinha depois). */
  async remove(id: number): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      const problem = await manager.findOne(Problem, { where: { id } });
      if (!problem) {
        throw new NotFoundException(tr('problem.notFound', { id }));
      }
      const oldPosition = problem.position;
      await manager.remove(problem);
      await manager
        .createQueryBuilder()
        .update(Problem)
        .set({ position: () => 'position - 1' })
        .where('position > :threshold', { threshold: oldPosition })
        .execute();
    });
  }

  /** Maior position existente (0 se não houver). */
  private async maxPosition(manager: EntityManager): Promise<number> {
    const raw = await manager
      .createQueryBuilder(Problem, 'p')
      .select('MAX(p.position)', 'max')
      .getRawOne<{ max: number | null }>();
    return raw?.max ?? 0;
  }
}
