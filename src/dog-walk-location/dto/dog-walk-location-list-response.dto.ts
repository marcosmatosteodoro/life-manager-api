import { ApiProperty } from '@nestjs/swagger';
import { DogWalkLocation } from '../entities/dog-walk-location.entity';

export class DogWalkLocationListResponseDto {
  @ApiProperty({ example: 2 })
  count: number;

  @ApiProperty({ type: DogWalkLocation, isArray: true })
  rows: DogWalkLocation[];
}
