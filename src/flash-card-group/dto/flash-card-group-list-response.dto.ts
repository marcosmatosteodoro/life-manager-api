import { ApiProperty } from '@nestjs/swagger';
import { FlashCardGroup } from '../entities/flash-card-group.entity';

export class FlashCardGroupListResponseDto {
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  @ApiProperty({ type: FlashCardGroup, isArray: true, description: 'Grupos' })
  rows: FlashCardGroup[];
}
