import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCountryDto {
  // name varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'Brasil' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // code varchar, obrigatório e não-vazio.
  @ApiProperty({ example: 'BR' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
