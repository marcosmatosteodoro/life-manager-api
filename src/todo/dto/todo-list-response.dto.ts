import { ApiProperty } from '@nestjs/swagger';
import { Todo } from '../entities/todo.entity';

export class TodoListResponseDto {
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  @ApiProperty({ type: Todo, isArray: true, description: 'Afazeres' })
  rows: Todo[];
}
