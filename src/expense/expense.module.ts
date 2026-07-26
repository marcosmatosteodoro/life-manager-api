import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ExpenseAudio } from './entities/expense-audio.entity';
import { ExpensePhoto } from './entities/expense-photo.entity';
import { Expense } from './entities/expense.entity';

@Module({
  imports: [
    AiModule,
    TypeOrmModule.forFeature([
      Expense,
      ExpenseAudio,
      ExpensePhoto,
      ExpenseCategory,
    ]),
  ],
  providers: [ExpenseService],
  controllers: [ExpenseController],
  exports: [ExpenseService],
})
export class ExpenseModule {}
