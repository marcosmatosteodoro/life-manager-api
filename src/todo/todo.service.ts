import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoListResponseDto } from './dto/todo-list-response.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  create(dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create(dto);
    return this.todoRepository.save(todo);
  }

  async findAll(): Promise<TodoListResponseDto> {
    const [rows, count] = await this.todoRepository.findAndCount({
      order: { createdAt: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo #${id} não encontrado`);
    }
    return todo;
  }

  async update(id: number, dto: UpdateTodoDto): Promise<Todo> {
    // preload garante 404 quando o id não existe, sem update silencioso.
    const todo = await this.todoRepository.preload({ id, ...dto });
    if (!todo) {
      throw new NotFoundException(`Todo #${id} não encontrado`);
    }
    return this.todoRepository.save(todo);
  }

  async remove(id: number): Promise<void> {
    // Os checks somem em cascata (FK ON DELETE CASCADE).
    const result = await this.todoRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Todo #${id} não encontrado`);
    }
  }
}
