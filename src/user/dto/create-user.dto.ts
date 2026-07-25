import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { USER_ROLES, type UserRole } from '../user.constants';

/** Criação de usuário pelo admin (Configurações → Usuários). */
export class CreateUserDto {
  @ApiProperty({ example: 'maria' })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'nome de usuário',
    }),
  })
  @Length(3, 255, {
    message: i18nValidationMessage('validation.lengthRange', {
      property: 'nome de usuário',
    }),
  })
  username: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.isEmail', {
        property: 'e-mail',
      }),
    },
  )
  email: string;

  @ApiProperty({ example: 'Maria' })
  @IsString({
    message: i18nValidationMessage('validation.isString', { property: 'nome' }),
  })
  @Length(1, 255, {
    message: i18nValidationMessage('validation.lengthRange', {
      property: 'nome',
    }),
  })
  name: string;

  @ApiProperty({ example: 'senha-forte', minLength: 6 })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      property: 'senha',
    }),
  })
  @Length(6, 255, {
    message: i18nValidationMessage('validation.lengthRange', {
      property: 'senha',
    }),
  })
  password: string;

  @ApiPropertyOptional({ enum: USER_ROLES, description: 'Padrão: member' })
  @IsOptional()
  @IsIn(USER_ROLES, {
    message: i18nValidationMessage('validation.isIn', { property: 'papel' }),
  })
  role?: UserRole;
}
