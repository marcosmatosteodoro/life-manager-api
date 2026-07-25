import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateDogWalkDto {
  @ApiProperty({ example: [1, 2], description: 'Ids dos cães que passearam' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  dogIds: number[];

  @ApiProperty({ example: 1, description: 'Id do local (FK)' })
  @IsInt()
  @IsPositive()
  locationId: number;

  @ApiProperty({ example: '2026-07-22T08:00:00.000Z' })
  @IsDateString()
  startedAt: string;

  @ApiProperty({ example: '2026-07-22T08:35:00.000Z' })
  @IsDateString()
  endedAt: string;

  @ApiProperty({ example: 1800, description: 'Duração ativa em segundos' })
  @IsInt()
  @Min(0)
  durationSeconds: number;
}
