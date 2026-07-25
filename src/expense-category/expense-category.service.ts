import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseCategoryListResponseDto } from './dto/expense-category-list-response.dto';
import { ExpenseCategory } from './entities/expense-category.entity';

@Injectable()
export class ExpenseCategoryService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly repository: Repository<ExpenseCategory>,
  ) {}

  /** Lista as categorias (ordem alfabética) para o combobox do cadastro. */
  async findAll(): Promise<ExpenseCategoryListResponseDto> {
    const [rows, count] = await this.repository.findAndCount({
      order: { name: 'ASC' },
    });
    return { count, rows };
  }
}
