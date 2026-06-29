import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { TodoService } from './todo.service';

type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <T extends object>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

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

describe('TodoService', () => {
  let service: TodoService;
  let repo: MockRepository<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: createMockRepository<Todo>(),
        },
      ],
    }).compile();

    service = module.get(TodoService);
    repo = module.get(getRepositoryToken(Todo));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('create cria e salva', async () => {
    const todo = buildTodo();
    repo.create!.mockReturnValue(todo);
    repo.save!.mockResolvedValue(todo);

    const result = await service.create({
      name: 'Treinar',
      startDate: '2026-06-01',
      days: [1, 3, 5],
    });

    expect(repo.create).toHaveBeenCalled();
    expect(result).toEqual(todo);
  });

  it('findAll retorna { count, rows }', async () => {
    repo.findAndCount!.mockResolvedValue([[buildTodo()], 1]);
    const result = await service.findAll();
    expect(result.count).toBe(1);
    expect(result.rows).toHaveLength(1);
  });

  it('findOne lança NotFoundException quando não encontrado', async () => {
    repo.findOne!.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('update lança NotFoundException quando o id não existe', async () => {
    repo.preload!.mockResolvedValue(undefined);
    await expect(service.update(999, { name: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove lança NotFoundException quando nada foi afetado', async () => {
    repo.delete!.mockResolvedValue({ affected: 0, raw: [] });
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
