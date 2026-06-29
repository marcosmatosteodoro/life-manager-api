import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min } from 'class-validator';

/**
 * Item do review em bloco (ex.: modo combinação). Um item por flashcard (ids
 * únicos), com as contagens acumuladas de acertos e erros daquela rodada.
 */
export class BlockReviewItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ example: 1, description: 'Acertos a somar (>= 0)' })
  @IsInt()
  @Min(0)
  correctAnswers: number;

  @ApiProperty({ example: 2, description: 'Erros a somar (>= 0)' })
  @IsInt()
  @Min(0)
  wrongAnswers: number;
}
