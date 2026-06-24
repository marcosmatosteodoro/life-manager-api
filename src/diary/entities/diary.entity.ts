import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DiaryType } from '../enums/diary-type.enum';

@Entity('diary')
export class Diary {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // day date, not null
  @ApiProperty({ example: '2026-06-24' })
  @Column({ type: 'date', nullable: false })
  day: string;

  // description texto longo, not null (text: portável entre Postgres e MySQL)
  @ApiProperty({ example: 'Hoje foi um dia produtivo...' })
  @Column({ type: 'text', nullable: false })
  description: string;

  // type enum, not null
  @ApiProperty({ enum: DiaryType, example: DiaryType.DAILY })
  @Column({ type: 'enum', enum: DiaryType, nullable: false })
  type: DiaryType;

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
