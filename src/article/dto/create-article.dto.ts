import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  // title string, obrigatório e não-vazio.
  @ApiProperty({ example: 'The Pragmatic Programmer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  // readingTime int, obrigatório e positivo.
  @ApiProperty({ example: 5, description: 'Tempo estimado de leitura (minutos)' })
  @IsInt()
  @IsPositive()
  readingTime: number;

  // timeRead int, obrigatório e positivo.
  @ApiProperty({ example: 7, description: 'Tempo gasto na leitura (minutos)' })
  @IsInt()
  @IsPositive()
  timeRead: number;

  // timeWrite int, opcional.
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  timeWrite?: number;

  // summary texto longo, opcional.
  @ApiPropertyOptional({ example: 'Resumo do artigo...' })
  @IsOptional()
  @IsString()
  summary?: string;

  // summaryCorrected texto longo, opcional.
  @ApiPropertyOptional({ example: 'Resumo corrigido...' })
  @IsOptional()
  @IsString()
  summaryCorrected?: string;

  // score int, opcional.
  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  score?: number;

  // creatorId opcional enquanto não há autenticação.
  @ApiPropertyOptional({ example: 1, description: 'Id do criador (opcional até haver autenticação)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  creatorId?: number;
}
