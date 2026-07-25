import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Problem } from './problem.entity';

/**
 * Nota de voz de um problema (1:1). O áudio é guardado como base64 e buscado sob
 * demanda — a listagem de problemas NÃO carrega este blob. Espelha
 * `backlog_item_audio`.
 */
@Entity('problem_audio')
export class ProblemAudio {
  @PrimaryGeneratedColumn()
  id: number;

  // FK única para o problema; ON DELETE CASCADE (apagar o problema remove o áudio).
  @Column({ name: 'problem_id', type: 'int', unique: true, nullable: false })
  problemId: number;

  @OneToOne(() => Problem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problem_id' })
  problem?: Problem;

  // Áudio em base64 (sem prefixo data URL).
  @Column({ type: 'text', nullable: false })
  data: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 64, nullable: false })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
