import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { DOG_SEXES, type DogSex } from '../dog.constants';

export class CreateDogDto {
  @ApiProperty({ example: 'Puffy' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiProperty({ example: 'Poodle' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  breed: string;

  @ApiProperty({ enum: DOG_SEXES, example: 'femea' })
  @IsIn(DOG_SEXES)
  sex: DogSex;
}
