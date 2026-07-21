import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(dto: CreateProblemDto): Promise<Problem> {
    const problem = this.repository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? DEFAULT_STATUS,
      creatorId: dto.creatorId ?? null,
    });
    return this.repository.save(problem);
  }

  /** Lista os problemas (opcionalmente por status), mais recentes primeiro. */
  async findAll(status?: ProblemStatus): Promise<ProblemListResponseDto> {
    const rows = await this.repository.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
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

  /** Edita título, descrição e/ou status. */
  async update(id: number, dto: UpdateProblemDto): Promise<Problem> {
    const problem = await this.findOne(id);
    if (dto.title !== undefined) problem.title = dto.title;
    if (dto.description !== undefined) {
      problem.description = dto.description ?? null;
    }
    if (dto.status !== undefined) problem.status = dto.status;
    return this.repository.save(problem);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('problem.notFound', { id }));
    }
  }
}
