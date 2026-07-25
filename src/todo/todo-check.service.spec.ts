import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoCheck } from './entities/todo-check.entity';
import { Todo } from './entities/todo.entity';
import { TodoCheckService } from './todo-check.service';

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
  startDate: '2000-01-01',
  endDate: null,
  // todos os dias → o filtro de "hoje" sempre inclui, independe da data do teste.
  days: [1, 2, 3, 4, 5, 6, 7],
  tag: null,
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: USER_ID,
  ...overrides,
});

const buildCheck = (overrides: Partial<TodoCheck> = {}): TodoCheck => ({
  id: 1,
  todoId: 1,
  date: '2026-06-28',
  checked: false,
  createdAt: new Date('2026-06-28T08:30:00.000Z'),
  updatedAt: new Date('2026-06-28T08:30:00.000Z'),
  creatorId: USER_ID,
  ...overrides,
});

describe('TodoCheckService', () => {
  let service: TodoCheckService;
  let checkRepo: MockRepository<TodoCheck>;
  let todoRepo: MockRepository<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoCheckService,
        {
          provide: getRepositoryToken(TodoCheck),
          useValue: createMockRepository<TodoCheck>(),
        },
        {
          provide: getRepositoryToken(Todo),
          useValue: createMockRepository<Todo>(),
        },
      ],
    }).compile();

    service = module.get(TodoCheckService);
    checkRepo = module.get(getRepositoryToken(TodoCheck));
    todoRepo = module.get(getRepositoryToken(Todo));
  });

  afterEach(() => jest.clearAllMocks());

  describe('today', () => {
    it('cria os checks que faltam para os afazeres ativos de hoje', async () => {
      const todo = buildTodo({ id: 1 });
      todoRepo.find!.mockResolvedValue([todo]);
      // 1ª busca: nenhum check existente; 2ª busca: retorna o criado.
      const created = buildCheck({ todoId: 1 });
      checkRepo
        .find!.mockResolvedValueOnce([])
        .mockResolvedValueOnce([created]);
      checkRepo.create!.mockImplementation((v) => v as TodoCheck);
      checkRepo.save!.mockResolvedValue([created]);

      const result = await service.today(USER_ID);

      expect(todoRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { creatorId: USER_ID } }),
      );
      expect(checkRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ creatorId: USER_ID }),
      );
      expect(checkRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual([created]);
    });

    it('não cria nada quando o check de hoje já existe', async () => {
      const todo = buildTodo({ id: 1 });
      todoRepo.find!.mockResolvedValue([todo]);
      const existing = buildCheck({ todoId: 1 });
      checkRepo
        .find!.mockResolvedValueOnce([existing])
        .mockResolvedValueOnce([existing]);

      await service.today(USER_ID);

      expect(checkRepo.save).not.toHaveBeenCalled();
    });

    it('retorna vazio quando não há afazer ativo hoje', async () => {
      // Janela no passado → inativo independentemente do dia da semana.
      const todo = buildTodo({
        startDate: '2000-01-01',
        endDate: '2000-01-02',
      });
      todoRepo.find!.mockResolvedValue([todo]);

      const result = await service.today(USER_ID);

      expect(result).toEqual([]);
      expect(checkRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('lança NotFound quando o todo não existe', async () => {
      todoRepo.findOne!.mockResolvedValue(null);
      await expect(
        service.create({ todoId: 999, date: '2026-06-28' }, USER_ID),
      ).rejects.toThrow(NotFoundException);
      expect(todoRepo.findOne).toHaveBeenCalledWith({
        where: { id: 999, creatorId: USER_ID },
      });
    });

    it('lança Conflict quando já há check para (todo, data)', async () => {
      todoRepo.findOne!.mockResolvedValue(buildTodo());
      checkRepo.findOne!.mockResolvedValue(buildCheck());
      await expect(
        service.create({ todoId: 1, date: '2026-06-28' }, USER_ID),
      ).rejects.toThrow(ConflictException);
    });

    it('cria quando válido e sem duplicata', async () => {
      todoRepo.findOne!.mockResolvedValue(buildTodo());
      checkRepo.findOne!.mockResolvedValue(null);
      const created = buildCheck();
      checkRepo.create!.mockReturnValue(created);
      checkRepo.save!.mockResolvedValue(created);

      const result = await service.create(
        { todoId: 1, date: '2026-06-28' },
        USER_ID,
      );
      expect(checkRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ creatorId: USER_ID }),
      );
      expect(result).toEqual(created);
    });
  });

  describe('findAll / findOne / update / remove', () => {
    it('findAll retorna { count, rows } filtrando pelo dono', async () => {
      checkRepo.findAndCount!.mockResolvedValue([[buildCheck()], 1]);
      const result = await service.findAll({}, USER_ID);
      expect(result.count).toBe(1);
      expect(checkRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ creatorId: USER_ID }),
        }),
      );
    });

    it('findOne lança NotFound quando ausente', async () => {
      checkRepo.findOne!.mockResolvedValue(null);
      await expect(service.findOne(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(checkRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 999, creatorId: USER_ID },
        }),
      );
    });

    it('update carrega via findOne escopado e salva', async () => {
      const check = buildCheck();
      checkRepo.findOne!.mockResolvedValue(check);
      checkRepo.save!.mockImplementation((v) =>
        Promise.resolve(v as TodoCheck),
      );

      const result = await service.update(1, { checked: true }, USER_ID);

      expect(checkRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, creatorId: USER_ID },
        }),
      );
      expect(checkRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ checked: true }),
      );
      expect(result.checked).toBe(true);
    });

    it('update lança NotFound quando o id não existe', async () => {
      checkRepo.findOne!.mockResolvedValue(null);
      await expect(
        service.update(999, { checked: true }, USER_ID),
      ).rejects.toThrow(NotFoundException);
      expect(checkRepo.save).not.toHaveBeenCalled();
    });

    it('remove lança NotFound quando nada foi afetado', async () => {
      checkRepo.delete!.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(checkRepo.delete).toHaveBeenCalledWith({
        id: 999,
        creatorId: USER_ID,
      });
    });
  });
});
