import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProblemCategory } from '../../problem-category/entities/problem-category.entity';
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  PROBLEM_PRIORITIES,
  PROBLEM_STATUSES,
  type ProblemPriority,
  type ProblemStatus,
} from '../problem.constants';

/** Problema a ser resolvido: título, descrição e status editáveis livremente. */
@Entity('problem')
export class Problem {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Marcar consulta no dentista' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  // Ordem manual (1..N contígua entre todos os problemas). Regras no service.
  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: false })
  position: number;

  @ApiProperty({ example: 'Escolher o convênio e ligar para agendar.', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ enum: PROBLEM_STATUSES, example: DEFAULT_STATUS })
  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
    default: DEFAULT_STATUS,
  })
  status: ProblemStatus;

  @ApiProperty({ enum: PROBLEM_PRIORITIES, example: DEFAULT_PRIORITY })
  @Column({
    type: 'varchar',
    length: 16,
    nullable: false,
    default: DEFAULT_PRIORITY,
  })
  priority: ProblemPriority;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // categoryId — FK opcional para problem_category (categoria não é obrigatória).
  @ApiProperty({ example: 1, nullable: true, description: 'Id da categoria (FK)' })
  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number | null;

  // Relação com a categoria; ON DELETE SET NULL (apagar categoria não quebra o problema).
  @ApiProperty({ type: () => ProblemCategory, required: false, nullable: true })
  @ManyToOne(() => ProblemCategory, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: ProblemCategory | null;

  // creatorId numérico, null true (autenticação virá depois)
  @ApiProperty({ example: 1, nullable: true })
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;
}
