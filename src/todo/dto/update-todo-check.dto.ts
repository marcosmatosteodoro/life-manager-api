import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoCheckDto } from './create-todo-check.dto';

// Todos os campos viram opcionais, herdando as mesmas validações.
export class UpdateTodoCheckDto extends PartialType(CreateTodoCheckDto) {}
