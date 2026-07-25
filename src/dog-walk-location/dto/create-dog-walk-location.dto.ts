import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateDogWalkLocationDto {
  @ApiProperty({ example: 'Parque da Cidade' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @ApiProperty({ example: 'Av. das Nações, 1000 - Centro' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
