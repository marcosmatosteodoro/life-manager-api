import { ApiProperty } from '@nestjs/swagger';
import { TodoCheck } from '../entities/todo-check.entity';

export class TodoCheckListResponseDto {
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  @ApiProperty({ type: TodoCheck, isArray: true, description: 'Checks' })
  rows: TodoCheck[];
}
