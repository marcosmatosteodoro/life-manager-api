import { ApiProperty } from '@nestjs/swagger';
import { Weight } from '../entities/weight.entity';

export class WeightListResponseDto {
  // count: quantidade de registros retornados
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  // rows: os dados em si
  @ApiProperty({
    type: Weight,
    isArray: true,
    description: 'Registros de peso',
  })
  rows: Weight[];
}
