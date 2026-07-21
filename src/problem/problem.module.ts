import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';
import { Problem } from './entities/problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Problem])],
  providers: [ProblemService],
  controllers: [ProblemController],
})
export class ProblemModule {}
