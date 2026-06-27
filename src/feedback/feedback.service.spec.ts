import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiService } from '../ai/ai.service';
import { Apply } from '../apply/entities/apply.entity';
import { ApplyStatus } from '../apply/enums/apply-status.enum';
import { Article } from '../article/entities/article.entity';
import { ArticleStatus } from '../article/enums/article-status.enum';
import { DailyCheck } from '../daily-check/entities/daily-check.entity';
import { Diary } from '../diary/entities/diary.entity';
import { DiaryType } from '../diary/enums/diary-type.enum';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { Weight } from '../weight/entities/weight.entity';
import { Feedback } from './entities/feedback.entity';
import { FeedbackPeriod } from './enums/feedback-period.enum';
import { FeedbackService } from './feedback.service';

const repoMock = () => ({
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('FeedbackService', () => {
  let service: FeedbackService;
  let feedbackRepo: ReturnType<typeof repoMock>;
  let weightRepo: ReturnType<typeof repoMock>;
  let articleRepo: ReturnType<typeof repoMock>;
  let dailyCheckRepo: ReturnType<typeof repoMock>;
  let flashCardRepo: ReturnType<typeof repoMock>;
  let diaryRepo: ReturnType<typeof repoMock>;
  let applyRepo: ReturnType<typeof repoMock>;
  let aiService: { complete: jest.Mock };

  beforeEach(async () => {
    feedbackRepo = repoMock();
    weightRepo = repoMock();
    articleRepo = repoMock();
    dailyCheckRepo = repoMock();
    flashCardRepo = repoMock();
    diaryRepo = repoMock();
    applyRepo = repoMock();
    aiService = { complete: jest.fn() };

    // create devolve o que recebe; save resolve com id.
    feedbackRepo.create.mockImplementation(
      (d: Partial<Feedback>) => ({ ...d }) as Feedback,
    );
    feedbackRepo.save.mockImplementation((f: Partial<Feedback>) =>
      Promise.resolve({ id: 1, ...f } as Feedback),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: getRepositoryToken(Feedback), useValue: feedbackRepo },
        { provide: getRepositoryToken(Weight), useValue: weightRepo },
        { provide: getRepositoryToken(Article), useValue: articleRepo },
        { provide: getRepositoryToken(DailyCheck), useValue: dailyCheckRepo },
        { provide: getRepositoryToken(FlashCard), useValue: flashCardRepo },
        { provide: getRepositoryToken(Diary), useValue: diaryRepo },
        { provide: getRepositoryToken(Apply), useValue: applyRepo },
        { provide: AiService, useValue: aiService },
      ],
    }).compile();

    service = module.get(FeedbackService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('agrega os dados, chama a IA e salva input + prompt + response', async () => {
      weightRepo.find.mockResolvedValue([
        { value: 82, date: '2026-06-01' },
        { value: 80.5, date: '2026-06-20' },
      ]);
      articleRepo.find.mockResolvedValue([
        { status: ArticleStatus.COMPLETED, score: 8 },
        { status: ArticleStatus.SUMMARY_IN_PROGRESS, score: null },
      ]);
      dailyCheckRepo.find.mockResolvedValue([
        {
          readingSkills: true,
          writingSkills: false,
          listeningSkills: true,
          speakingSkills: false,
          applyJobs: true,
        },
      ]);
      flashCardRepo.find.mockResolvedValue([
        { correctAnswers: 5, wrongAnswers: 2 },
      ]);
      diaryRepo.find.mockResolvedValue([
        { type: DiaryType.DAILY, day: '2026-06-20', description: 'Dia bom' },
        {
          type: DiaryType.GRATITUDE,
          day: '2026-06-20',
          description: 'Grato pela família',
        },
      ]);
      applyRepo.find.mockResolvedValue([{ status: ApplyStatus.APPLIED }]);
      aiService.complete.mockResolvedValue('<h3>Feedback</h3>');

      const result = await service.generate({
        period: FeedbackPeriod.THIRTY_DAYS,
      });

      expect(aiService.complete).toHaveBeenCalledTimes(1);
      // save devolve o objeto salvo, então result reflete o que foi persistido.
      expect(result.period).toBe(FeedbackPeriod.THIRTY_DAYS);
      expect(result.response).toBe('<h3>Feedback</h3>');
      expect(result.periodStart).not.toBeNull();
      // O JSON salvo reflete a agregação.
      const data = JSON.parse(result.inputData) as {
        peso: { variacao: number | null };
        estudoIngles: { notaMedia: number | null };
        consistencia: { leitura: number };
        vagas: { total: number };
      };
      expect(data.peso.variacao).toBe(-1.5);
      expect(data.estudoIngles.notaMedia).toBe(8);
      expect(data.consistencia.leitura).toBe(1);
      expect(data.vagas.total).toBe(1);
      expect(result.id).toBe(1);
    });

    it('período "all" não define limite inferior (periodStart null)', async () => {
      aiService.complete.mockResolvedValue('<p>ok</p>');

      const result = await service.generate({ period: FeedbackPeriod.ALL });

      expect(result.periodStart).toBeNull();
    });

    it('propaga falha da IA e não salva', async () => {
      aiService.complete.mockRejectedValue(
        new ServiceUnavailableException('indisponível'),
      );

      await expect(
        service.generate({ period: FeedbackPeriod.SEVEN_DAYS }),
      ).rejects.toThrow(ServiceUnavailableException);
      expect(feedbackRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retorna { count, rows } ordenado por createdAt desc', async () => {
      const rows = [{ id: 1 } as Feedback];
      feedbackRepo.findAndCount.mockResolvedValue([rows, 1]);

      const result = await service.findAll();

      expect(feedbackRepo.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ count: 1, rows });
    });
  });

  describe('findOne', () => {
    it('retorna o feedback quando encontrado', async () => {
      const entity = { id: 1 } as Feedback;
      feedbackRepo.findOne.mockResolvedValue(entity);

      await expect(service.findOne(1)).resolves.toEqual(entity);
      expect(feedbackRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lança NotFoundException quando não encontrado', async () => {
      feedbackRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
