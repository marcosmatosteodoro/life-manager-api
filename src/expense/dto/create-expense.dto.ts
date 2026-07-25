import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  DEFAULT_EXPENSE_TYPE,
  EXPENSE_TYPES,
  type ExpenseType,
} from '../expense.constants';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Mercado do mês' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @ApiProperty({ example: 149.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  @ApiProperty({ enum: EXPENSE_TYPES, default: DEFAULT_EXPENSE_TYPE })
  @IsIn(EXPENSE_TYPES)
  type: ExpenseType;

  // Parcelas: só validado (e aceito) quando o tipo é crédito.
  @ApiPropertyOptional({ example: 3, description: 'Nº de parcelas (só crédito)' })
  @ValidateIf((o: CreateExpenseDto) => o.type === 'credito')
  @IsOptional()
  @IsInt()
  @Min(1)
  installments?: number;

  @ApiProperty({ example: '2026-07-25' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve ser YYYY-MM-DD' })
  date: string;

  // Categoria: informe o id de uma existente OU o nome (cria se não existir).
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  categoryId?: number;

  // Nome da categoria (texto do combobox). Vazio = sem categoria.
  @ApiPropertyOptional({ example: 'Mercado' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  categoryName?: string;

  @ApiPropertyOptional({ example: 'Compras da semana' })
  @IsOptional()
  @IsString()
  description?: string;
}
