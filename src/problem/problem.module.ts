import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemCategory } from '../problem-category/entities/problem-category.entity';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';
import { Problem } from './entities/problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Problem, ProblemCategory])],
  providers: [ProblemService],
  controllers: [ProblemController],
})
export class ProblemModule {}
