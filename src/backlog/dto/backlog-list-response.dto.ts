import { ApiProperty } from '@nestjs/swagger';
import { BacklogItem } from '../entities/backlog-item.entity';

export class BacklogListResponseDto {
  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ type: BacklogItem, isArray: true })
  rows: BacklogItem[];
}
