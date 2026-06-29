import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';

/** Filtro opcional do histórico de checks (período e/ou afazer). */
export class TodoCheckQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filtra por afazer (todoId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  todoId?: number;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Início (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-06-30',
    description: 'Fim (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
