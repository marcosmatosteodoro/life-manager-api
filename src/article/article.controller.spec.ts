import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { ArticleStatus } from './enums/article-status.enum';

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

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: jest.Mocked<ArticleService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ArticleService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      correctSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [{ provide: ArticleService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    service = module.get(ArticleService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service e retorna o resultado', async () => {
    const dto: CreateArticleDto = {
      title: 'The Pragmatic Programmer',
      readingTime: 5,
      timeRead: 7,
    };
    const created = buildArticle();
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto, USER_ID)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto, USER_ID);
  });

  it('findAll retorna { count, rows } do service', async () => {
    const payload = { count: 1, rows: [buildArticle()] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll(USER_ID)).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledWith(USER_ID);
  });

  it('findOne repassa o id para o service', async () => {
    const entity = buildArticle();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1, USER_ID)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1, USER_ID);
  });

  it('update repassa id e dto para o service', async () => {
    const dto: UpdateArticleDto = { score: 10 };
    const updated = buildArticle({ score: 10 });
    service.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto, USER_ID)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto, USER_ID);
  });

  it('remove repassa o id e resolve void', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1, USER_ID)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1, USER_ID);
  });

  it('correctSummary repassa o id para o service', async () => {
    const corrected = buildArticle({
      summaryCorrected: '<p>corrigido</p>',
      score: 9,
      status: ArticleStatus.COMPLETED,
    });
    service.correctSummary.mockResolvedValue(corrected);

    await expect(controller.correctSummary(1, USER_ID)).resolves.toEqual(
      corrected,
    );
    expect(service.correctSummary).toHaveBeenCalledWith(1, USER_ID);
  });
});
