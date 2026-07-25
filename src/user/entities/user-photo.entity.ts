import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Foto de perfil do usuário (uma por usuário). O binário fica no **Vercel Blob**
 * (privado); o Postgres guarda só a referência (pathname/url). 1:1 com `users`.
 */
@Entity('user_photo')
export class UserPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true, nullable: false })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // Caminho do blob no store (usado para ler/apagar).
  @Column({ type: 'varchar', length: 512, nullable: false })
  pathname: string;

  // URL do blob (privada; a leitura passa pelo back autenticado).
  @Column({ type: 'varchar', length: 1024, nullable: false })
  url: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 64, nullable: false })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
