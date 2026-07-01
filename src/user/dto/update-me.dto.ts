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
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiPropertyOptional({ example: 'marcos' })
  @IsOptional()
  @IsString()
  @Length(3, 255)
  username?: string;

  @ApiPropertyOptional({ example: 'marcos@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 177, description: 'Altura em cm' })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(300)
  heightCm?: number;

  @ApiPropertyOptional({ enum: THEMES })
  @IsOptional()
  @IsIn(THEMES)
  theme?: Theme;

  @ApiPropertyOptional({ enum: LANGUAGES })
  @IsOptional()
  @IsIn(LANGUAGES)
  language?: Language;
}
