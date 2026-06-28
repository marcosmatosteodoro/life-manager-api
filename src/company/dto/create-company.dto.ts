import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCompanyDto {
  // name varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // website varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'https://acme.com' })
  @IsString()
  @IsNotEmpty()
  website: string;

  // countryId — FK obrigatória.
  @ApiProperty({ example: 1, description: 'Id do país (FK)' })
  @IsInt()
  @IsPositive()
  countryId: number;

  // observation — anotações livres, opcional.
  @ApiPropertyOptional({
    example: 'Processo seletivo longo; recrutadora: Maria',
    description: 'Anotações livres sobre a empresa',
  })
  @IsOptional()
  @IsString()
  observation?: string;

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
