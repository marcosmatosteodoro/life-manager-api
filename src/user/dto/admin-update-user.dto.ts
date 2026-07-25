import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { USER_ROLES, type UserRole } from '../user.constants';

/** Edição de um usuário pelo admin (nome/usuário/e-mail/papel/senha). */
export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'Maria' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', { property: 'nome' }),
  })
  @Length(1, 255, {
    message: i18nValidationMessage('validation.lengthRange', {
      property: 'nome',
    }),
  })
  name?: string;

  @ApiPropertyOptional({ example: 'maria' })
  @IsOptional()
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
  username?: string;

  @ApiPropertyOptional({ example: 'maria@example.com' })
  @IsOptional()
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.isEmail', {
        property: 'e-mail',
      }),
    },
  )
  email?: string;

  @ApiPropertyOptional({ enum: USER_ROLES })
  @IsOptional()
  @IsIn(USER_ROLES, {
    message: i18nValidationMessage('validation.isIn', { property: 'papel' }),
  })
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Nova senha (opcional)', minLength: 6 })
  @IsOptional()
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
  password?: string;
}
