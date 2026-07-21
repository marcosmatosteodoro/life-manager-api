import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemCategoryController } from './problem-category.controller';
import { ProblemCategoryService } from './problem-category.service';
import { ProblemCategory } from './entities/problem-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProblemCategory])],
  providers: [ProblemCategoryService],
  controllers: [ProblemCategoryController],
  exports: [TypeOrmModule],
})
export class ProblemCategoryModule {}
