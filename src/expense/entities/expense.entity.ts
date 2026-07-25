import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { ExpenseCategory } from '../../expense-category/entities/expense-category.entity';
import {
  DEFAULT_EXPENSE_TYPE,
  EXPENSE_TYPES,
  type ExpenseType,
} from '../expense.constants';

/** Um gasto do usuário. */
@Entity('expense')
export class Expense {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Mercado do mês' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ApiProperty({ example: 149.9 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  value: number;

  @ApiProperty({ enum: EXPENSE_TYPES, example: DEFAULT_EXPENSE_TYPE })
  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
    default: DEFAULT_EXPENSE_TYPE,
  })
  type: ExpenseType;

  // Parcelas — só faz sentido no crédito; NULL nos demais.
  @ApiProperty({ example: 3, nullable: true })
  @Column({ type: 'int', nullable: true })
  installments: number | null;

  @ApiProperty({ example: '2026-07-25' })
  @Column({ type: 'date', nullable: false })
  date: string;

  // categoryId — FK opcional; ON DELETE SET NULL preserva o gasto.
  @ApiProperty({ example: 1, nullable: true, description: 'Id da categoria (FK)' })
  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number | null;

  @ApiProperty({ type: () => ExpenseCategory, required: false, nullable: true })
  @ManyToOne(() => ExpenseCategory, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: ExpenseCategory | null;

  @ApiProperty({ example: 'Compras da semana', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ example: 1, nullable: true })
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;

  // hasAudio — preenchido na listagem (não persistido); indica descrição em voz.
  @ApiProperty({ example: false, description: 'Se o gasto tem descrição em áudio' })
  hasAudio?: boolean;

  // photoCount — preenchido na listagem (não persistido); qtd. de fotos.
  @ApiProperty({ example: 0, description: 'Quantidade de fotos do gasto' })
  photoCount?: number;
}
