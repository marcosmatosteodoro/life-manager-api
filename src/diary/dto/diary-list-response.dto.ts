import { ApiProperty } from '@nestjs/swagger';
import { Diary } from '../entities/diary.entity';

export class DiaryListResponseDto {
  // count: quantidade de registros retornados
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  // rows: os dados em si
  @ApiProperty({
    type: Diary,
    isArray: true,
    description: 'Registros do diário',
  })
  rows: Diary[];
}
