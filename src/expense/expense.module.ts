import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategory } from '../expense-category/entities/expense-category.entity';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ExpenseAudio } from './entities/expense-audio.entity';
import { Expense } from './entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseAudio, ExpenseCategory]),
  ],
  providers: [ExpenseService],
  controllers: [ExpenseController],
})
export class ExpenseModule {}
