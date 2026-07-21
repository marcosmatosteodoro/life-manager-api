import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProblemCategoryListResponseDto } from './dto/problem-category-list-response.dto';
import { ProblemCategory } from './entities/problem-category.entity';

@Injectable()
export class ProblemCategoryService {
  constructor(
    @InjectRepository(ProblemCategory)
    private readonly repository: Repository<ProblemCategory>,
  ) {}

  /** Lista as categorias (ordem alfabética) para popular o select do front. */
  async findAll(): Promise<ProblemCategoryListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      order: { name: 'ASC' },
    });
    return { count, rows };
  }
}
