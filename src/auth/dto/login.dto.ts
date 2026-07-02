import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @ApiProperty({ example: 'usuario' })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'username',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty', {
      property: 'username',
    }),
  })
  username: string;

  @ApiProperty({ example: 'senha', description: 'Senha (não é logada)' })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'senha',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty', {
      property: 'senha',
    }),
  })
  password: string;
}
