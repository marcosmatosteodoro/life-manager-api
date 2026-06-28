import { ApiProperty } from '@nestjs/swagger';

export class ExchangeRateResponseDto {
  @ApiProperty({ example: 'USD' })
  base: string;

  @ApiProperty({ example: 'BRL' })
  target: string;

  @ApiProperty({ example: 5.42, description: '1 base = rate target' })
  rate: number;

  @ApiProperty({
    example: 'Mon, 23 Jun 2026 00:02:31 +0000',
    description: 'Data da última atualização da cotação (fonte)',
  })
  date: string;
}
