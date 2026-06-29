import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { Apply } from '../apply/entities/apply.entity';
import { Article } from '../article/entities/article.entity';
import { TodoCheck } from '../todo/entities/todo-check.entity';
import { Diary } from '../diary/entities/diary.entity';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { Weight } from '../weight/entities/weight.entity';
import { Feedback } from './entities/feedback.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  // Registra os repositórios de leitura usados na agregação + o próprio Feedback.
  imports: [
    TypeOrmModule.forFeature([
      Feedback,
      Weight,
      Article,
      TodoCheck,
      FlashCard,
      Diary,
      Apply,
    ]),
    AiModule,
  ],
  providers: [FeedbackService],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
