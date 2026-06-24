import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { FlashCardGroupController } from './flash-card-group.controller';
import { FlashCardGroupService } from './flash-card-group.service';
import { FlashCardGroup } from './entities/flash-card-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlashCardGroup, FlashCard])],
  providers: [FlashCardGroupService],
  controllers: [FlashCardGroupController],
})
export class FlashCardGroupModule {}
