import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { attachTotalReviews } from '../flash-card/flash-card.util';
import { CreateFlashCardGroupDto } from './dto/create-flash-card-group.dto';
import { FlashCardGroupListResponseDto } from './dto/flash-card-group-list-response.dto';
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
   * - score negativo primeiro;
   * - depois por lastReview mais antigo (nunca revisado primeiro) e score mais baixo.
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
      .addOrderBy('card.score', 'ASC')
      .getMany();
    return cards.map(attachTotalReviews);
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
