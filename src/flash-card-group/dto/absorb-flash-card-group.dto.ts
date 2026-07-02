import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * Payload para absorver um grupo em outro. O grupo destino é o do path (:id);
 * `sourceId` é o grupo que será mesclado (seus flashcards migram) e excluído.
 */
export class AbsorbFlashCardGroupDto {
  @ApiProperty({
    example: 2,
    description: 'Id do grupo a ser absorvido (mesclado no destino e excluído)',
  })
  @IsInt({
    message: i18nValidationMessage('validation.isInt', {
      property: 'grupo de origem',
    }),
  })
  @IsPositive({
    message: i18nValidationMessage('validation.min', {
      property: 'grupo de origem',
      constraints: [1],
    }),
  })
  sourceId: number;
}
