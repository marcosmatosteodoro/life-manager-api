import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import {
  DEFAULT_STATUS,
  PROBLEM_STATUSES,
  type ProblemStatus,
} from '../problem.constants';

export class CreateProblemDto {
  @ApiProperty({ example: 'Login lento em produção' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @ApiPropertyOptional({ example: 'Investigar consultas N+1 no dashboard.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: PROBLEM_STATUSES, default: DEFAULT_STATUS })
  @IsOptional()
  @IsIn(PROBLEM_STATUSES)
  status?: ProblemStatus;

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
