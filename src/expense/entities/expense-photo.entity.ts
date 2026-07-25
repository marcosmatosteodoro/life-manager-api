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

/**
 * Foto (recibo/nota) de um gasto. O binário fica no **Vercel Blob** (privado);
 * o Postgres guarda só a referência (pathname/url). Várias por gasto.
 */
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

  // Caminho do blob no store (usado para ler/apagar).
  @ApiProperty({ example: 'expenses/1/photo-abc123.jpg' })
  @Column({ type: 'varchar', length: 512, nullable: false })
  pathname: string;

  // URL do blob (privada; a leitura passa pelo back autenticado).
  @ApiProperty({ example: 'https://xxxx.public.blob.vercel-storage.com/...' })
  @Column({ type: 'varchar', length: 1024, nullable: false })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  @Column({ name: 'mime_type', type: 'varchar', length: 64, nullable: false })
  mimeType: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
