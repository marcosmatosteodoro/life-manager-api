import { ApiProperty } from '@nestjs/swagger';
import { Dog } from '../entities/dog.entity';

export class DogListResponseDto {
  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ type: Dog, isArray: true })
  rows: Dog[];
}
