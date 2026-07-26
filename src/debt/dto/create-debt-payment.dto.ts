import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateDebtPaymentDto {
  // Valor da quitação. Obrigatório, exceto quando `settleAll` = true (aí usa o
  // saldo restante).
  @ApiPropertyOptional({ example: 500.0 })
  @ValidateIf((o: CreateDebtPaymentDto) => !o.settleAll)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value?: number;

  @ApiProperty({ example: '2026-07-25' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve ser YYYY-MM-DD' })
  date: string;

  @ApiPropertyOptional({ example: 'Quitação parcial' })
  @IsOptional()
  @IsString()
  description?: string;

  // Quita o saldo restante inteiro (quitação total); ignora `value`.
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  settleAll?: boolean;
}
