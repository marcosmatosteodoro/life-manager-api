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

  create(
    dto: CreateProblemCategoryDto,
    userId: number,
  ): Promise<ProblemCategory> {
    return this.repository.save(
      this.repository.create({ ...dto, creatorId: userId }),
    );
  }

  /** Lista as categorias do usuário (ordem alfabética) para o select do front. */
  async findAll(userId: number): Promise<ProblemCategoryListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      where: { creatorId: userId },
      order: { name: 'ASC' },
    });
    return { count, rows };
  }

  async update(
    id: number,
    dto: UpdateProblemCategoryDto,
    userId: number,
  ): Promise<ProblemCategory> {
    // Escopo por dono: só edita se a categoria for do usuário.
    const category = await this.repository.findOne({
      where: { id, creatorId: userId },
    });
    if (!category) {
      throw new NotFoundException(tr('problem.categoryNotFound', { id }));
    }
    Object.assign(category, dto);
    return this.repository.save(category);
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.repository.delete({ id, creatorId: userId });
    if (!result.affected) {
      throw new NotFoundException(tr('problem.categoryNotFound', { id }));
    }
  }
}
