import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { tr } from '../i18n/translate';
import { CreateProblemCategoryDto } from './dto/create-problem-category.dto';
import { ProblemCategoryListResponseDto } from './dto/problem-category-list-response.dto';
import { UpdateProblemCategoryDto } from './dto/update-problem-category.dto';
import { ProblemCategory } from './entities/problem-category.entity';

@Injectable()
export class ProblemCategoryService {
  constructor(
    @InjectRepository(ProblemCategory)
    private readonly repository: Repository<ProblemCategory>,
  ) {}

  create(dto: CreateProblemCategoryDto): Promise<ProblemCategory> {
    return this.repository.save(this.repository.create(dto));
  }

  /** Lista as categorias (ordem alfabética) para popular o select do front. */
  async findAll(): Promise<ProblemCategoryListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      order: { name: 'ASC' },
    });
    return { count, rows };
  }

  async update(
    id: number,
    dto: UpdateProblemCategoryDto,
  ): Promise<ProblemCategory> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const category = await this.repository.preload({ id, ...dto });
    if (!category) {
      throw new NotFoundException(tr('problem.categoryNotFound', { id }));
    }
    return this.repository.save(category);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('problem.categoryNotFound', { id }));
    }
  }
}
