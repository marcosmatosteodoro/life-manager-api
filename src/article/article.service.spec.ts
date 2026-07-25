import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
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

const USER_ID = 1;

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
  creatorId: USER_ID,
  ...overrides,
});

describe('ArticleService', () => {
  let service: ArticleService;
  let repository: MockRepository<Article>;
  let aiService: { complete: jest.Mock };

  beforeEach(async () => {
    aiService = { complete: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useValue: createMockRepository(),
        },
        { provide: AiService, useValue: aiService },
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
      const entity = buildArticle({
        timeWrite: null,
        summary: null,
        score: null,
      });
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto, USER_ID);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        creatorId: USER_ID,
      });
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
      const r = await service.create({ ...base }, USER_ID);
      expect(r.status).toBe(ArticleStatus.READING_IN_PROGRESS);
    });

    it('SUMMARY_IN_PROGRESS quando há timeRead mas falta timeWrite ou summary', async () => {
      const r = await service.create({ ...base, timeRead: 7 }, USER_ID);
      expect(r.status).toBe(ArticleStatus.SUMMARY_IN_PROGRESS);

      const r2 = await service.create(
        { ...base, timeRead: 7, timeWrite: 12 },
        USER_ID,
      );
      expect(r2.status).toBe(ArticleStatus.SUMMARY_IN_PROGRESS);
    });

    it('APPLYING_CORRECTION quando falta apenas summaryCorrected', async () => {
      const r = await service.create(
        {
          ...base,
          timeRead: 7,
          timeWrite: 12,
          summary: 'resumo',
        },
        USER_ID,
      );
      expect(r.status).toBe(ArticleStatus.APPLYING_CORRECTION);
    });

    it('COMPLETED quando tudo preenchido (link ignorado)', async () => {
      const r = await service.create(
        {
          ...base,
          timeRead: 7,
          timeWrite: 12,
          summary: 'resumo',
          summaryCorrected: 'corrigido',
        },
        USER_ID,
      );
      expect(r.status).toBe(ArticleStatus.COMPLETED);
    });

    it('recalcula o status no update sobre o registro mesclado', async () => {
      // Registro existente (do dono) sem summaryCorrected -> ao preencher, vira COMPLETED.
      repository.findOne!.mockResolvedValue({
        timeRead: 7,
        timeWrite: 12,
        summary: 'resumo',
        summaryCorrected: null,
      });
      const r = await service.update(
        1,
        { summaryCorrected: 'corrigido' },
        USER_ID,
      );
      expect(r.status).toBe(ArticleStatus.COMPLETED);
    });
  });

  describe('findAll', () => {
    it('retorna no formato { count, rows } ordenado por createdAt desc', async () => {
      const rows = [buildArticle({ id: 1 }), buildArticle({ id: 2 })];
      repository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll(USER_ID);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { creatorId: USER_ID },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      repository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll(USER_ID);

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildArticle();
      repository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne(1, USER_ID);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, creatorId: USER_ID },
      });
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('carrega o registro do dono, recalcula o status e salva', async () => {
      const existing = buildArticle({ score: 8 });
      repository.findOne!.mockResolvedValue(existing);
      repository.save!.mockImplementation((a) => Promise.resolve(a as Article));

      const result = await service.update(1, { score: 10 }, USER_ID);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, creatorId: USER_ID },
      });
      expect(result.score).toBe(10);
    });

    it('lança NotFoundException quando o id não é do usuário', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.update(999, { score: 10 }, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove quando o registro existe', async () => {
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(1, USER_ID)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith({
        id: 1,
        creatorId: USER_ID,
      });
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      repository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('correctSummary', () => {
    const validJson = JSON.stringify({
      correctedSummary: '<p>Corrected summary.</p>',
      score: 9,
    });

    it('corrige o resumo, salva summaryCorrected + score e fica COMPLETED', async () => {
      const article = buildArticle({ summaryCorrected: null, score: null });
      repository.findOne!.mockResolvedValue(article);
      aiService.complete.mockResolvedValue(validJson);
      repository.save!.mockImplementation((a) => Promise.resolve(a as Article));

      const result = await service.correctSummary(1, USER_ID);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, creatorId: USER_ID },
      });
      expect(aiService.complete).toHaveBeenCalledTimes(1);
      expect(result.summaryCorrected).toBe('<p>Corrected summary.</p>');
      expect(result.score).toBe(9);
      expect(result.status).toBe(ArticleStatus.COMPLETED);
    });

    it('limita a nota ao intervalo 0..10 mesmo se o modelo extrapolar', async () => {
      repository.findOne!.mockResolvedValue(buildArticle());
      aiService.complete.mockResolvedValue(
        JSON.stringify({ correctedSummary: '<p>x</p>', score: 42 }),
      );
      repository.save!.mockImplementation((a) => Promise.resolve(a as Article));

      const result = await service.correctSummary(1, USER_ID);

      expect(result.score).toBe(10);
    });

    it('lança NotFound quando o artigo não existe', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.correctSummary(999, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(aiService.complete).not.toHaveBeenCalled();
    });

    it('lança BadRequest quando não há resumo (e não chama a IA)', async () => {
      repository.findOne!.mockResolvedValue(buildArticle({ summary: null }));

      await expect(service.correctSummary(1, USER_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(aiService.complete).not.toHaveBeenCalled();
    });

    it('propaga falha da IA e não salva nada', async () => {
      repository.findOne!.mockResolvedValue(buildArticle());
      aiService.complete.mockRejectedValue(
        new ServiceUnavailableException('indisponível'),
      );

      await expect(service.correctSummary(1, USER_ID)).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('erro quando a IA devolve JSON inválido (e não salva)', async () => {
      repository.findOne!.mockResolvedValue(buildArticle());
      aiService.complete.mockResolvedValue('isto não é json');

      await expect(service.correctSummary(1, USER_ID)).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
