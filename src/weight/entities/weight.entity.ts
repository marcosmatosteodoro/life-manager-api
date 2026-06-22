import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

@Entity('weight')
export class Weight {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // value float com duas casas decimais, not null.
  // decimal(precision, scale) preserva as 2 casas sem erro de ponto flutuante.
  // O transformer converte a string que o MySQL retorna de volta para number.
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: false,
    transformer: decimalTransformer,
  })
  @ApiProperty({ example: 81.55 })
  value: number;

  // date not null
  @ApiProperty({ example: '2026-06-22' })
  @Column({ type: 'date', nullable: false })
  date: string;

  // time null true
  @ApiProperty({ example: '08:30:00', nullable: true })
  @Column({ type: 'time', nullable: true })
  time: string | null;

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
