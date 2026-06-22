import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyCheckService } from './daily-check.service';
import { DailyCheckController } from './daily-check.controller';
import { DailyCheck } from './entities/daily-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyCheck])],
  providers: [DailyCheckService],
  controllers: [DailyCheckController],
})
export class DailyCheckModule {}
