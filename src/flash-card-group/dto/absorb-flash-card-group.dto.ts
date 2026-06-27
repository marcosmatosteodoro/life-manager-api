import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

/**
 * Payload para absorver um grupo em outro. O grupo destino é o do path (:id);
 * `sourceId` é o grupo que será mesclado (seus flashcards migram) e excluído.
 */
export class AbsorbFlashCardGroupDto {
  @ApiProperty({
    example: 2,
    description: 'Id do grupo a ser absorvido (mesclado no destino e excluído)',
  })
  @IsInt()
  @IsPositive()
  sourceId: number;
}
