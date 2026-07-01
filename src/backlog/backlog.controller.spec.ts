import { Test, TestingModule } from '@nestjs/testing';
import { BacklogController } from './backlog.controller';
import { BacklogService } from './backlog.service';

describe('BacklogController', () => {
  let controller: BacklogController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    reorder: jest.fn(),
    complete: jest.fn(),
    reopen: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacklogController],
      providers: [{ provide: BacklogService, useValue: service }],
    }).compile();
    controller = module.get(BacklogController);
  });

  afterEach(() => jest.clearAllMocks());

  it('create delega para o service', async () => {
    service.create.mockResolvedValue({ id: 1 });
    await expect(controller.create({ name: 'x' })).resolves.toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalledWith({ name: 'x' });
  });

  it('findAll passa status válido', async () => {
    service.findAll.mockResolvedValue({ count: 0, rows: [] });
    await controller.findAll('concluido');
    expect(service.findAll).toHaveBeenCalledWith('concluido');
  });

  it('findAll trata status inválido como sem filtro', async () => {
    service.findAll.mockResolvedValue({ count: 0, rows: [] });
    await controller.findAll('xpto' as never);
    expect(service.findAll).toHaveBeenCalledWith(undefined);
  });

  it('reorder repassa os ids', async () => {
    service.reorder.mockResolvedValue({ count: 2, rows: [] });
    await controller.reorder({ orderedIds: [2, 1] });
    expect(service.reorder).toHaveBeenCalledWith([2, 1]);
  });

  it('complete/reopen/update/remove repassam o id', async () => {
    await controller.complete(5);
    expect(service.complete).toHaveBeenCalledWith(5);
    await controller.reopen(5);
    expect(service.reopen).toHaveBeenCalledWith(5);
    await controller.update(5, { name: 'y' });
    expect(service.update).toHaveBeenCalledWith(5, { name: 'y' });
    await controller.remove(5);
    expect(service.remove).toHaveBeenCalledWith(5);
  });
});
