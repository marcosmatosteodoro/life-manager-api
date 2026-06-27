import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApplyStatus } from '../enums/apply-status.enum';

export class CreateApplyDto {
  // name varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'Vaga Backend Node - Acme' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // date date, obrigatório (YYYY-MM-DD).
  @ApiProperty({
    example: '2026-06-22',
    description: 'Data da candidatura (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  // status enum, obrigatório.
  @ApiProperty({ enum: ApplyStatus, example: ApplyStatus.APPLIED })
  @IsEnum(ApplyStatus)
  status: ApplyStatus;

  // companyId — FK obrigatória.
  @ApiProperty({ example: 1, description: 'Id da empresa (FK)' })
  @IsInt()
  @IsPositive()
  companyId: number;

  // link varchar, opcional.
  @ApiPropertyOptional({ example: 'https://acme.com/vagas/123' })
  @IsOptional()
  @IsString()
  link?: string;

  // description text, opcional.
  @ApiPropertyOptional({ example: 'Processo via LinkedIn...' })
  @IsOptional()
  @IsString()
  description?: string;

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
