import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FlashCard } from './flash-card.entity';

/**
 * Imagem de um flashcard (uma por card, só em grupos do tipo `image`). O binário
 * fica no **Vercel Blob** privado; o Postgres guarda só a referência
 * (pathname/url). 1:1 com `flash_card`.
 */
@Entity('flash_card_image')
export class FlashCardImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'flash_card_id', type: 'int', unique: true, nullable: false })
  flashCardId: number;

  @OneToOne(() => FlashCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flash_card_id' })
  card?: FlashCard;

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
