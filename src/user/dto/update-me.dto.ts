import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import {
  LANGUAGES,
  THEMES,
  type Language,
  type Theme,
} from '../user.constants';

/** Campos editáveis do próprio perfil. `passwordHash` nunca entra aqui. */
export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Marcos' })
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

  @ApiPropertyOptional({ example: 'marcos' })
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

  @ApiPropertyOptional({ example: 'marcos@example.com' })
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

  @ApiPropertyOptional({ example: 177, description: 'Altura em cm' })
  @IsOptional()
  @IsInt({
    message: i18nValidationMessage('validation.isInt', { property: 'altura' }),
  })
  @Min(50, {
    message: i18nValidationMessage('validation.min', { property: 'altura' }),
  })
  @Max(300, {
    message: i18nValidationMessage('validation.max', { property: 'altura' }),
  })
  heightCm?: number;

  @ApiPropertyOptional({ enum: THEMES })
  @IsOptional()
  @IsIn(THEMES, {
    message: i18nValidationMessage('validation.isIn', { property: 'tema' }),
  })
  theme?: Theme;

  @ApiPropertyOptional({ enum: LANGUAGES })
  @IsOptional()
  @IsIn(LANGUAGES, {
    message: i18nValidationMessage('validation.isIn', { property: 'idioma' }),
  })
  language?: Language;
}
