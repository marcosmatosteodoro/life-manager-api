import { Test, TestingModule } from '@nestjs/testing';
import { ProblemCategoryController } from './problem-category.controller';
import { ProblemCategoryService } from './problem-category.service';

describe('ProblemCategoryController', () => {
  let controller: ProblemCategoryController;
  let service: jest.Mocked<ProblemCategoryService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ProblemCategoryService>> = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemCategoryController],
      providers: [{ provide: ProblemCategoryService, useValue: serviceMock }],
    }).compile();
    controller = module.get(ProblemCategoryController);
    service = module.get(ProblemCategoryService);
  });

  it('findAll retorna { count, rows } do service', async () => {
    const payload = { count: 1, rows: [{ id: 1, name: 'Bug' } as never] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll()).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('create delega para o service', async () => {
    const dto = { name: 'Bug', color: '#ef4444' };
    service.create.mockResolvedValue({ id: 1, ...dto } as never);
    await expect(controller.create(dto)).resolves.toMatchObject(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update repassa id e dto', async () => {
    service.update.mockResolvedValue({ id: 1 } as never);
    await controller.update(1, { name: 'Novo' });
    expect(service.update).toHaveBeenCalledWith(1, { name: 'Novo' });
  });

  it('remove repassa o id', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
