import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../entities/expense-category.entity';

export class ExpenseCategoryListResponseDto {
  @ApiProperty({ example: 5 })
  count: number;

  @ApiProperty({ type: ExpenseCategory, isArray: true })
  rows: ExpenseCategory[];
}
