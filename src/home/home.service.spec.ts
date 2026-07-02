import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Apply } from '../apply/entities/apply.entity';
import { Article } from '../article/entities/article.entity';
import { ArticleStatus } from '../article/enums/article-status.enum';
import { FlashCardGroup } from '../flash-card-group/entities/flash-card-group.entity';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { TodoCheckService } from '../todo/todo-check.service';
import { Weight } from '../weight/entities/weight.entity';
import { HomeService } from './home.service';

const repoMock = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
});

describe('HomeService', () => {
  let service: HomeService;
  const todoCheckService = { today: jest.fn() };
  const articleRepo = repoMock();
  const weightRepo = repoMock();
  const flashCardRepo = repoMock();
  const groupRepo = repoMock();
  const applyRepo = repoMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        { provide: TodoCheckService, useValue: todoCheckService },
        { provide: getRepositoryToken(Article), useValue: articleRepo },
        { provide: getRepositoryToken(Weight), useValue: weightRepo },
        { provide: getRepositoryToken(FlashCard), useValue: flashCardRepo },
        { provide: getRepositoryToken(FlashCardGroup), useValue: groupRepo },
        { provide: getRepositoryToken(Apply), useValue: applyRepo },
      ],
    }).compile();
    service = module.get(HomeService);
  });

  afterEach(() => jest.clearAllMocks());

  it('agrega os dados da home numa resposta', async () => {
    const now = new Date();
    todoCheckService.today.mockResolvedValue([
      { id: 1, checked: true },
      { id: 2, checked: false },
      { id: 3, checked: false },
    ]);
    // Artigo criado hoje → todayStatus + entra no streak.
    articleRepo.find.mockResolvedValue([
      { createdAt: now, status: ArticleStatus.SUMMARY_IN_PROGRESS },
    ]);
    weightRepo.findOne.mockResolvedValue({ value: 82.5 });
    weightRepo.count.mockResolvedValue(1);
    flashCardRepo.count.mockResolvedValue(120);
    groupRepo.count.mockResolvedValue(8);
    // 1ª chamada = total; 2ª = candidaturas de hoje.
    applyRepo.count.mockResolvedValueOnce(12).mockResolvedValueOnce(2);

    const result = await service.getDashboard();

    expect(result).toEqual({
      streak: 1,
      weight: { latest: 82.5, loggedThisWeek: true },
      todos: { done: 1, total: 3 },
      study: { todayStatus: ArticleStatus.SUMMARY_IN_PROGRESS },
      flashcards: { totalCards: 120, groupCount: 8 },
      appliesCount: 12,
      appliesToday: 2,
    });
  });

  it('lida com estado vazio (sem peso, sem estudo, streak 0)', async () => {
    todoCheckService.today.mockResolvedValue([]);
    articleRepo.find.mockResolvedValue([]);
    weightRepo.findOne.mockResolvedValue(null);
    weightRepo.count.mockResolvedValue(0);
    flashCardRepo.count.mockResolvedValue(0);
    groupRepo.count.mockResolvedValue(0);
    applyRepo.count.mockResolvedValue(0);

    const result = await service.getDashboard();

    expect(result.streak).toBe(0);
    expect(result.weight).toEqual({ latest: null, loggedThisWeek: false });
    expect(result.todos).toEqual({ done: 0, total: 0 });
    expect(result.study.todayStatus).toBeNull();
  });
});
