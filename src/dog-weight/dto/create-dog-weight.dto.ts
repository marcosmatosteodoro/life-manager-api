import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsPositive,
  Matches,
} from 'class-validator';

export class CreateDogWeightDto {
  @ApiProperty({ example: 1, description: 'Id do cão (FK)' })
  @IsInt()
  @IsPositive()
  dogId: number;

  @ApiProperty({ example: 4.35 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  @ApiProperty({ example: '2026-07-22' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve ser YYYY-MM-DD' })
  date: string;
}
