import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Apply } from '../apply/entities/apply.entity';
import { Article } from '../article/entities/article.entity';
import { FlashCardGroup } from '../flash-card-group/entities/flash-card-group.entity';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { TodoCheckService } from '../todo/todo-check.service';
import { Weight } from '../weight/entities/weight.entity';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class HomeService {
  constructor(
    private readonly todoCheckService: TodoCheckService,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Weight)
    private readonly weightRepository: Repository<Weight>,
    @InjectRepository(FlashCard)
    private readonly flashCardRepository: Repository<FlashCard>,
    @InjectRepository(FlashCardGroup)
    private readonly groupRepository: Repository<FlashCardGroup>,
    @InjectRepository(Apply)
    private readonly applyRepository: Repository<Apply>,
  ) {}

  /** Agrega, numa só resposta, tudo que a Home exibe. */
  async getDashboard(): Promise<DashboardResponseDto> {
    const today = this.dayStr(new Date());
    const weekStart = this.startOfWeek();

    const [
      todayChecks,
      articles,
      latestWeight,
      weightThisWeek,
      totalCards,
      groupCount,
      appliesCount,
      appliesToday,
    ] = await Promise.all([
      this.todoCheckService.today(), // garante/retorna os checks de hoje
      this.articleRepository.find({
        select: { createdAt: true, status: true },
        order: { createdAt: 'DESC' },
      }),
      this.weightRepository.findOne({
        where: {},
        order: { date: 'DESC', id: 'DESC' },
      }),
      this.weightRepository.count({
        where: { date: MoreThanOrEqual(weekStart) },
      }),
      this.flashCardRepository.count(),
      this.groupRepository.count(),
      this.applyRepository.count(),
      this.applyRepository.count({ where: { date: today } }),
    ]);

    const done = todayChecks.filter((c) => c.checked).length;

    const todayArticle = articles.find(
      (a) => this.dayStr(a.createdAt) === today,
    );
    const studyDays = new Set(articles.map((a) => this.dayStr(a.createdAt)));

    return {
      streak: this.studyStreak(studyDays),
      weight: {
        latest: latestWeight ? Number(latestWeight.value) : null,
        loggedThisWeek: weightThisWeek > 0,
      },
      todos: { done, total: todayChecks.length },
      study: { todayStatus: todayArticle?.status ?? null },
      flashcards: { totalCards, groupCount },
      appliesCount,
      appliesToday,
    };
  }

  /** Data local (YYYY-MM-DD) de uma Date. */
  private dayStr(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** Início da semana atual (segunda-feira) em YYYY-MM-DD local. */
  private startOfWeek(): string {
    const d = new Date();
    const daysSinceMonday = (d.getDay() + 6) % 7; // 0=Dom..6=Sáb → dias após segunda
    d.setDate(d.getDate() - daysSinceMonday);
    return this.dayStr(d);
  }

  /**
   * Dias seguidos com estudo a partir de hoje (mín. 0). Se hoje ainda não tem
   * estudo mas ontem teve, a ofensiva continua válida (conta a partir de ontem).
   */
  private studyStreak(days: Set<string>): number {
    const cursor = new Date();
    if (!days.has(this.dayStr(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!days.has(this.dayStr(cursor))) return 0;
    }
    let streak = 0;
    while (days.has(this.dayStr(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }
}
