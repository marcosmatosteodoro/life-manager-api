import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './entities/article.entity';
import { ArticleStatus } from './enums/article-status.enum';

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
  title: 'The Pragmatic Programmer',
  link: null,
  readingTime: 5,
  timeRead: 7,
  timeWrite: 12,
  summary: 'Resumo do artigo',
  summaryCorrected: null,
  score: 8,
  status: ArticleStatus.APPLYING_CORRECTION,
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
      const dto: CreateArticleDto = {
        title: 'The Pragmatic Programmer',
        readingTime: 5,
        timeRead: 7,
      };
      const entity = buildArticle({ timeWrite: null, summary: null, score: null });
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('status (calculado pelo back)', () => {
    // create monta a entidade a partir do dto e salva o que recebeu.
    beforeEach(() => {
      repository.create!.mockImplementation((dto) => ({ ...dto }) as Article);
      repository.save!.mockImplementation((a) => Promise.resolve(a as Article));
    });

    const base = { title: 'X', readingTime: 5 };

    it('READING_IN_PROGRESS quando não há timeRead (default)', async () => {
      const r = await service.create({ ...base });
      expect(r.status).toBe(ArticleStatus.READING_IN_PROGRESS);
    });

    it('SUMMARY_IN_PROGRESS quando há timeRead mas falta timeWrite ou summary', async () => {
      const r = await service.create({ ...base, timeRead: 7 });
      expect(r.status).toBe(ArticleStatus.SUMMARY_IN_PROGRESS);

      const r2 = await service.create({ ...base, timeRead: 7, timeWrite: 12 });
      expect(r2.status).toBe(ArticleStatus.SUMMARY_IN_PROGRESS);
    });

    it('APPLYING_CORRECTION quando falta apenas summaryCorrected', async () => {
      const r = await service.create({
        ...base,
        timeRead: 7,
        timeWrite: 12,
        summary: 'resumo',
      });
      expect(r.status).toBe(ArticleStatus.APPLYING_CORRECTION);
    });

    it('COMPLETED quando tudo preenchido (link ignorado)', async () => {
      const r = await service.create({
        ...base,
        timeRead: 7,
        timeWrite: 12,
        summary: 'resumo',
        summaryCorrected: 'corrigido',
      });
      expect(r.status).toBe(ArticleStatus.COMPLETED);
    });

    it('recalcula o status no update sobre o registro mesclado', async () => {
      // Registro existente sem summaryCorrected -> ao preencher, vira COMPLETED.
      repository.preload!.mockImplementation((data) =>
        Promise.resolve({
          timeRead: 7,
          timeWrite: 12,
          summary: 'resumo',
          ...data,
        } as Article),
      );
      const r = await service.update(1, { summaryCorrected: 'corrigido' });
      expect(r.status).toBe(ArticleStatus.COMPLETED);
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
