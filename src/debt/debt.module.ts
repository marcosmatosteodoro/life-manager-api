import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseModule } from '../expense/expense.module';
import { DebtController } from './debt.controller';
import { DebtService } from './debt.service';
import { DebtPayment } from './entities/debt-payment.entity';
import { Debt } from './entities/debt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Debt, DebtPayment]), ExpenseModule],
  providers: [DebtService],
  controllers: [DebtController],
})
export class DebtModule {}
