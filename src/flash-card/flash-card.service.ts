import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PhotoResponseDto } from '../common/dto/photo-response.dto';
import { SetPhotoDto } from '../common/dto/set-photo.dto';
import {
  delProfilePhoto,
  putProfilePhoto,
  readProfilePhotoBase64,
} from '../common/photo-blob.storage';
import { FlashCardGroup } from '../flash-card-group/entities/flash-card-group.entity';
import { BlockReviewItemDto } from './dto/block-review-flash-card.dto';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { FlashCardListResponseDto } from './dto/flash-card-list-response.dto';
import { ReviewFlashCardItemDto } from './dto/review-flash-card.dto';
import { UpdateFlashCardDto } from './dto/update-flash-card.dto';
import { FlashCardImage } from './entities/flash-card-image.entity';
import { FlashCard } from './entities/flash-card.entity';
import { attachTotalReviews } from './flash-card.util';
import { TranslationService } from './translation.service';
import { tr } from '../i18n/translate';

@Injectable()
export class FlashCardService {
  constructor(
    @InjectRepository(FlashCard)
    private readonly flashCardRepository: Repository<FlashCard>,
    @InjectRepository(FlashCardGroup)
    private readonly groupRepository: Repository<FlashCardGroup>,
    @InjectRepository(FlashCardImage)
    private readonly imageRepository: Repository<FlashCardImage>,
    private readonly translationService: TranslationService,
  ) {}

  async create(dto: CreateFlashCardDto, userId: number): Promise<FlashCard> {
    await this.ensureGroupExists(dto.flashCardGroupId, userId);
    const card = this.flashCardRepository.create({ ...dto, creatorId: userId });
    return attachTotalReviews(await this.flashCardRepository.save(card));
  }

  async findAll(userId: number): Promise<FlashCardListResponseDto> {
    const [rows, count] = await this.flashCardRepository.findAndCount({
      where: { creatorId: userId },
      order: { createdAt: 'DESC' },
    });
    return { count, rows: rows.map(attachTotalReviews) };
  }

  async findOne(id: number, userId: number): Promise<FlashCard> {
    const card = await this.flashCardRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!card) {
      throw new NotFoundException(tr('flashcards.cardNotFound', { id }));
    }
    return attachTotalReviews(card);
  }

  async update(
    id: number,
    dto: UpdateFlashCardDto,
    userId: number,
  ): Promise<FlashCard> {
    // Valida a FK apenas quando flashCardGroupId é enviado.
    if (dto.flashCardGroupId !== undefined) {
      await this.ensureGroupExists(dto.flashCardGroupId, userId);
    }
    // Escopo por dono: só edita se o card for do usuário.
    const card = await this.flashCardRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!card) {
      throw new NotFoundException(tr('flashcards.cardNotFound', { id }));
    }
    Object.assign(card, dto);
    return attachTotalReviews(await this.flashCardRepository.save(card));
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.flashCardRepository.delete({
      id,
      creatorId: userId,
    });
    if (!result.affected) {
      throw new NotFoundException(tr('flashcards.cardNotFound', { id }));
    }
  }

  /** Review de um flashcard: ajusta contadores, score e lastReview. */
  async review(
    id: number,
    correct: boolean,
    userId: number,
  ): Promise<FlashCard> {
    const card = await this.flashCardRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!card) {
      throw new NotFoundException(tr('flashcards.cardNotFound', { id }));
    }
    this.applyReview(card, correct);
    return attachTotalReviews(await this.flashCardRepository.save(card));
  }

  /**
   * Traduz o termo (en→pt) e salva em `translation`. Se já houver tradução
   * salva, devolve a do banco sem chamar o tradutor de novo (cache).
   */
  async translate(id: number, userId: number): Promise<FlashCard> {
    const card = await this.flashCardRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!card) {
      throw new NotFoundException(tr('flashcards.cardNotFound', { id }));
    }
    if (card.translation) {
      return attachTotalReviews(card);
    }
    card.translation = await this.translationService.translate(card.term);
    return attachTotalReviews(await this.flashCardRepository.save(card));
  }

  /** Review em lote: aplica o mesmo cálculo para vários flashcards. */
  async reviewBatch(
    items: ReviewFlashCardItemDto[],
    userId: number,
  ): Promise<FlashCard[]> {
    const ids = items.map((i) => i.id);
    const cards = await this.flashCardRepository.find({
      where: { id: In(ids), creatorId: userId },
    });
    if (cards.length !== ids.length) {
      const found = new Set(cards.map((c) => c.id));
      const missing = ids.filter((id) => !found.has(id));
      throw new NotFoundException(
        tr('flashcards.cardsNotFound', { ids: missing.join(', ') }),
      );
    }
    const byId = new Map(cards.map((c) => [c.id, c]));
    for (const item of items) {
      this.applyReview(byId.get(item.id)!, item.correctAnswers);
    }
    const saved = await this.flashCardRepository.save(cards);
    return saved.map(attachTotalReviews);
  }

  /**
   * Review em bloco (ex.: modo combinação): um item por flashcard (ids únicos),
   * somando as contagens de acertos/erros da rodada de uma vez. Compartilha a
   * mesma regra de score do review unitário (acerto +1, erro -1).
   */
  async reviewBlock(
    items: BlockReviewItemDto[],
    userId: number,
  ): Promise<FlashCard[]> {
    const ids = items.map((i) => i.id);
    const cards = await this.flashCardRepository.find({
      where: { id: In(ids), creatorId: userId },
    });
    if (cards.length !== ids.length) {
      const found = new Set(cards.map((c) => c.id));
      const missing = ids.filter((id) => !found.has(id));
      throw new NotFoundException(
        tr('flashcards.cardsNotFound', { ids: missing.join(', ') }),
      );
    }
    const byId = new Map(cards.map((c) => [c.id, c]));
    const today = this.today();
    for (const item of items) {
      const card = byId.get(item.id)!;
      card.correctAnswers += item.correctAnswers;
      card.wrongAnswers += item.wrongAnswers;
      card.score += item.correctAnswers - item.wrongAnswers;
      card.lastReview = today;
    }
    const saved = await this.flashCardRepository.save(cards);
    return saved.map(attachTotalReviews);
  }

  // ----- Imagem do card (Vercel Blob privado; Postgres guarda a referência) -----

  /** Imagem do card em base64 (lida do Blob sob demanda). */
  async getImage(id: number, userId: number): Promise<PhotoResponseDto> {
    // Escopo por dono: só acessa a imagem se o card for do usuário.
    const card = await this.flashCardRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!card) {
      throw new NotFoundException(tr('flashcards.cardNotFound', { id }));
    }
    const image = await this.imageRepository.findOne({
      where: { flashCardId: id },
    });
    if (!image) {
      throw new NotFoundException(tr('flashcards.imageNotFound', { id }));
    }
    return {
      data: await readProfilePhotoBase64(image.pathname),
      mimeType: image.mimeType,
    };
  }

  /** Define/substitui a imagem do card (apaga o blob anterior, se houver). */
  async setImage(
    id: number,
    dto: SetPhotoDto,
    userId: number,
  ): Promise<PhotoResponseDto> {
    const card = await this.flashCardRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!card) {
      throw new NotFoundException(tr('flashcards.cardNotFound', { id }));
    }
    const existing = await this.imageRepository.findOne({
      where: { flashCardId: id },
    });
    const stored = await putProfilePhoto(
      'flashcards',
      id,
      dto.data,
      dto.mimeType,
    );
    if (existing) {
      await delProfilePhoto(existing.url);
      await this.imageRepository.update(existing.id, {
        pathname: stored.pathname,
        url: stored.url,
        mimeType: dto.mimeType,
      });
    } else {
      await this.imageRepository.save(
        this.imageRepository.create({
          flashCardId: id,
          pathname: stored.pathname,
          url: stored.url,
          mimeType: dto.mimeType,
        }),
      );
    }
    return { data: dto.data, mimeType: dto.mimeType };
  }

  async removeImage(id: number, userId: number): Promise<void> {
    // Escopo por dono: só remove a imagem se o card for do usuário.
    const card = await this.flashCardRepository.findOne({
      where: { id, creatorId: userId },
    });
    if (!card) {
      throw new NotFoundException(tr('flashcards.cardNotFound', { id }));
    }
    const image = await this.imageRepository.findOne({
      where: { flashCardId: id },
    });
    if (!image) {
      throw new NotFoundException(tr('flashcards.imageNotFound', { id }));
    }
    await delProfilePhoto(image.url);
    await this.imageRepository.delete(image.id);
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

  private async ensureGroupExists(
    groupId: number,
    userId: number,
  ): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId, creatorId: userId },
    });
    if (!group) {
      throw new NotFoundException(
        tr('flashcards.groupNotFound', { id: groupId }),
      );
    }
  }

  /** Data local de hoje (YYYY-MM-DD). */
  private today(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
}
