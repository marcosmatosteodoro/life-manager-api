import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DOG_SEXES, type DogSex } from '../dog.constants';

/** Cão: nome, raça e sexo. */
@Entity('dog')
export class Dog {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Puffy' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiProperty({ example: 'Poodle' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  breed: string;

  @ApiProperty({ enum: DOG_SEXES, example: 'femea' })
  @Column({ type: 'varchar', length: 16, nullable: false })
  sex: DogSex;

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
