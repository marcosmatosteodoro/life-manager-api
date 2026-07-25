import { ApiProperty } from '@nestjs/swagger';
import { DogWeight } from '../entities/dog-weight.entity';

export class DogWeightListResponseDto {
  @ApiProperty({ example: 5 })
  count: number;

  @ApiProperty({ type: DogWeight, isArray: true })
  rows: DogWeight[];
}
