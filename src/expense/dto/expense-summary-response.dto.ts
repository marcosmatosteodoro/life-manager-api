import { ApiProperty } from '@nestjs/swagger';

export class ExpenseSummaryCategoryDto {
  @ApiProperty({ example: 1, nullable: true, description: 'null = sem categoria' })
  categoryId: number | null;

  @ApiProperty({ example: 'Mercado' })
  name: string;

  @ApiProperty({ example: 540.5 })
  total: number;
}

export class ExpenseSummaryResponseDto {
  @ApiProperty({ example: '2026-07', description: 'Mês de referência (YYYY-MM)' })
  month: string;

  @ApiProperty({ example: 1234.56, description: 'Total gasto no mês' })
  monthTotal: number;

  @ApiProperty({ example: 12, description: 'Qtd. de gastos no mês' })
  count: number;

  @ApiProperty({ type: ExpenseSummaryCategoryDto, isArray: true })
  byCategory: ExpenseSummaryCategoryDto[];
}
