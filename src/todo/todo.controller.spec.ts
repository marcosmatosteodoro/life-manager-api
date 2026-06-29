import { Test, TestingModule } from '@nestjs/testing';
import { Todo } from './entities/todo.entity';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

const buildTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 1,
  name: 'Treinar',
  description: null,
  startDate: '2026-06-01',
  endDate: null,
  days: [1, 3, 5],
  tag: null,
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('TodoController', () => {
  let controller: TodoController;
  let service: jest.Mocked<TodoService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<TodoService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: serviceMock }],
    }).compile();

    controller = module.get(TodoController);
    service = module.get(TodoService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create delega para o service', async () => {
    const todo = buildTodo();
    service.create.mockResolvedValue(todo);
    const dto = { name: 'Treinar', startDate: '2026-06-01', days: [1, 3, 5] };
    await expect(controller.create(dto)).resolves.toEqual(todo);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findOne repassa o id', async () => {
    const todo = buildTodo();
    service.findOne.mockResolvedValue(todo);
    await expect(controller.findOne(1)).resolves.toEqual(todo);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('remove repassa o id', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
