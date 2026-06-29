import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateTodoDto {
  // name varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'Treinar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // description text, opcional.
  @ApiPropertyOptional({ example: 'Academia ou corrida' })
  @IsOptional()
  @IsString()
  description?: string;

  // startDate obrigatório (YYYY-MM-DD).
  @ApiProperty({ example: '2026-06-01', description: 'Início (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  // endDate opcional (YYYY-MM-DD); null/ausente = sem fim.
  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Fim (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // days: 1..7 (ISO: 1=seg…7=dom), um ou mais.
  @ApiProperty({
    example: [1, 3, 5],
    description: 'Dias ISO (1=seg…7=dom), um ou mais',
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  days: number[];

  // tag varchar, opcional.
  @ApiPropertyOptional({ example: 'saúde' })
  @IsOptional()
  @IsString()
  tag?: string;

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
