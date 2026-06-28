import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, Matches } from 'class-validator';

/** Normaliza para maiúsculas e valida o formato ISO 4217 (3 letras). */
const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class ExchangeRateQueryDto {
  // Moeda de origem (default no service: USD).
  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @Transform(upper)
  @Matches(/^[A-Z]{3}$/, { message: 'base deve ser um código ISO de 3 letras' })
  base?: string;

  // Moeda de destino (default no service: BRL).
  @ApiPropertyOptional({ example: 'BRL', default: 'BRL' })
  @IsOptional()
  @Transform(upper)
  @Matches(/^[A-Z]{3}$/, {
    message: 'target deve ser um código ISO de 3 letras',
  })
  target?: string;
}
