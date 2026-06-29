import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateTodoCheckDto {
  // todoId — FK obrigatória.
  @ApiProperty({ example: 1, description: 'Id do todo (FK)' })
  @IsInt()
  @IsPositive()
  todoId: number;

  // date obrigatório (YYYY-MM-DD) — dia ao qual o check se refere.
  @ApiProperty({
    example: '2026-06-28',
    description: 'Dia do check (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  // checked opcional — ausente aplica o default (false).
  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  // creatorId opcional enquanto não há autenticação.
  @ApiPropertyOptional({
    example: 1,
    description: 'Id do criador (opcional até haver autenticação)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  creatorId?: number;
}
