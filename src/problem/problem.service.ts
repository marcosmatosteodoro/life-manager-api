import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ProblemCategory } from '../problem-category/entities/problem-category.entity';
import { tr } from '../i18n/translate';
import { CreateProblemDto } from './dto/create-problem.dto';
import { ProblemListResponseDto } from './dto/problem-list-response.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { Problem } from './entities/problem.entity';
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  type ProblemStatus,
} from './problem.constants';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private readonly repository: Repository<Problem>,
    @InjectRepository(ProblemCategory)
    private readonly categoryRepository: Repository<ProblemCategory>,
  ) {}

  /** Cria no fim da lista do usuário (position = maior + 1). */
  async create(dto: CreateProblemDto, userId: number): Promise<Problem> {
    if (dto.categoryId != null) {
      await this.ensureCategoryExists(dto.categoryId, userId);
    }
    const next = (await this.maxPosition(this.repository.manager, userId)) + 1;
    const problem = this.repository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? DEFAULT_STATUS,
      priority: dto.priority ?? DEFAULT_PRIORITY,
      position: next,
      categoryId: dto.categoryId ?? null,
      creatorId: userId,
    });
    return this.repository.save(problem);
  }

  /** Lista os problemas do usuário (opcional por status), na ordem manual. */
  async findAll(
    userId: number,
    status?: ProblemStatus,
  ): Promise<ProblemListResponseDto> {
    const rows = await this.repository.find({
      where: { creatorId: userId, ...(status ? { status } : {}) },
      relations: { category: true },
      order: { position: 'ASC' },
    });
    return { count: rows.length, rows };
  }

  async findOne(id: number, userId: number): Promise<Problem> {
    const problem = await this.repository.findOne({
      where: { id, creatorId: userId },
      relations: { category: true },
    });
    if (!problem) {
      throw new NotFoundException(tr('problem.notFound', { id }));
    }
    return problem;
  }

  /** Edita título, descrição, status e/ou categoria (a position muda no reorder). */
  async update(
    id: number,
    dto: UpdateProblemDto,
    userId: number,
  ): Promise<Problem> {
    const problem = await this.findOne(id, userId);
    if (dto.title !== undefined) problem.title = dto.title;
    if (dto.description !== undefined) {
      problem.description = dto.description ?? null;
    }
    if (dto.status !== undefined) problem.status = dto.status;
    if (dto.priority !== undefined) problem.priority = dto.priority;
    if (dto.categoryId !== undefined) {
      if (dto.categoryId != null) {
        await this.ensureCategoryExists(dto.categoryId, userId);
      }
      problem.categoryId = dto.categoryId;
    }
    return this.repository.save(problem);
  }

  /**
   * Reordena TODOS os problemas conforme a lista de ids (position = índice + 1).
   * Exige exatamente o conjunto existente (sem faltar/sobrar nem duplicar).
   */
  async reorder(
    orderedIds: number[],
    userId: number,
  ): Promise<ProblemListResponseDto> {
    return this.repository.manager.transaction(async (manager) => {
      const all = await manager.find(Problem, {
        where: { creatorId: userId },
      });

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
  async remove(id: number, userId: number): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      const problem = await manager.findOne(Problem, {
        where: { id, creatorId: userId },
      });
      if (!problem) {
        throw new NotFoundException(tr('problem.notFound', { id }));
      }
      const oldPosition = problem.position;
      await manager.remove(problem);
      // Compacta só a lista do próprio usuário.
      await manager
        .createQueryBuilder()
        .update(Problem)
        .set({ position: () => 'position - 1' })
        .where('position > :threshold AND creator_id = :userId', {
          threshold: oldPosition,
          userId,
        })
        .execute();
    });
  }

  /** Garante que a categoria referenciada existe E é do usuário (erro limpo). */
  private async ensureCategoryExists(
    categoryId: number,
    userId: number,
  ): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, creatorId: userId },
    });
    if (!category) {
      throw new NotFoundException(
        tr('problem.categoryNotFound', { id: categoryId }),
      );
    }
  }

  /** Maior position do usuário (0 se não houver). */
  private async maxPosition(
    manager: EntityManager,
    userId: number,
  ): Promise<number> {
    const raw = await manager
      .createQueryBuilder(Problem, 'p')
      .select('MAX(p.position)', 'max')
      .where('p.creatorId = :userId', { userId })
      .getRawOne<{ max: number | null }>();
    return raw?.max ?? 0;
  }
}
