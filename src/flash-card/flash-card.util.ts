import { FlashCard } from './entities/flash-card.entity';

/** Anexa o campo calculado totalReviews (correctAnswers + wrongAnswers). */
export function attachTotalReviews(card: FlashCard): FlashCard {
  card.totalReviews = card.correctAnswers + card.wrongAnswers;
  return card;
}
