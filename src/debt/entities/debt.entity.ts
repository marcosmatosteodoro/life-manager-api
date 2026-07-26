import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { DebtPayment } from './debt-payment.entity';

/**
 * Dívida a quitar. As quitações (parciais/totais) ficam em `debt_payment` e cada
 * uma gera um gasto (expense). Recurso de Finanças = compartilhado (sem escopo
 * por usuário). Saldo = totalAmount − soma das quitações.
 */
@Entity('debt')
export class Debt {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Cartão Nubank' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // Valor total da dívida.
  @ApiProperty({ example: 1500.0 })
  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  totalAmount: number;

  @ApiProperty({ example: 'Fatura acumulada', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => DebtPayment, (payment) => payment.debt)
  payments?: DebtPayment[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ example: 1, nullable: true })
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;

  // ----- Campos calculados (não persistidos), preenchidos no service -----

  @ApiProperty({ example: 500.0, description: 'Soma das quitações' })
  paidAmount?: number;

  @ApiProperty({ example: 1000.0, description: 'Saldo em aberto' })
  remaining?: number;

  @ApiProperty({ example: false, description: 'Se já foi quitada' })
  isSettled?: boolean;
}
