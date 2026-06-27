import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FlashCard } from '../../flash-card/entities/flash-card.entity';

@Entity('flash_card_group')
export class FlashCardGroup {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // name varchar, not null
  @ApiProperty({ example: 'Phrasal Verbs' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

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

  // Flashcards do grupo (carregados nas leituras do grupo).
  @ApiProperty({ type: () => [FlashCard], required: false })
  @OneToMany(() => FlashCard, (flashCard) => flashCard.group)
  flashCards?: FlashCard[];

  // Campo calculado em runtime (não persistido): total de flashcards do grupo.
  @ApiProperty({
    example: 12,
    description: 'Quantidade de flashcards (runtime)',
  })
  flashCardsCount?: number;
}
