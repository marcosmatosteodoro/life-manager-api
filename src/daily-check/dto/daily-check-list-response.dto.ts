import { ApiProperty } from '@nestjs/swagger';
import { DailyCheck } from '../entities/daily-check.entity';

export class DailyCheckListResponseDto {
  // count: quantidade de registros retornados
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  // rows: os dados em si
  @ApiProperty({
    type: DailyCheck,
    isArray: true,
    description: 'Checks diários',
  })
  rows: DailyCheck[];
}
