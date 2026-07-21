import { ApiProperty } from '@nestjs/swagger';
import { Problem } from '../entities/problem.entity';

export class ProblemListResponseDto {
  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ type: Problem, isArray: true })
  rows: Problem[];
}
