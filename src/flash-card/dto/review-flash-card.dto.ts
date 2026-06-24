import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsPositive } from 'class-validator';

/** Review de um único flashcard. */
export class ReviewFlashCardDto {
  // true = acertou (+1 correctAnswers, +1 score)
  // false = errou (+1 wrongAnswers, -1 score)
  @ApiProperty({ example: true, description: 'Acertou (true) ou errou (false)' })
  @IsBoolean()
  correctAnswers: boolean;
}

/** Item do review em lote (inclui o id do flashcard). */
export class ReviewFlashCardItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ example: true, description: 'Acertou (true) ou errou (false)' })
  @IsBoolean()
  correctAnswers: boolean;
}
