import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../entities/company.entity';

export class CompanyListResponseDto {
  // count: quantidade de registros retornados
  @ApiProperty({ example: 2, description: 'Quantidade de registros' })
  count: number;

  // rows: os dados em si
  @ApiProperty({ type: Company, isArray: true, description: 'Empresas' })
  rows: Company[];
}
