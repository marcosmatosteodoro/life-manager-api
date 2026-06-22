import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApplyStatus } from '../enums/apply-status.enum';

@Entity('apply')
export class Apply {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // name varchar, not null
  @ApiProperty({ example: 'Vaga Backend Node - Acme' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // link varchar, null true
  @ApiProperty({ example: 'https://acme.com/vagas/123', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string | null;

  // date date, not null
  @ApiProperty({ example: '2026-06-22' })
  @Column({ type: 'date', nullable: false })
  date: string;

  // status enum, not null
  @ApiProperty({ enum: ApplyStatus, example: ApplyStatus.APPLIED })
  @Column({ type: 'enum', enum: ApplyStatus, nullable: false })
  status: ApplyStatus;

  // description text, null true
  @ApiProperty({ example: 'Processo via LinkedIn...', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  // createdAt automático
  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // updatedAt automático
  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // creatorId numérico, null true (autenticação virá depois)
  @ApiProperty({ example: 1, nullable: true })
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;
}
