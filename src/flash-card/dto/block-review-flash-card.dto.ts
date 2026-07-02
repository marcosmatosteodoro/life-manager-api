import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * Item do review em bloco (ex.: modo combinação). Um item por flashcard (ids
 * únicos), com as contagens acumuladas de acertos e erros daquela rodada.
 */
export class BlockReviewItemDto {
  @ApiProperty({ example: 1 })
  @IsInt({
    message: i18nValidationMessage('validation.isInt', { property: 'id' }),
  })
  @IsPositive({
    message: i18nValidationMessage('validation.min', {
      property: 'id',
      constraints: [1],
    }),
  })
  id: number;

  @ApiProperty({ example: 1, description: 'Acertos a somar (>= 0)' })
  @IsInt({
    message: i18nValidationMessage('validation.isInt', { property: 'acertos' }),
  })
  @Min(0, {
    message: i18nValidationMessage('validation.min', {
      property: 'acertos',
      constraints: [0],
    }),
  })
  correctAnswers: number;

  @ApiProperty({ example: 2, description: 'Erros a somar (>= 0)' })
  @IsInt({
    message: i18nValidationMessage('validation.isInt', { property: 'erros' }),
  })
  @Min(0, {
    message: i18nValidationMessage('validation.min', {
      property: 'erros',
      constraints: [0],
    }),
  })
  wrongAnswers: number;
}
