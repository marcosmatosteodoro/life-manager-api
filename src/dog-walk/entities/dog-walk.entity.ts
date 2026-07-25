import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dog } from '../../dog/entities/dog.entity';
import { DogWalkLocation } from '../../dog-walk-location/entities/dog-walk-location.entity';

/**
 * Passeio com os cães: quem passeou (creatorId), quais cães (N:N), o local e os
 * tempos. `durationSeconds` é o tempo ATIVO (descontando pausas) medido no front.
 */
@Entity('dog_walk')
export class DogWalk {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2026-07-22T08:00:00.000Z' })
  @Column({ name: 'started_at', type: 'timestamp', nullable: false })
  startedAt: Date;

  @ApiProperty({ example: '2026-07-22T08:35:00.000Z' })
  @Column({ name: 'ended_at', type: 'timestamp', nullable: false })
  endedAt: Date;

  @ApiProperty({ example: 1800, description: 'Duração ativa em segundos' })
  @Column({ name: 'duration_seconds', type: 'int', nullable: false })
  durationSeconds: number;

  // Local escolhido; RESTRICT evita apagar local com passeios registrados.
  @ApiProperty({ example: 1, description: 'Id do local (FK)' })
  @Column({ name: 'location_id', type: 'int', nullable: false })
  locationId: number;

  @ApiProperty({ type: () => DogWalkLocation, required: false })
  @ManyToOne(() => DogWalkLocation, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'location_id' })
  location?: DogWalkLocation;

  // Cães que participaram (N:N via tabela dog_walk_dogs).
  @ApiProperty({ type: () => Dog, isArray: true, required: false })
  @ManyToMany(() => Dog)
  @JoinTable({
    name: 'dog_walk_dogs',
    joinColumn: { name: 'dog_walk_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'dog_id', referencedColumnName: 'id' },
  })
  dogs?: Dog[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Usuário que fez o passeio (id do JWT).
  @ApiProperty({ example: 1, nullable: true })
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;
}
