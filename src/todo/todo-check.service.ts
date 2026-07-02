import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { tr } from '../i18n/translate';
import { CreateTodoCheckDto } from './dto/create-todo-check.dto';
import { TodoCheckListResponseDto } from './dto/todo-check-list-response.dto';
import { TodoCheckQueryDto } from './dto/todo-check-query.dto';
import { UpdateTodoCheckDto } from './dto/update-todo-check.dto';
import { TodoCheck } from './entities/todo-check.entity';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoCheckService {
  constructor(
    @InjectRepository(TodoCheck)
    private readonly todoCheckRepository: Repository<TodoCheck>,
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  /**
   * Garante e retorna os checks de hoje: para cada todo ativo (dentro da janela
   * de datas) cujo `days` inclui o dia da semana de hoje, cria o check (default
   * desmarcado) se ainda não existir. Idempotente (unique todoId+date).
   */
  async today(): Promise<TodoCheck[]> {
    const date = this.currentDate();
    const isoDay = this.isoWeekday();

    const todos = await this.todoRepository.find();
    const active = todos.filter(
      (t) =>
        t.startDate <= date &&
        (t.endDate == null || t.endDate >= date) &&
        t.days.includes(isoDay),
    );
    if (active.length === 0) return [];

    const ids = active.map((t) => t.id);
    const existing = await this.todoCheckRepository.find({
      where: { date, todoId: In(ids) },
    });
    const existingTodoIds = new Set(existing.map((c) => c.todoId));

    const toCreate = active
      .filter((t) => !existingTodoIds.has(t.id))
      .map((t) =>
        this.todoCheckRepository.create({ todoId: t.id, date, checked: false }),
      );
    if (toCreate.length > 0) {
      await this.todoCheckRepository.save(toCreate);
    }

    return this.todoCheckRepository.find({
      where: { date, todoId: In(ids) },
      relations: { todo: true },
      order: { todoId: 'ASC' },
    });
  }

  /** Histórico de checks, com filtro opcional de período (from/to). */
  async findAll(query: TodoCheckQueryDto): Promise<TodoCheckListResponseDto> {
    const where: FindOptionsWhere<TodoCheck> = {};
    if (query.todoId != null) {
      where.todoId = query.todoId;
    }
    if (query.from && query.to) {
      where.date = Between(query.from, query.to);
    } else if (query.from) {
      where.date = MoreThanOrEqual(query.from);
    } else if (query.to) {
      where.date = LessThanOrEqual(query.to);
    }
    const [rows, count] = await this.todoCheckRepository.findAndCount({
      where,
      relations: { todo: true },
      order: { date: 'DESC', todoId: 'ASC' },
    });
    return { count, rows };
  }

  async create(dto: CreateTodoCheckDto): Promise<TodoCheck> {
    await this.ensureTodoExists(dto.todoId);
    const duplicate = await this.todoCheckRepository.findOne({
      where: { todoId: dto.todoId, date: dto.date },
    });
    if (duplicate) {
      throw new ConflictException(
        tr('todo.duplicateCheck', { date: dto.date }),
      );
    }
    const check = this.todoCheckRepository.create(dto);
    return this.todoCheckRepository.save(check);
  }

  async findOne(id: number): Promise<TodoCheck> {
    const check = await this.todoCheckRepository.findOne({
      where: { id },
      relations: { todo: true },
    });
    if (!check) {
      throw new NotFoundException(tr('todo.checkNotFound', { id }));
    }
    return check;
  }

  async update(id: number, dto: UpdateTodoCheckDto): Promise<TodoCheck> {
    if (dto.todoId !== undefined) {
      await this.ensureTodoExists(dto.todoId);
    }
    const check = await this.todoCheckRepository.preload({ id, ...dto });
    if (!check) {
      throw new NotFoundException(tr('todo.checkNotFound', { id }));
    }
    return this.todoCheckRepository.save(check);
  }

  async remove(id: number): Promise<void> {
    const result = await this.todoCheckRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(tr('todo.checkNotFound', { id }));
    }
  }

  private async ensureTodoExists(todoId: number): Promise<void> {
    const todo = await this.todoRepository.findOne({ where: { id: todoId } });
    if (!todo) {
      throw new NotFoundException(tr('todo.notFound', { id: todoId }));
    }
  }

  /** Data local de hoje no formato YYYY-MM-DD. */
  private currentDate(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  /** Dia da semana ISO de hoje (1=seg … 7=dom). */
  private isoWeekday(): number {
    const day = new Date().getDay(); // 0=dom … 6=sáb
    return day === 0 ? 7 : day;
  }
}
