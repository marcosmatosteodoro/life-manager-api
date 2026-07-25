import { ApiProperty } from '@nestjs/swagger';

class AnalysisCategoryDto {
  @ApiProperty({ example: 'Mercado' })
  name: string;

  @ApiProperty({ example: 540.5 })
  total: number;

  @ApiProperty({ example: 8 })
  count: number;
}

class AnalysisTypeDto {
  @ApiProperty({ example: 'credito' })
  type: string;

  @ApiProperty({ example: 1200 })
  total: number;

  @ApiProperty({ example: 3 })
  count: number;
}

export class ExpenseAnalysisResponseDto {
  @ApiProperty({ example: '2026-07-01' })
  from: string;

  @ApiProperty({ example: '2026-07-31' })
  to: string;

  @ApiProperty({ example: 1740.5 })
  total: number;

  @ApiProperty({ example: 11 })
  count: number;

  @ApiProperty({ type: AnalysisCategoryDto, isArray: true })
  byCategory: AnalysisCategoryDto[];

  @ApiProperty({ type: AnalysisTypeDto, isArray: true })
  byType: AnalysisTypeDto[];

  @ApiProperty({ description: 'Análise em HTML restrito (gerada por IA)' })
  analysis: string;
}
