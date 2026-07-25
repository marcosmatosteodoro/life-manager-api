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
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { Dog } from '../../dog/entities/dog.entity';

/** Pesagem de um cão (kg). Mensal, espelha o peso do usuário. */
@Entity('dog_weight')
export class DogWeight {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // FK do cão; ON DELETE CASCADE (apagar o cão remove as pesagens dele).
  @ApiProperty({ example: 1, description: 'Id do cão (FK)' })
  @Column({ name: 'dog_id', type: 'int', nullable: false })
  dogId: number;

  @ApiProperty({ type: () => Dog, required: false })
  @ManyToOne(() => Dog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dog_id' })
  dog?: Dog;

  @ApiProperty({ example: 4.35 })
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  value: number;

  @ApiProperty({ example: '2026-07-22' })
  @Column({ type: 'date', nullable: false })
  date: string;

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
