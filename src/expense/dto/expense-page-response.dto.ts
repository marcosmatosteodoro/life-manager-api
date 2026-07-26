import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../../expense-category/entities/expense-category.entity';
import { Expense } from '../entities/expense.entity';
import { ExpenseSummaryResponseDto } from './expense-summary-response.dto';

/**
 * Payload agregado da página de Gastos (uma requisição em vez de três:
 * lista + categorias + resumo). Espelha o padrão da Home.
 */
export class ExpensePageResponseDto {
  @ApiProperty({ type: Expense, isArray: true })
  expenses: Expense[];

  @ApiProperty({ type: ExpenseCategory, isArray: true })
  categories: ExpenseCategory[];

  @ApiProperty({ type: ExpenseSummaryResponseDto })
  summary: ExpenseSummaryResponseDto;
}
