import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashCardGroup } from '../flash-card-group/entities/flash-card-group.entity';
import { FlashCardController } from './flash-card.controller';
import { FlashCardService } from './flash-card.service';
import { FlashCard } from './entities/flash-card.entity';
import { TranslationService } from './translation.service';

@Module({
  imports: [TypeOrmModule.forFeature([FlashCard, FlashCardGroup])],
  providers: [FlashCardService, TranslationService],
  controllers: [FlashCardController],
})
export class FlashCardModule {}
