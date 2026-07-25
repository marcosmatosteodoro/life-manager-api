import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Dog } from './dog.entity';

/**
 * Foto de perfil do cão (uma por cão). O binário fica no **Vercel Blob**
 * (privado); o Postgres guarda só a referência (pathname/url). 1:1 com `dog`.
 */
@Entity('dog_photo')
export class DogPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dog_id', type: 'int', unique: true, nullable: false })
  dogId: number;

  @OneToOne(() => Dog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dog_id' })
  dog?: Dog;

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
