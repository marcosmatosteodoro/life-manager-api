import { Test, TestingModule } from '@nestjs/testing';
import { TodoCheck } from './entities/todo-check.entity';
import { TodoCheckController } from './todo-check.controller';
import { TodoCheckService } from './todo-check.service';

const USER_ID = 1;

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

describe('TodoCheckController', () => {
  let controller: TodoCheckController;
  let service: jest.Mocked<TodoCheckService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<TodoCheckService>> = {
      today: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoCheckController],
      providers: [{ provide: TodoCheckService, useValue: serviceMock }],
    }).compile();

    controller = module.get(TodoCheckController);
    service = module.get(TodoCheckService);
  });

  afterEach(() => jest.clearAllMocks());

  it('today delega para o service com o usuário', async () => {
    const checks = [buildCheck()];
    service.today.mockResolvedValue(checks);
    await expect(controller.today(USER_ID)).resolves.toEqual(checks);
    expect(service.today).toHaveBeenCalledWith(USER_ID);
  });

  it('update repassa id, dto e usuário', async () => {
    const check = buildCheck({ checked: true });
    service.update.mockResolvedValue(check);
    await expect(
      controller.update(1, { checked: true }, USER_ID),
    ).resolves.toEqual(check);
    expect(service.update).toHaveBeenCalledWith(1, { checked: true }, USER_ID);
  });

  it('findAll repassa o query e o usuário', async () => {
    const payload = { count: 1, rows: [buildCheck()] };
    service.findAll.mockResolvedValue(payload);
    await expect(
      controller.findAll({ from: '2026-06-01' }, USER_ID),
    ).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledWith(
      { from: '2026-06-01' },
      USER_ID,
    );
  });
});
