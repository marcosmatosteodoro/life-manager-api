import { In, Repository } from 'typeorm';
import { FlashCardImage } from './entities/flash-card-image.entity';
import { FlashCard } from './entities/flash-card.entity';

/** Anexa o campo calculado totalReviews (correctAnswers + wrongAnswers). */
export function attachTotalReviews(card: FlashCard): FlashCard {
  card.totalReviews = card.correctAnswers + card.wrongAnswers;
  return card;
}

/**
 * Marca `hasImage` em cada card sem carregar o binário (uma query pelos ids).
 * Compartilhado entre o service do card e o do grupo.
 */
export async function attachHasImage(
  cards: FlashCard[],
  imageRepository: Repository<FlashCardImage>,
): Promise<void> {
  if (cards.length === 0) return;
  const images = await imageRepository.find({
    where: { flashCardId: In(cards.map((c) => c.id)) },
    select: { flashCardId: true },
  });
  const withImage = new Set(images.map((i) => i.flashCardId));
  for (const card of cards) card.hasImage = withImage.has(card.id);
}
