import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsPositive } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/** Review de um único flashcard. */
export class ReviewFlashCardDto {
  // true = acertou (+1 correctAnswers, +1 score)
  // false = errou (+1 wrongAnswers, -1 score)
  @ApiProperty({
    example: true,
    description: 'Acertou (true) ou errou (false)',
  })
  @IsBoolean({
    message: i18nValidationMessage('validation.isBoolean', {
      property: 'acerto',
    }),
  })
  correctAnswers: boolean;
}

/** Item do review em lote (inclui o id do flashcard). */
export class ReviewFlashCardItemDto {
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

  @ApiProperty({
    example: true,
    description: 'Acertou (true) ou errou (false)',
  })
  @IsBoolean({
    message: i18nValidationMessage('validation.isBoolean', {
      property: 'acerto',
    }),
  })
  correctAnswers: boolean;
}
