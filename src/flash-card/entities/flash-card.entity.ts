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
import { FlashCardGroup } from '../../flash-card-group/entities/flash-card-group.entity';

@Entity('flash_card')
export class FlashCard {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // term varchar, not null
  @ApiProperty({ example: 'give up' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  term: string;

  // value varchar, null true
  @ApiProperty({ example: 'desistir', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  value: string | null;

  // picture varchar (link da imagem no CDN), null true
  @ApiProperty({
    example: 'https://cdn.exemplo.com/giveup.png',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  picture: string | null;

  // correctAnswers int, default 0 — atualizado só pelos endpoints de review
  @ApiProperty({ example: 0, default: 0 })
  @Column({ name: 'correct_answers', type: 'int', default: 0 })
  correctAnswers: number;

  // wrongAnswers int, default 0 — atualizado só pelos endpoints de review
  @ApiProperty({ example: 0, default: 0 })
  @Column({ name: 'wrong_answers', type: 'int', default: 0 })
  wrongAnswers: number;

  // score int, default 0 (pode ser negativo) — atualizado só pelo review
  @ApiProperty({ example: 0, default: 0 })
  @Column({ type: 'int', default: 0 })
  score: number;

  // lastReview date, null true
  @ApiProperty({ example: '2026-06-24', nullable: true })
  @Column({ name: 'last_review', type: 'date', nullable: true })
  lastReview: string | null;

  // flashCardGroupId — FK para o grupo (not null)
  @ApiProperty({ example: 1, description: 'Id do grupo (FK)' })
  @Column({ name: 'flash_card_group_id', type: 'int', nullable: false })
  flashCardGroupId: number;

  @ManyToOne(() => FlashCardGroup, (group) => group.flashCards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'flash_card_group_id' })
  group?: FlashCardGroup;

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

  // Campo calculado em runtime (não persistido): correctAnswers + wrongAnswers.
  @ApiProperty({ example: 0, description: 'Total de revisões (runtime)' })
  totalReviews?: number;
}
