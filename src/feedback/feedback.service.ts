import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  IsNull,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { AiService } from '../ai/ai.service';
import { Apply } from '../apply/entities/apply.entity';
import { Article } from '../article/entities/article.entity';
import { ArticleStatus } from '../article/enums/article-status.enum';
import { DailyCheck } from '../daily-check/entities/daily-check.entity';
import { Diary } from '../diary/entities/diary.entity';
import { DiaryType } from '../diary/enums/diary-type.enum';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { Weight } from '../weight/entities/weight.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackListResponseDto } from './dto/feedback-list-response.dto';
import { Feedback } from './entities/feedback.entity';
import { FEEDBACK_PERIOD_DAYS } from './enums/feedback-period.enum';
import {
  buildFeedbackInput,
  FEEDBACK_PERIOD_LABELS,
  WEEKLY_FEEDBACK_SYSTEM,
} from './prompts/weekly-feedback.prompt';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Weight)
    private readonly weightRepository: Repository<Weight>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(DailyCheck)
    private readonly dailyCheckRepository: Repository<DailyCheck>,
    @InjectRepository(FlashCard)
    private readonly flashCardRepository: Repository<FlashCard>,
    @InjectRepository(Diary)
    private readonly diaryRepository: Repository<Diary>,
    @InjectRepository(Apply)
    private readonly applyRepository: Repository<Apply>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Gera um feedback do período: agrega os dados dos módulos, chama a IA e
   * persiste o que foi enviado (inputData + prompt) e o retorno (response).
   */
  async generate(dto: CreateFeedbackDto): Promise<Feedback> {
    const days = FEEDBACK_PERIOD_DAYS[dto.period];
    const periodEnd = this.today();
    const periodStart = days == null ? null : this.addDays(periodEnd, -days);

    const data = await this.collect(periodStart, periodEnd, dto.period);

    const periodLabel = FEEDBACK_PERIOD_LABELS[dto.period];
    const userPrompt = buildFeedbackInput(periodLabel, data);

    // Se a IA falhar, a exceção sobe e nada é salvo (fail secure).
    const response = await this.aiService.complete({
      system: WEEKLY_FEEDBACK_SYSTEM,
      user: userPrompt,
    });

    const feedback = this.feedbackRepository.create({
      period: dto.period,
      periodStart,
      periodEnd,
      inputData: JSON.stringify(data),
      prompt: `${WEEKLY_FEEDBACK_SYSTEM}\n\n${userPrompt}`,
      response,
      creatorId: dto.creatorId ?? null,
    });
    return this.feedbackRepository.save(feedback);
  }

  async findAll(): Promise<FeedbackListResponseDto> {
    const [rows, count] = await this.feedbackRepository.findAndCount({
      order: { createdAt: 'DESC' },
    });
    return { count, rows };
  }

  async findOne(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
    if (!feedback) {
      throw new NotFoundException(`Feedback #${id} não encontrado`);
    }
    return feedback;
  }

  /** Agrega os dados de todos os domínios no período. */
  private async collect(
    periodStart: string | null,
    periodEnd: string,
    period: CreateFeedbackDto['period'],
  ) {
    // Filtros de data (limite inferior; o superior é "hoje", logo dispensável).
    const dateGte = periodStart ? MoreThanOrEqual(periodStart) : undefined;
    const createdGte = periodStart
      ? MoreThanOrEqual(new Date(`${periodStart}T00:00:00`))
      : undefined;

    const whereDate = <T>(field: keyof T) =>
      (dateGte ? { [field]: dateGte } : {}) as FindOptionsWhere<T>;

    const [weights, articles, dailyChecks, flashCards, diaries, applies] =
      await Promise.all([
        this.weightRepository.find({
          where: whereDate<Weight>('date'),
          order: { date: 'ASC' },
        }),
        this.articleRepository.find({
          where: createdGte ? { createdAt: createdGte } : {},
        }),
        this.dailyCheckRepository.find({
          where: whereDate<DailyCheck>('date'),
        }),
        this.flashCardRepository.find({
          // Só cards revisados; com período, apenas os revisados nele.
          where: {
            lastReview: periodStart
              ? MoreThanOrEqual(periodStart)
              : Not(IsNull()),
          },
        }),
        this.diaryRepository.find({ where: whereDate<Diary>('day') }),
        this.applyRepository.find({ where: whereDate<Apply>('date') }),
      ]);

    const dailyEntries = diaries.filter((d) => d.type === DiaryType.DAILY);
    const gratitudeEntries = diaries.filter(
      (d) => d.type === DiaryType.GRATITUDE,
    );
    const scores = articles
      .filter((a) => a.score != null)
      .map((a) => a.score as number);

    return {
      periodo: { label: period, inicio: periodStart, fim: periodEnd },
      peso: {
        medicoes: weights.length,
        primeiro: weights[0]?.value ?? null,
        ultimo: weights[weights.length - 1]?.value ?? null,
        variacao:
          weights.length >= 2
            ? this.round(
                weights[weights.length - 1].value - weights[0].value,
              )
            : null,
      },
      estudoIngles: {
        artigos: articles.length,
        concluidos: articles.filter((a) => a.status === ArticleStatus.COMPLETED)
          .length,
        notas: scores,
        notaMedia: scores.length
          ? this.round(scores.reduce((s, n) => s + n, 0) / scores.length)
          : null,
      },
      consistencia: {
        diasComRegistro: dailyChecks.length,
        leitura: dailyChecks.filter((d) => d.readingSkills).length,
        escrita: dailyChecks.filter((d) => d.writingSkills).length,
        listening: dailyChecks.filter((d) => d.listeningSkills).length,
        speaking: dailyChecks.filter((d) => d.speakingSkills).length,
        candidaturas: dailyChecks.filter((d) => d.applyJobs).length,
      },
      revisoesFlashcards: {
        cardsRevisadosNoPeriodo: flashCards.length,
        acertosAcumulados: flashCards.reduce(
          (s, c) => s + c.correctAnswers,
          0,
        ),
        errosAcumulados: flashCards.reduce((s, c) => s + c.wrongAnswers, 0),
        obs: 'acertos/erros são acumulados por card (lifetime), não apenas do período',
      },
      diario: dailyEntries.map((d) => ({ dia: d.day, texto: d.description })),
      diarioGratidao: gratitudeEntries.map((d) => ({
        dia: d.day,
        texto: d.description,
      })),
      vagas: {
        total: applies.length,
        porStatus: applies.reduce<Record<string, number>>((acc, a) => {
          acc[a.status] = (acc[a.status] ?? 0) + 1;
          return acc;
        }, {}),
      },
    };
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }

  /** Data local de hoje (YYYY-MM-DD). */
  private today(): string {
    return this.fmt(new Date());
  }

  private addDays(dateStr: string, delta: number): string {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setDate(d.getDate() + delta);
    return this.fmt(d);
  }

  private fmt(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
