import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { Diary } from './entities/diary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diary])],
  providers: [DiaryService],
  controllers: [DiaryController],
})
export class DiaryModule {}
