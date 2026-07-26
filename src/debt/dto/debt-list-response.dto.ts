import { ApiProperty } from '@nestjs/swagger';
import { Debt } from '../entities/debt.entity';

export class DebtListResponseDto {
  @ApiProperty({ example: 2 })
  count: number;

  @ApiProperty({ type: Debt, isArray: true })
  rows: Debt[];

  // Soma dos valores totais das dívidas.
  @ApiProperty({ example: 3000.0 })
  totalOwed: number;

  // Soma dos saldos em aberto (quanto ainda falta pagar no total).
  @ApiProperty({ example: 1800.0 })
  totalRemaining: number;
}
