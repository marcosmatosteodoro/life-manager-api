import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { tr } from '../i18n/translate';
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

  create(dto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({ ...dto, creatorId: userId });
    return this.todoRepository.save(todo);
  }

  async findAll(userId: number): Promise<TodoListResponseDto> {
    const [rows, count] = await this.todoRepository.findAndCount({
      where: { creatorId: userId },
      order: { createdAt: 'DESC' },
    });
    return { count, rows };
  }

  /** Lista as tags distintas do usuário (não-nulas), em ordem alfabética. */
  async tags(userId: number): Promise<string[]> {
    const rows = await this.todoRepository.find({
      where: { creatorId: userId },
      select: { tag: true },
    });
    const set = new Set<string>();
    for (const r of rows) {
      const tag = r.tag?.trim();
      if (tag) set.add(tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }

  async findOne(id: number, userId: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!todo) {
      throw new NotFoundException(tr('todo.notFound', { id }));
    }
    return todo;
  }

  async update(id: number, dto: UpdateTodoDto, userId: number): Promise<Todo> {
    // Escopo por dono: só edita se o afazer for do usuário.
    const todo = await this.findOne(id, userId);
    Object.assign(todo, dto);
    return this.todoRepository.save(todo);
  }

  async remove(id: number, userId: number): Promise<void> {
    // Os checks somem em cascata (FK ON DELETE CASCADE).
    const result = await this.todoRepository.delete({ id, creatorId: userId });
    if (!result.affected) {
      throw new NotFoundException(tr('todo.notFound', { id }));
    }
  }
}
