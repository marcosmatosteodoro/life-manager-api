import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('daily_check')
export class DailyCheck {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // readingSkills boolean, default false
  @ApiProperty({ example: false, default: false })
  @Column({ name: 'reading_skills', type: 'boolean', default: false })
  readingSkills: boolean;

  // writingSkills boolean, default false
  @ApiProperty({ example: false, default: false })
  @Column({ name: 'writing_skills', type: 'boolean', default: false })
  writingSkills: boolean;

  // listeningSkills boolean, default false
  @ApiProperty({ example: false, default: false })
  @Column({ name: 'listening_skills', type: 'boolean', default: false })
  listeningSkills: boolean;

  // speakingSkills boolean, default false
  @ApiProperty({ example: false, default: false })
  @Column({ name: 'speaking_skills', type: 'boolean', default: false })
  speakingSkills: boolean;

  // applyJobs boolean, default false
  @ApiProperty({ example: false, default: false })
  @Column({ name: 'apply_jobs', type: 'boolean', default: false })
  applyJobs: boolean;

  // date not null
  @ApiProperty({ example: '2026-06-22' })
  @Column({ type: 'date', nullable: false })
  date: string;

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
