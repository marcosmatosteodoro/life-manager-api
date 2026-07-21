import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  DEFAULT_STATUS,
  PROBLEM_STATUSES,
  type ProblemStatus,
} from '../problem.constants';

/** Problema a ser resolvido: título, descrição e status editáveis livremente. */
@Entity('problem')
export class Problem {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Login lento em produção' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  // Ordem manual (1..N contígua entre todos os problemas). Regras no service.
  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: false })
  position: number;

  @ApiProperty({ example: 'Investigar consultas N+1 no dashboard.', nullable: true })
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
