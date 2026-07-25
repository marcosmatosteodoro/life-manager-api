import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class AnalyzeExpenseDto {
  @ApiProperty({ example: '2026-07-01', description: 'Início (YYYY-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from deve ser YYYY-MM-DD' })
  from: string;

  @ApiProperty({ example: '2026-07-31', description: 'Fim (YYYY-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to deve ser YYYY-MM-DD' })
  to: string;
}
