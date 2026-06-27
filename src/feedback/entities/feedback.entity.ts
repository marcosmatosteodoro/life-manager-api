import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeedbackPeriod } from '../enums/feedback-period.enum';

/**
 * Feedback gerado por IA sobre um período. Guarda o que foi enviado ao modelo
 * (inputData + prompt) e o retorno (response) — para auditoria e histórico.
 */
@Entity('feedback')
export class Feedback {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // Período solicitado.
  @ApiProperty({ enum: FeedbackPeriod, example: FeedbackPeriod.THIRTY_DAYS })
  @Column({ type: 'enum', enum: FeedbackPeriod, nullable: false })
  period: FeedbackPeriod;

  // Início do período (null quando "desde o começo").
  @ApiProperty({ example: '2026-05-28', nullable: true })
  @Column({ name: 'period_start', type: 'date', nullable: true })
  periodStart: string | null;

  // Fim do período (data da geração).
  @ApiProperty({ example: '2026-06-27' })
  @Column({ name: 'period_end', type: 'date', nullable: false })
  periodEnd: string;

  // Dados agregados enviados ao modelo (JSON serializado). text: portável.
  @ApiProperty({ description: 'Dados agregados enviados ao modelo (JSON)' })
  @Column({ name: 'input_data', type: 'text', nullable: false })
  inputData: string;

  // Prompt completo enviado (system + user).
  @ApiProperty({ description: 'Prompt completo enviado ao modelo' })
  @Column({ type: 'text', nullable: false })
  prompt: string;

  // Retorno do modelo (HTML).
  @ApiProperty({ description: 'Feedback retornado pelo modelo (HTML)' })
  @Column({ type: 'text', nullable: false })
  response: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // creatorId numérico, null true (autenticação virá depois)
  @ApiProperty({ example: 1, nullable: true })
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;
}
