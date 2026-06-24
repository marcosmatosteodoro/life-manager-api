import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FlashCardGroup } from '../flash-card-group/entities/flash-card-group.entity';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { FlashCardListResponseDto } from './dto/flash-card-list-response.dto';
import { ReviewFlashCardItemDto } from './dto/review-flash-card.dto';
import { UpdateFlashCardDto } from './dto/update-flash-card.dto';
import { FlashCard } from './entities/flash-card.entity';
import { attachTotalReviews } from './flash-card.util';

@Injectable()
export class FlashCardService {
  constructor(
    @InjectRepository(FlashCard)
    private readonly flashCardRepository: Repository<FlashCard>,
    @InjectRepository(FlashCardGroup)
    private readonly groupRepository: Repository<FlashCardGroup>,
  ) {}

  async create(dto: CreateFlashCardDto): Promise<FlashCard> {
    await this.ensureGroupExists(dto.flashCardGroupId);
    const card = this.flashCardRepository.create(dto);
    return attachTotalReviews(await this.flashCardRepository.save(card));
  }

  async findAll(): Promise<FlashCardListResponseDto> {
    const [rows, count] = await this.flashCardRepository.findAndCount({
      order: { createdAt: 'DESC' },
    });
    return { count, rows: rows.map(attachTotalReviews) };
  }

  async findOne(id: number): Promise<FlashCard> {
    const card = await this.flashCardRepository.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException(`FlashCard #${id} não encontrado`);
    }
    return attachTotalReviews(card);
  }

  async update(id: number, dto: UpdateFlashCardDto): Promise<FlashCard> {
    // Valida a FK apenas quando flashCardGroupId é enviado.
    if (dto.flashCardGroupId !== undefined) {
      await this.ensureGroupExists(dto.flashCardGroupId);
    }
    const card = await this.flashCardRepository.preload({ id, ...dto });
    if (!card) {
      throw new NotFoundException(`FlashCard #${id} não encontrado`);
    }
    return attachTotalReviews(await this.flashCardRepository.save(card));
  }

  async remove(id: number): Promise<void> {
    const result = await this.flashCardRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`FlashCard #${id} não encontrado`);
    }
  }

  /** Review de um flashcard: ajusta contadores, score e lastReview. */
  async review(id: number, correct: boolean): Promise<FlashCard> {
    const card = await this.flashCardRepository.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException(`FlashCard #${id} não encontrado`);
    }
    this.applyReview(card, correct);
    return attachTotalReviews(await this.flashCardRepository.save(card));
  }

  /** Review em lote: aplica o mesmo cálculo para vários flashcards. */
  async reviewBatch(items: ReviewFlashCardItemDto[]): Promise<FlashCard[]> {
    const ids = items.map((i) => i.id);
    const cards = await this.flashCardRepository.find({
      where: { id: In(ids) },
    });
    if (cards.length !== ids.length) {
      const found = new Set(cards.map((c) => c.id));
      const missing = ids.filter((id) => !found.has(id));
      throw new NotFoundException(
        `FlashCard(s) não encontrado(s): ${missing.join(', ')}`,
      );
    }
    const byId = new Map(cards.map((c) => [c.id, c]));
    for (const item of items) {
      this.applyReview(byId.get(item.id)!, item.correctAnswers);
    }
    const saved = await this.flashCardRepository.save(cards);
    return saved.map(attachTotalReviews);
  }

  /** Aplica a regra de review no card (mutação em memória). */
  private applyReview(card: FlashCard, correct: boolean): void {
    if (correct) {
      card.correctAnswers += 1;
      card.score += 1;
    } else {
      card.wrongAnswers += 1;
      card.score -= 1;
    }
    card.lastReview = this.today();
  }

  private async ensureGroupExists(groupId: number): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`FlashCardGroup #${groupId} não encontrado`);
    }
  }

  /** Data local de hoje (YYYY-MM-DD). */
  private today(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
}
