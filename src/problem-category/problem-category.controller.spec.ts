import { Test, TestingModule } from '@nestjs/testing';
import { ProblemCategoryController } from './problem-category.controller';
import { ProblemCategoryService } from './problem-category.service';

const USER_ID = 1;

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

    await expect(controller.findAll(USER_ID)).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledWith(USER_ID);
  });

  it('create delega para o service', async () => {
    const dto = { name: 'Bug', color: '#ef4444' };
    service.create.mockResolvedValue({ id: 1, ...dto } as never);
    await expect(controller.create(dto, USER_ID)).resolves.toMatchObject(dto);
    expect(service.create).toHaveBeenCalledWith(dto, USER_ID);
  });

  it('update repassa id e dto', async () => {
    service.update.mockResolvedValue({ id: 1 } as never);
    await controller.update(1, { name: 'Novo' }, USER_ID);
    expect(service.update).toHaveBeenCalledWith(1, { name: 'Novo' }, USER_ID);
  });

  it('remove repassa o id', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove(1, USER_ID)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1, USER_ID);
  });
});
