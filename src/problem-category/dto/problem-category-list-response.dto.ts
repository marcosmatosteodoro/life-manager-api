import { ApiProperty } from '@nestjs/swagger';
import { ProblemCategory } from '../entities/problem-category.entity';

export class ProblemCategoryListResponseDto {
  @ApiProperty({ example: 5 })
  count: number;

  @ApiProperty({ type: ProblemCategory, isArray: true })
  rows: ProblemCategory[];
}
