import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Categoria de um problema: apenas nome e cor (hex). Exibida como tag no front. */
@Entity('problem_category')
export class ProblemCategory {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Saúde' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // Cor hex (#rgb ou #rrggbb) usada como fundo da tag.
  @ApiProperty({ example: '#ef4444' })
  @Column({ type: 'varchar', length: 16, nullable: false })
  color: string;

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
