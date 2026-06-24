import { ApiProperty } from '@nestjs/swagger';
import { FlashCard } from '../entities/flash-card.entity';

export class FlashCardListResponseDto {
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  @ApiProperty({ type: FlashCard, isArray: true, description: 'Flashcards' })
  rows: FlashCard[];
}
