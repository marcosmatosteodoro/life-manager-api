import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateFlashCardGroupDto {
  // name varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'Phrasal Verbs' })
  @IsString({
    message: i18nValidationMessage('validation.isString', { property: 'nome' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty', {
      property: 'nome',
    }),
  })
  name: string;

  // creatorId opcional enquanto não há autenticação.
  @ApiPropertyOptional({
    example: 1,
    description: 'Id do criador (opcional até haver autenticação)',
  })
  @IsOptional()
  @IsInt({
    message: i18nValidationMessage('validation.isInt', { property: 'criador' }),
  })
  @IsPositive({
    message: i18nValidationMessage('validation.min', {
      property: 'criador',
      constraints: [1],
    }),
  })
  creatorId?: number;
}
