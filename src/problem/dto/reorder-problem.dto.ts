import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class ReorderProblemDto {
  @ApiProperty({
    example: [3, 1, 2],
    description: 'Ids de todos os problemas na nova ordem (position = índice + 1)',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  orderedIds: number[];
}
