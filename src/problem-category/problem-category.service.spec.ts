import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProblemCategory } from './entities/problem-category.entity';
import { ProblemCategoryService } from './problem-category.service';

const USER_ID = 1;

describe('ProblemCategoryService', () => {
  let service: ProblemCategoryService;
  let repo: {
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve(e)),
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

    const result = await service.findAll(USER_ID);

    expect(repo.findAndCount).toHaveBeenCalledWith({
      where: { creatorId: USER_ID },
      order: { name: 'ASC' },
    });
    expect(result).toEqual({ count: 1, rows });
  });

  it('cria e persiste com o dono', async () => {
    const dto = { name: 'Bug', color: '#ef4444' };
    await expect(service.create(dto, USER_ID)).resolves.toEqual({
      ...dto,
      creatorId: USER_ID,
    });
    expect(repo.create).toHaveBeenCalledWith({ ...dto, creatorId: USER_ID });
  });

  describe('update', () => {
    it('busca escopada, aplica e salva', async () => {
      repo.findOne.mockResolvedValue({ id: 1, name: 'Bug', color: '#000000' });
      const result = await service.update(1, { name: 'Novo' }, USER_ID);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 1, creatorId: USER_ID },
      });
      expect(result).toMatchObject({ name: 'Novo' });
    });

    it('lança NotFound quando o id não existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(999, { name: 'X' }, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('remove quando existe', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(1, USER_ID)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith({
        id: 1,
        creatorId: USER_ID,
      });
    });

    it('lança NotFound quando nada foi afetado', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
