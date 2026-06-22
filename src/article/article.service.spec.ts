import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './entities/article.entity';

// Mock tipado do Repository — nenhuma chamada real ao banco.
type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = (): MockRepository<Article> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const buildArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 1,
  readingTime: 5,
  timeRead: 7,
  timeWrite: 12,
  summary: 'Resumo do artigo',
  summaryCorrected: null,
  score: 8,
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('ArticleService', () => {
  let service: ArticleService;
  let repository: MockRepository<Article>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    repository = module.get<MockRepository<Article>>(
      getRepositoryToken(Article),
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria a entidade e persiste, retornando o registro salvo', async () => {
      const dto: CreateArticleDto = { readingTime: 5, timeRead: 7 };
      const entity = buildArticle({ timeWrite: null, summary: null, score: null });
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('retorna no formato { count, rows } ordenado por createdAt desc', async () => {
      const rows = [buildArticle({ id: 1 }), buildArticle({ id: 2 })];
      repository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      repository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildArticle();
      repository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('faz preload e salva o registro atualizado', async () => {
      const updated = buildArticle({ score: 10 });
      repository.preload!.mockResolvedValue(updated);
      repository.save!.mockResolvedValue(updated);

      const result = await service.update(1, { score: 10 });

      expect(repository.preload).toHaveBeenCalledWith({ id: 1, score: 10 });
      expect(repository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('lança NotFoundException quando o id não existe (preload null)', async () => {
      repository.preload!.mockResolvedValue(undefined);

      await expect(service.update(999, { score: 10 })).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove quando o registro existe', async () => {
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      repository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
