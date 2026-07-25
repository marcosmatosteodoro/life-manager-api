import { ApiProperty } from '@nestjs/swagger';
import { Expense } from '../entities/expense.entity';

export class ExpenseListResponseDto {
  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ type: Expense, isArray: true })
  rows: Expense[];
}
