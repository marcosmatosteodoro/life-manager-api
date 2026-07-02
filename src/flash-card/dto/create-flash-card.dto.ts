import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateFlashCardDto {
  // term varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'give up' })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'termo',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty', {
      property: 'termo',
    }),
  })
  term: string;

  // value varchar, opcional.
  @ApiPropertyOptional({ example: 'desistir' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'valor',
    }),
  })
  value?: string;

  // picture (link do CDN), opcional.
  @ApiPropertyOptional({ example: 'https://cdn.exemplo.com/giveup.png' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'imagem',
    }),
  })
  picture?: string;

  // flashCardGroupId — FK obrigatória.
  @ApiProperty({ example: 1, description: 'Id do grupo (FK)' })
  @IsInt({
    message: i18nValidationMessage('validation.isInt', { property: 'grupo' }),
  })
  @IsPositive({
    message: i18nValidationMessage('validation.min', {
      property: 'grupo',
      constraints: [1],
    }),
  })
  flashCardGroupId: number;

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
