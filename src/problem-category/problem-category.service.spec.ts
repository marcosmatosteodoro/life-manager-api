import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProblemCategory } from './entities/problem-category.entity';
import { ProblemCategoryService } from './problem-category.service';

describe('ProblemCategoryService', () => {
  let service: ProblemCategoryService;
  let repo: {
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    preload: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findAndCount: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve(e)),
      preload: jest.fn(),
      delete: jest.fn(),
    };
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

  it('cria e persiste', async () => {
    const dto = { name: 'Bug', color: '#ef4444' };
    await expect(service.create(dto)).resolves.toEqual(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  describe('update', () => {
    it('faz preload e salva', async () => {
      repo.preload.mockResolvedValue({ id: 1, name: 'Novo', color: '#000000' });
      const result = await service.update(1, { name: 'Novo' });
      expect(repo.preload).toHaveBeenCalledWith({ id: 1, name: 'Novo' });
      expect(result).toMatchObject({ name: 'Novo' });
    });

    it('lança NotFound quando o id não existe', async () => {
      repo.preload.mockResolvedValue(undefined);
      await expect(service.update(999, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('remove quando existe', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('lança NotFound quando nada foi afetado', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
