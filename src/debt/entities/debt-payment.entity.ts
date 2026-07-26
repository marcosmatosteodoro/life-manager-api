import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { Debt } from './debt.entity';

/** Uma quitação (parcial ou total) de uma dívida; gera um gasto vinculado. */
@Entity('debt_payment')
export class DebtPayment {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ name: 'debt_id', type: 'int', nullable: false })
  debtId: number;

  @ManyToOne(() => Debt, (debt) => debt.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'debt_id' })
  debt?: Debt;

  @ApiProperty({ example: 500.0 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  value: number;

  @ApiProperty({ example: '2026-07-25' })
  @Column({ type: 'date', nullable: false })
  date: string;

  @ApiProperty({ example: 'Quitação parcial', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Gasto gerado por esta quitação (SET NULL se o gasto for apagado à parte).
  @ApiProperty({ example: 42, nullable: true })
  @Column({ name: 'expense_id', type: 'int', nullable: true })
  expenseId: number | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
