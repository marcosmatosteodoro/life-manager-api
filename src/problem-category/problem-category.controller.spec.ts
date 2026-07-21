import { Test, TestingModule } from '@nestjs/testing';
import { ProblemCategoryController } from './problem-category.controller';
import { ProblemCategoryService } from './problem-category.service';

describe('ProblemCategoryController', () => {
  let controller: ProblemCategoryController;
  let service: jest.Mocked<ProblemCategoryService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ProblemCategoryService>> = {
      findAll: jest.fn(),
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
});
