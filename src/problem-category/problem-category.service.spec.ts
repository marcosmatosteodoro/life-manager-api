import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProblemCategory } from './entities/problem-category.entity';
import { ProblemCategoryService } from './problem-category.service';

describe('ProblemCategoryService', () => {
  let service: ProblemCategoryService;
  let repo: { findAndCount: jest.Mock };

  beforeEach(async () => {
    repo = { findAndCount: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemCategoryService,
        { provide: getRepositoryToken(ProblemCategory), useValue: repo },
      ],
    }).compile();
    service = module.get(ProblemCategoryService);
  });

  afterEach(() => jest.clearAllMocks());

  it('lista { count, rows } ordenado por nome', async () => {
    const rows = [{ id: 1, name: 'Bug', color: '#ef4444' }];
    repo.findAndCount.mockResolvedValue([rows, 1]);

    const result = await service.findAll();

    expect(repo.findAndCount).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    expect(result).toEqual({ count: 1, rows });
  });
});
