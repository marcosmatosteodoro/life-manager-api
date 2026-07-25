import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { AdviceStatus } from '../enums/advice-status.enum';
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

  // Humano (app) ou robô (extensão). Omitido = humano (default no service).
  @ApiPropertyOptional({
    example: true,
    description: 'Humano (app) ou robô (extensão). Padrão: humano.',
  })
  @IsOptional()
  @IsBoolean()
  isHuman?: boolean;

  // Conselho da extensão: 1 não aplique … 4 ótimo match. Opcional.
  @ApiPropertyOptional({ enum: AdviceStatus, example: AdviceStatus.EVALUATE })
  @IsOptional()
  @IsEnum(AdviceStatus)
  adviceStatus?: AdviceStatus;

  // Motivo/decisão, opcional.
  @ApiPropertyOptional({ example: 'Extensão não soube; apliquei porque...' })
  @IsOptional()
  @IsString()
  decisionDescription?: string;
}
