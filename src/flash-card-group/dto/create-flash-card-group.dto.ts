import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateFlashCardGroupDto {
  // name varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'Phrasal Verbs' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // creatorId opcional enquanto não há autenticação.
  @ApiPropertyOptional({ example: 1, description: 'Id do criador (opcional até haver autenticação)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  creatorId?: number;
}
