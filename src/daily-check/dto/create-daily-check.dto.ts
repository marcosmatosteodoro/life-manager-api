import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateDailyCheckDto {
  // date obrigatório, formato ISO (YYYY-MM-DD).
  @ApiProperty({
    example: '2026-06-22',
    description: 'Data do check (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  // Skills opcionais — quando ausentes, o banco aplica o default (false).
  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  readingSkills?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  writingSkills?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  listeningSkills?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  speakingSkills?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  applyJobs?: boolean;

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
