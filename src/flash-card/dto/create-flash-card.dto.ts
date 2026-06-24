import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateFlashCardDto {
  // term varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'give up' })
  @IsString()
  @IsNotEmpty()
  term: string;

  // value varchar, opcional.
  @ApiPropertyOptional({ example: 'desistir' })
  @IsOptional()
  @IsString()
  value?: string;

  // picture (link do CDN), opcional.
  @ApiPropertyOptional({ example: 'https://cdn.exemplo.com/giveup.png' })
  @IsOptional()
  @IsString()
  picture?: string;

  // flashCardGroupId — FK obrigatória.
  @ApiProperty({ example: 1, description: 'Id do grupo (FK)' })
  @IsInt()
  @IsPositive()
  flashCardGroupId: number;

  // creatorId opcional enquanto não há autenticação.
  @ApiPropertyOptional({ example: 1, description: 'Id do criador (opcional até haver autenticação)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  creatorId?: number;
}
