import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  PROBLEM_PRIORITIES,
  PROBLEM_STATUSES,
  type ProblemPriority,
  type ProblemStatus,
} from '../problem.constants';

export class CreateProblemDto {
  @ApiProperty({ example: 'Marcar consulta no dentista' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @ApiPropertyOptional({ example: 'Escolher o convênio e ligar para agendar.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: PROBLEM_STATUSES, default: DEFAULT_STATUS })
  @IsOptional()
  @IsIn(PROBLEM_STATUSES)
  status?: ProblemStatus;

  @ApiPropertyOptional({ enum: PROBLEM_PRIORITIES, default: DEFAULT_PRIORITY })
  @IsOptional()
  @IsIn(PROBLEM_PRIORITIES)
  priority?: ProblemPriority;

  // categoryId opcional; `null` limpa a categoria (não é obrigatória).
  @ApiPropertyOptional({ example: 1, nullable: true, description: 'Id da categoria (FK)' })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @IsPositive()
  categoryId?: number | null;

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
