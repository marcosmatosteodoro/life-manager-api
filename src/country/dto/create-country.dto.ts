import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCountryDto {
  // name varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'Brasil' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // code varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'BR' })
  @IsString()
  @IsNotEmpty()
  code: string;

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
