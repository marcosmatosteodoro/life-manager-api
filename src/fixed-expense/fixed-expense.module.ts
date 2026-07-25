import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedExpense } from './entities/fixed-expense.entity';
import { FixedExpenseController } from './fixed-expense.controller';
import { FixedExpenseService } from './fixed-expense.service';

@Module({
  imports: [TypeOrmModule.forFeature([FixedExpense])],
  providers: [FixedExpenseService],
  controllers: [FixedExpenseController],
})
export class FixedExpenseModule {}
