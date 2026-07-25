import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BacklogController } from './backlog.controller';
import { BacklogService } from './backlog.service';
import { BacklogItemAudio } from './entities/backlog-item-audio.entity';
import { BacklogItem } from './entities/backlog-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BacklogItem, BacklogItemAudio])],
  providers: [BacklogService],
  controllers: [BacklogController],
})
export class BacklogModule {}
