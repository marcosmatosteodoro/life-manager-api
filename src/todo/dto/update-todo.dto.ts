import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateTodoDto extends PartialType(CreateTodoDto) {}
