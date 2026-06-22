import { ApiProperty } from '@nestjs/swagger';
import { Apply } from '../entities/apply.entity';

export class ApplyListResponseDto {
  // count: quantidade de registros retornados
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  // rows: os dados em si
  @ApiProperty({ type: Apply, isArray: true, description: 'Candidaturas' })
  rows: Apply[];
}
