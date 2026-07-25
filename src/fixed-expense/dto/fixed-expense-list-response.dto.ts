import { ApiProperty } from '@nestjs/swagger';
import { FixedExpense } from '../entities/fixed-expense.entity';

export class FixedExpenseListResponseDto {
  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ type: FixedExpense, isArray: true })
  rows: FixedExpense[];

  // Total mensal (soma dos valores) — quanto sai por mês em gastos fixos.
  @ApiProperty({ example: 1250.5 })
  monthTotal: number;
}
