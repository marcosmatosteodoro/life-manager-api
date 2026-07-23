import { Test, TestingModule } from '@nestjs/testing';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { Problem } from './entities/problem.entity';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';

const buildProblem = (overrides: Partial<Problem> = {}): Problem => ({
  id: 1,
  title: 'Marcar consulta no dentista',
  position: 1,
  description: null,
  status: 'pendente',
  priority: 'media',
  categoryId: null,
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('ProblemController', () => {
  let controller: ProblemController;
  let service: jest.Mocked<ProblemService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ProblemService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      reorder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemController],
      providers: [{ provide: ProblemService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ProblemController>(ProblemController);
    service = module.get(ProblemService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service e retorna o resultado', async () => {
    const dto: CreateProblemDto = { title: 'Login lento' };
    const created = buildProblem();
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll repassa um status válido para o service', async () => {
    const payload = { count: 1, rows: [buildProblem()] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll('em_progresso')).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledWith('em_progresso');
  });

  it('findAll trata status inválido como sem filtro (undefined)', async () => {
    service.findAll.mockResolvedValue({ count: 0, rows: [] });

    await controller.findAll('lixo' as never);

    expect(service.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findOne repassa o id para o service', async () => {
    const entity = buildProblem();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update repassa id e dto para o service', async () => {
    const dto: UpdateProblemDto = { status: 'concluido' };
    const updated = buildProblem({ status: 'concluido' });
    service.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove repassa o id e resolve void', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('reorder repassa orderedIds para o service', async () => {
    const payload = { count: 2, rows: [buildProblem()] };
    service.reorder.mockResolvedValue(payload);

    await expect(controller.reorder({ orderedIds: [2, 1] })).resolves.toEqual(
      payload,
    );
    expect(service.reorder).toHaveBeenCalledWith([2, 1]);
  });
});
