import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashCardDto } from './create-flash-card.dto';

// Herda só os campos editáveis — correctAnswers, wrongAnswers, score e
// lastReview NÃO estão aqui, então não podem ser alterados no update normal.
export class UpdateFlashCardDto extends PartialType(CreateFlashCardDto) {}
