import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleStatus } from '../enums/article-status.enum';

@Entity('article')
export class Article {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // title string, not null
  @ApiProperty({ example: 'The Pragmatic Programmer' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  // link varchar, null true
  @ApiProperty({ example: 'https://exemplo.com/artigo', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string | null;

  // readingTime int, not null
  @ApiProperty({ example: 5, description: 'Tempo estimado de leitura (minutos)' })
  @Column({ name: 'reading_time', type: 'int', nullable: false })
  readingTime: number;

  // timeRead int, null true (não é mais obrigatório)
  @ApiProperty({
    example: 7,
    nullable: true,
    description: 'Tempo gasto na leitura (minutos)',
  })
  @Column({ name: 'time_read', type: 'int', nullable: true })
  timeRead: number | null;

  // status enum — calculado pelo back, não editável pelo front
  @ApiProperty({ enum: ArticleStatus, example: ArticleStatus.READING_IN_PROGRESS })
  @Column({
    type: 'enum',
    enum: ArticleStatus,
    nullable: false,
    default: ArticleStatus.READING_IN_PROGRESS,
  })
  status: ArticleStatus;

  // timeWrite int, null true
  @ApiProperty({
    example: 12,
    nullable: true,
    description: 'Tempo gasto escrevendo o resumo (minutos)',
  })
  @Column({ name: 'time_write', type: 'int', nullable: true })
  timeWrite: number | null;

  // summary texto longo, null true (text: portável entre Postgres e MySQL)
  @ApiProperty({ example: 'Resumo do artigo...', nullable: true })
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  // summaryCorrected texto longo, null true
  @ApiProperty({ example: 'Resumo corrigido...', nullable: true })
  @Column({ name: 'summary_corrected', type: 'text', nullable: true })
  summaryCorrected: string | null;

  // score int, null true
  @ApiProperty({ example: 8, nullable: true })
  @Column({ type: 'int', nullable: true })
  score: number | null;

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
