import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import {
  FLASH_CARD_GROUP_TYPES,
  type FlashCardGroupType,
} from '../flash-card-group.constants';

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

  // Tipo do grupo: 'text' (padrão quando omitido) ou 'image'.
  @ApiPropertyOptional({ enum: FLASH_CARD_GROUP_TYPES, example: 'text' })
  @IsOptional()
  @IsIn(FLASH_CARD_GROUP_TYPES)
  type?: FlashCardGroupType;

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
