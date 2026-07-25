import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../entities/user.entity';
import {
  LANGUAGES,
  THEMES,
  USER_ROLES,
  type CustomColors,
  type Language,
  type Theme,
  type UserRole,
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
  @ApiProperty({ nullable: true }) customColors: CustomColors | null;
  @ApiProperty({ enum: USER_ROLES }) role: UserRole;
  @ApiProperty() mustChangePassword: boolean;
  @ApiProperty({ example: true }) hasPhoto: boolean;

  static from(user: User, hasPhoto = false): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      heightCm: user.heightCm,
      theme: user.theme,
      language: user.language,
      customColors: user.customColors,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      hasPhoto,
    };
  }
}
