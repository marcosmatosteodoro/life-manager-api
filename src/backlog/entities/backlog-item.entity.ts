import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  BACKLOG_STATUSES,
  DEFAULT_STATUS,
  type BacklogStatus,
} from '../backlog.constants';

/**
 * Item do backlog do sistema ("próximos passos"). Pendentes têm `position`
 * única/contígua (1..N); concluídos têm `position = NULL` e `completedAt`.
 * As regras de posição vivem no service.
 */
@Entity('backlog_item')
export class BacklogItem {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Exportar relatório em PDF' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // Ordem de prioridade entre os pendentes. NULL quando concluído.
  @ApiProperty({ example: 1, nullable: true })
  @Column({ type: 'int', nullable: true })
  position: number | null;

  @ApiProperty({ example: 'Detalhes da ideia...', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ enum: BACKLOG_STATUSES, example: DEFAULT_STATUS })
  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
    default: DEFAULT_STATUS,
  })
  status: BacklogStatus;

  @ApiProperty({ nullable: true })
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ example: 1, nullable: true })
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;
}
