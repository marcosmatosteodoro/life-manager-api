import { ApiProperty } from '@nestjs/swagger';
import { DogWalk } from '../entities/dog-walk.entity';

export class DogWalkListResponseDto {
  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ type: DogWalk, isArray: true })
  rows: DogWalk[];
}
