import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Senha atual (não é logada)' })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'senha atual',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty', {
      property: 'senha atual',
    }),
  })
  currentPassword: string;

  @ApiProperty({ description: 'Nova senha (mín. 8 caracteres)' })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'nova senha',
    }),
  })
  @MinLength(8, {
    message: i18nValidationMessage('validation.minLength', {
      property: 'nova senha',
    }),
  })
  newPassword: string;
}
