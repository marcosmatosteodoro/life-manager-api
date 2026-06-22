import { Test, TestingModule } from '@nestjs/testing';
import { ApplyController } from './apply.controller';
import { ApplyService } from './apply.service';
import { CreateApplyDto } from './dto/create-apply.dto';
import { UpdateApplyDto } from './dto/update-apply.dto';
import { Apply } from './entities/apply.entity';
import { ApplyStatus } from './enums/apply-status.enum';

const buildApply = (overrides: Partial<Apply> = {}): Apply => ({
  id: 1,
  name: 'Vaga Backend Node - Acme',
  link: 'https://acme.com/vagas/123',
  date: '2026-06-22',
  status: ApplyStatus.APPLIED,
  description: null,
  companyId: 1,
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('ApplyController', () => {
  let controller: ApplyController;
  let service: jest.Mocked<ApplyService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ApplyService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplyController],
      providers: [{ provide: ApplyService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ApplyController>(ApplyController);
    service = module.get(ApplyService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service e retorna o resultado', async () => {
    const dto: CreateApplyDto = {
      name: 'Vaga Backend Node - Acme',
      date: '2026-06-22',
      status: ApplyStatus.APPLIED,
      companyId: 1,
    };
    const created = buildApply();
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll retorna { count, rows } do service', async () => {
    const payload = { count: 1, rows: [buildApply()] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll()).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne repassa o id para o service', async () => {
    const entity = buildApply();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update repassa id e dto para o service', async () => {
    const dto: UpdateApplyDto = { status: ApplyStatus.APPROVED };
    const updated = buildApply({ status: ApplyStatus.APPROVED });
    service.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove repassa o id e resolve void', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
