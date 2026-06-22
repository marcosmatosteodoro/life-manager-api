import { ApiProperty } from '@nestjs/swagger';
import { Country } from '../entities/country.entity';

export class CountryListResponseDto {
  // count: quantidade de registros retornados
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  // rows: os dados em si
  @ApiProperty({ type: Country, isArray: true, description: 'Países' })
  rows: Country[];
}
