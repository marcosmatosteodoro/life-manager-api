import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

/**
 * Gasto fixo: despesa recorrente que se paga **todo mês** (ex.: aluguel, luz).
 * Pode ser **variável** (`isVariable`), quando o valor muda um pouco a cada mês
 * (aí `value` é o valor atual/esperado). Recurso de Finanças = compartilhado.
 */
@Entity('fixed_expense')
export class FixedExpense {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Conta de luz' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // Valor mensal (nos variáveis, o valor atual/esperado).
  @ApiProperty({ example: 189.9 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  value: number;

  // Dia do mês do pagamento (1-31).
  @ApiProperty({ example: 10, description: 'Dia do mês do pagamento (1-31)' })
  @Column({ name: 'payment_day', type: 'smallint', nullable: false })
  paymentDay: number;

  // Valor variável mês a mês (ex.: conta de luz).
  @ApiProperty({ example: false })
  @Column({ name: 'is_variable', type: 'boolean', default: false })
  isVariable: boolean;

  @ApiProperty({ example: 'Enel — vencimento dia 10', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Compartilhado (Finanças): não é escopado por usuário.
  @ApiProperty({ example: 1, nullable: true })
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;
}
