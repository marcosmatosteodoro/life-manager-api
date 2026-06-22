import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';

export class CreateWeightDto {
  // value float com 2 casas decimais, obrigatório e positivo.
  @ApiProperty({ example: 81.55, description: 'Peso com até 2 casas decimais' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  // date obrigatório, formato ISO (YYYY-MM-DD).
  @ApiProperty({ example: '2026-06-22', description: 'Data da medição (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  // time opcional, formato HH:MM ou HH:MM:SS.
  @ApiPropertyOptional({ example: '08:30:00', description: 'Hora da medição (HH:MM ou HH:MM:SS)' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'time deve estar no formato HH:MM ou HH:MM:SS',
  })
  time?: string;

  // creatorId opcional enquanto não há autenticação.
  @ApiPropertyOptional({ example: 1, description: 'Id do criador (opcional até haver autenticação)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  creatorId?: number;
}
