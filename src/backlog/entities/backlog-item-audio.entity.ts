import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BacklogItem } from './backlog-item.entity';

/**
 * Nota de voz de um item do backlog (1:1). O áudio é guardado como base64 e
 * buscado sob demanda — a listagem do backlog NÃO carrega este blob.
 */
@Entity('backlog_item_audio')
export class BacklogItemAudio {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // FK única para o item; ON DELETE CASCADE (apagar o item remove o áudio).
  @ApiProperty({ example: 1 })
  @Column({ name: 'backlog_item_id', type: 'int', unique: true, nullable: false })
  backlogItemId: number;

  @OneToOne(() => BacklogItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'backlog_item_id' })
  item?: BacklogItem;

  // Áudio em base64 (sem prefixo data URL).
  @ApiProperty({ description: 'Áudio em base64' })
  @Column({ type: 'text', nullable: false })
  data: string;

  @ApiProperty({ example: 'audio/webm' })
  @Column({ name: 'mime_type', type: 'varchar', length: 64, nullable: false })
  mimeType: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
