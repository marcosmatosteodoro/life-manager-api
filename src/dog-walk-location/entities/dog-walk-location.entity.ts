import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Local de passeio: título e endereço completo. */
@Entity('dog_walk_location')
export class DogWalkLocation {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Parque da Cidade' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ApiProperty({ example: 'Av. das Nações, 1000 - Centro' })
  @Column({ type: 'text', nullable: false })
  address: string;

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
