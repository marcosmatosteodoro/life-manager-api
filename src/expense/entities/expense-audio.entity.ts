import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expense } from './expense.entity';

/** Descrição em áudio de um gasto (1:1). Base64, buscada sob demanda. */
@Entity('expense_audio')
export class ExpenseAudio {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ name: 'expense_id', type: 'int', unique: true, nullable: false })
  expenseId: number;

  @OneToOne(() => Expense, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_id' })
  expense?: Expense;

  @ApiProperty({ description: 'Áudio em base64' })
  @Column({ type: 'text', nullable: false })
  data: string;

  @ApiProperty({ example: 'audio/webm' })
  @Column({ name: 'mime_type', type: 'varchar', length: 64, nullable: false })
  mimeType: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
