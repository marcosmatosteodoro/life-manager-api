import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  LANGUAGES,
  THEMES,
  type Language,
  type Theme,
} from '../user.constants';

/**
 * Usuário da aplicação. Substitui o auth single-user por env — fundação para
 * multiusuário. `passwordHash` guarda `"<saltHex>:<derivedHex>"` (scrypt), nunca
 * a senha em texto puro. Dados já existentes (com `creatorId`) não são tocados.
 */
@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'admin' })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  username: string;

  @ApiProperty({ example: 'admin@example.com' })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  // Hash da senha (scrypt). Nunca exposto nas respostas (ver UserResponseDto).
  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  passwordHash: string;

  @ApiProperty({ example: 'Marcos' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // Altura em centímetros (int); alimenta o cálculo de BMI no front.
  @ApiProperty({ example: 177, nullable: true })
  @Column({ name: 'height_cm', type: 'int', nullable: true })
  heightCm: number | null;

  @ApiProperty({ enum: THEMES, example: DEFAULT_THEME })
  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
    default: DEFAULT_THEME,
  })
  theme: Theme;

  @ApiProperty({ enum: LANGUAGES, example: DEFAULT_LANGUAGE })
  @Column({
    type: 'varchar',
    length: 8,
    nullable: false,
    default: DEFAULT_LANGUAGE,
  })
  language: Language;

  // Força a troca de senha no próximo login (usado no admin semeado).
  @ApiProperty({ example: false })
  @Column({ name: 'must_change_password', type: 'boolean', default: false })
  mustChangePassword: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
