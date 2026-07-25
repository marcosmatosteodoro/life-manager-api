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
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const USER_ID = 1;

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
  creatorId: USER_ID,
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

    const result = await service.create(
      {
        name: 'Treinar',
        startDate: '2026-06-01',
        days: [1, 3, 5],
      },
      USER_ID,
    );

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ creatorId: USER_ID }),
    );
    expect(result).toEqual(todo);
  });

  it('findAll retorna { count, rows } filtrando pelo dono', async () => {
    repo.findAndCount!.mockResolvedValue([[buildTodo()], 1]);
    const result = await service.findAll(USER_ID);
    expect(result.count).toBe(1);
    expect(result.rows).toHaveLength(1);
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { creatorId: USER_ID } }),
    );
  });

  it('findOne lança NotFoundException quando não encontrado', async () => {
    repo.findOne!.mockResolvedValue(null);
    await expect(service.findOne(999, USER_ID)).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 999, creatorId: USER_ID },
    });
  });

  it('tags retorna distintas, sem nulos, ordenadas', async () => {
    repo.find!.mockResolvedValue([
      buildTodo({ tag: 'saúde' }),
      buildTodo({ tag: 'estudo' }),
      buildTodo({ tag: 'saúde' }),
      buildTodo({ tag: null }),
    ]);
    const result = await service.tags(USER_ID);
    expect(result).toEqual(['estudo', 'saúde']);
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { creatorId: USER_ID } }),
    );
  });

  it('update carrega via findOne escopado e salva', async () => {
    const todo = buildTodo();
    repo.findOne!.mockResolvedValue(todo);
    repo.save!.mockImplementation((v) => Promise.resolve(v as Todo));

    const result = await service.update(1, { name: 'Novo' }, USER_ID);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1, creatorId: USER_ID },
    });
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Novo' }),
    );
    expect(result.name).toBe('Novo');
  });

  it('update lança NotFoundException quando o id não existe', async () => {
    repo.findOne!.mockResolvedValue(null);
    await expect(service.update(999, { name: 'x' }, USER_ID)).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('remove lança NotFoundException quando nada foi afetado', async () => {
    repo.delete!.mockResolvedValue({ affected: 0, raw: [] });
    await expect(service.remove(999, USER_ID)).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.delete).toHaveBeenCalledWith({ id: 999, creatorId: USER_ID });
  });
});
