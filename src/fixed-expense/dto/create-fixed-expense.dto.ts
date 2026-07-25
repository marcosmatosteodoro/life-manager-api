import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFixedExpenseDto {
  @ApiProperty({ example: 'Conta de luz' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 189.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  @ApiProperty({ example: 10, description: 'Dia do mês do pagamento (1-31)' })
  @IsInt()
  @Min(1)
  @Max(31)
  paymentDay: number;

  @ApiPropertyOptional({ example: false, description: 'Valor varia mês a mês' })
  @IsOptional()
  @IsBoolean()
  isVariable?: boolean;

  @ApiPropertyOptional({ example: 'Enel — vencimento dia 10' })
  @IsOptional()
  @IsString()
  description?: string;
}
