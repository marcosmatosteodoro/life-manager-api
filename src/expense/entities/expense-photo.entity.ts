import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expense } from './expense.entity';

/** Foto (recibo/nota) de um gasto. Base64 no Postgres, várias por gasto. */
@Entity('expense_photo')
export class ExpensePhoto {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ name: 'expense_id', type: 'int', nullable: false })
  expenseId: number;

  @ManyToOne(() => Expense, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_id' })
  expense?: Expense;

  @ApiProperty({ description: 'Imagem em base64 (sem prefixo data URL)' })
  @Column({ type: 'text', nullable: false })
  data: string;

  @ApiProperty({ example: 'image/jpeg' })
  @Column({ name: 'mime_type', type: 'varchar', length: 64, nullable: false })
  mimeType: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
