import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('country')
export class Country {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // name varchar, not null
  @ApiProperty({ example: 'Brasil' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // code varchar, not null
  @ApiProperty({ example: 'BR' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  code: string;

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
