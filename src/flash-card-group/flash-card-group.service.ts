import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { attachTotalReviews } from '../flash-card/flash-card.util';
import { CreateFlashCardGroupDto } from './dto/create-flash-card-group.dto';
import { FlashCardGroupListResponseDto } from './dto/flash-card-group-list-response.dto';
import { QuizQuestionDto } from './dto/quiz-question.dto';
import { UpdateFlashCardGroupDto } from './dto/update-flash-card-group.dto';
import { FlashCardGroup } from './entities/flash-card-group.entity';

@Injectable()
export class FlashCardGroupService {
  constructor(
    @InjectRepository(FlashCardGroup)
    private readonly groupRepository: Repository<FlashCardGroup>,
    @InjectRepository(FlashCard)
    private readonly flashCardRepository: Repository<FlashCard>,
  ) {}

  /**
   * Flashcards do grupo ordenados para revisão:
   * - score negativo (cards "difíceis") primeiro;
   * - depois por lastReview mais antigo (nunca revisado primeiro);
   * - empate final aleatório (RANDOM): dá variedade dia a dia e evita
   *   memorizar a sequência em vez do termo. RANDOM() é sintaxe Postgres
   *   (banco padrão do app).
   */
  async review(id: number): Promise<FlashCard[]> {
    const exists = await this.groupRepository.countBy({ id });
    if (!exists) {
      throw new NotFoundException(`FlashCardGroup #${id} não encontrado`);
    }
    const cards = await this.flashCardRepository
      .createQueryBuilder('card')
      .where('card.flashCardGroupId = :id', { id })
      .orderBy('CASE WHEN card.score < 0 THEN 0 ELSE 1 END', 'ASC')
      .addOrderBy('card.lastReview', 'ASC', 'NULLS FIRST')
      .addOrderBy('RANDOM()')
      .getMany();
    return cards.map(attachTotalReviews);
  }

  /**
   * Flashcards do grupo para o modo bloco (combinação): ordem totalmente
   * aleatória (`RANDOM()`), sem priorizar score nem lastReview. Diferente do
   * `review` (spaced repetition, que sempre coloca os mesmos cards difíceis na
   * frente), aqui cada partida sorteia um subconjunto diferente do grupo — dá
   * variedade e evita repetir sempre os mesmos termos. RANDOM() é sintaxe
   * Postgres (banco padrão do app).
   */
  async reviewBlock(id: number): Promise<FlashCard[]> {
    const exists = await this.groupRepository.countBy({ id });
    if (!exists) {
      throw new NotFoundException(`FlashCardGroup #${id} não encontrado`);
    }
    const cards = await this.flashCardRepository
      .createQueryBuilder('card')
      .where('card.flashCardGroupId = :id', { id })
      .orderBy('RANDOM()')
      .getMany();
    return cards.map(attachTotalReviews);
  }

  /**
   * Modo avaliação (quiz): para cada card com `value`, monta uma pergunta com o
   * termo e 4 opções embaralhadas — a correta + até 3 distratores (values de
   * outros cards do grupo). Mesma ordem do `review` (difíceis/antigos primeiro).
   * Cards sem `value` não viram pergunta. Salvar continua pelo review unitário.
   */
  async reviewQuiz(id: number): Promise<QuizQuestionDto[]> {
    const exists = await this.groupRepository.countBy({ id });
    if (!exists) {
      throw new NotFoundException(`FlashCardGroup #${id} não encontrado`);
    }
    const cards = await this.flashCardRepository
      .createQueryBuilder('card')
      .where('card.flashCardGroupId = :id', { id })
      .orderBy('CASE WHEN card.score < 0 THEN 0 ELSE 1 END', 'ASC')
      .addOrderBy('card.lastReview', 'ASC', 'NULLS FIRST')
      .addOrderBy('RANDOM()')
      .getMany();

    const withValue = cards.filter((c) => c.value && c.value.trim());
    const pool = [...new Set(withValue.map((c) => c.value!.trim()))];

    return withValue.map((card) => {
      const correct = card.value!.trim();
      const distractors = this.pickDistractors(pool, correct, 3);
      return {
        id: card.id,
        term: card.term,
        value: correct,
        options: this.shuffle([correct, ...distractors]),
      };
    });
  }

  /** Sorteia até `n` values distintos do pool, diferentes do correto. */
  private pickDistractors(
    pool: string[],
    correct: string,
    n: number,
  ): string[] {
    const candidates = this.shuffle(pool.filter((v) => v !== correct));
    return candidates.slice(0, n);
  }

  /** Fisher-Yates (cópia). */
  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Absorve o grupo `sourceId` no grupo `targetId`: move os flashcards do grupo
   * de origem para o destino e exclui o grupo de origem.
   *
   * Termos que já existem nos dois grupos (comparação case-insensitive) são
   * mesclados: mantém-se o card mais antigo (menor createdAt) e somam-se
   * correctAnswers, wrongAnswers e score; lastReview vira o mais recente.
   *
   * Tudo numa única transação — se qualquer passo falhar, nada é alterado
   * (não fica flashcard órfão nem grupo excluído pela metade).
   */
  async absorb(targetId: number, sourceId: number): Promise<FlashCardGroup> {
    if (targetId === sourceId) {
      throw new BadRequestException(
        'Não é possível absorver um grupo nele mesmo',
      );
    }

    await this.groupRepository.manager.transaction(async (manager) => {
      const targetExists = await manager.countBy(FlashCardGroup, {
        id: targetId,
      });
      if (!targetExists) {
        throw new NotFoundException(
          `FlashCardGroup #${targetId} não encontrado`,
        );
      }
      const sourceExists = await manager.countBy(FlashCardGroup, {
        id: sourceId,
      });
      if (!sourceExists) {
        throw new NotFoundException(
          `FlashCardGroup #${sourceId} não encontrado`,
        );
      }

      // Carrega os cards dos dois grupos para mesclar termos duplicados.
      const [targetCards, sourceCards] = await Promise.all([
        manager.find(FlashCard, { where: { flashCardGroupId: targetId } }),
        manager.find(FlashCard, { where: { flashCardGroupId: sourceId } }),
      ]);

      // Indexa os cards do destino por termo normalizado (case-insensitive).
      const byTerm = new Map<string, FlashCard>();
      for (const card of targetCards) {
        byTerm.set(this.normalizeTerm(card.term), card);
      }

      const toSave: FlashCard[] = [];
      const toDelete: number[] = [];

      for (const sourceCard of sourceCards) {
        const key = this.normalizeTerm(sourceCard.term);
        const existing = byTerm.get(key);

        if (!existing) {
          // Termo inédito no destino: apenas move o card.
          sourceCard.flashCardGroupId = targetId;
          byTerm.set(key, sourceCard); // mescla também duplicatas da própria origem
          toSave.push(sourceCard);
          continue;
        }

        // Termo já existe: mantém o mais antigo e soma os contadores.
        const older =
          sourceCard.createdAt <= existing.createdAt ? sourceCard : existing;
        const newer = older === sourceCard ? existing : sourceCard;

        older.correctAnswers =
          sourceCard.correctAnswers + existing.correctAnswers;
        older.wrongAnswers = sourceCard.wrongAnswers + existing.wrongAnswers;
        older.score = sourceCard.score + existing.score;
        older.lastReview = this.latestReview(
          sourceCard.lastReview,
          existing.lastReview,
        );
        older.flashCardGroupId = targetId; // garante o mantido no destino

        byTerm.set(key, older);
        toSave.push(older);
        toDelete.push(newer.id);
      }

      // Remove os duplicados perdedores antes de salvar os mantidos.
      if (toDelete.length) {
        await manager.delete(FlashCard, toDelete);
      }
      if (toSave.length) {
        await manager.save(FlashCard, toSave);
      }
      // Exclui o grupo de origem (já sem flashcards).
      await manager.delete(FlashCardGroup, sourceId);
    });

    // Após o commit, retorna o destino já com os flashcards mesclados.
    return this.findOne(targetId);
  }

  /** Normaliza o termo para comparação (case-insensitive, sem espaços nas pontas). */
  private normalizeTerm(term: string): string {
    return term.trim().toLowerCase();
  }

  /** Data de revisão mais recente entre duas (YYYY-MM-DD lexicográfico) ou null. */
  private latestReview(a: string | null, b: string | null): string | null {
    if (!a) return b;
    if (!b) return a;
    return a >= b ? a : b;
  }

  async create(dto: CreateFlashCardGroupDto): Promise<FlashCardGroup> {
    const group = this.groupRepository.create(dto);
    const saved = await this.groupRepository.save(group);
    // Grupo novo ainda não tem flashcards.
    saved.flashCards = [];
    return this.withComputed(saved);
  }

  async findAll(): Promise<FlashCardGroupListResponseDto> {
    const [rows, count] = await this.groupRepository.findAndCount({
      relations: { flashCards: true },
      order: { name: 'ASC' },
    });
    return { count, rows: rows.map((g) => this.withComputed(g)) };
  }

  async findOne(id: number): Promise<FlashCardGroup> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: { flashCards: true },
    });
    if (!group) {
      throw new NotFoundException(`FlashCardGroup #${id} não encontrado`);
    }
    return this.withComputed(group);
  }

  async update(
    id: number,
    dto: UpdateFlashCardGroupDto,
  ): Promise<FlashCardGroup> {
    const group = await this.groupRepository.preload({ id, ...dto });
    if (!group) {
      throw new NotFoundException(`FlashCardGroup #${id} não encontrado`);
    }
    await this.groupRepository.save(group);
    // Recarrega com os flashcards para devolver os campos calculados.
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.groupRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`FlashCardGroup #${id} não encontrado`);
    }
  }

  /** Anexa flashCardsCount no grupo e totalReviews em cada flashcard. */
  private withComputed(group: FlashCardGroup): FlashCardGroup {
    const cards = group.flashCards ?? [];
    cards.forEach(attachTotalReviews);
    group.flashCardsCount = cards.length;
    return group;
  }
}
