import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../entities/user.entity';
import {
  LANGUAGES,
  THEMES,
  type Language,
  type Theme,
} from '../user.constants';

/** Perfil devolvido ao cliente — **sem** passwordHash. */
export class UserResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() username: string;
  @ApiProperty() email: string;
  @ApiProperty() name: string;
  @ApiProperty({ nullable: true }) heightCm: number | null;
  @ApiProperty({ enum: THEMES }) theme: Theme;
  @ApiProperty({ enum: LANGUAGES }) language: Language;
  @ApiProperty() mustChangePassword: boolean;

  static from(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      heightCm: user.heightCm,
      theme: user.theme,
      language: user.language,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
