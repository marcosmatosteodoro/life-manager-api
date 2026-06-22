import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('weight')
export class Weight {
  // id numérico incremental, not null
  @PrimaryGeneratedColumn()
  id: number;

  // value float com duas casas decimais, not null.
  // decimal(precision, scale) preserva as 2 casas sem erro de ponto flutuante.
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: false })
  value: number;

  // date not null
  @Column({ type: 'date', nullable: false })
  date: string;

  // time null true
  @Column({ type: 'time', nullable: true })
  time: string | null;

  // createdAt automático
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // updatedAt automático
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // creatorId numérico, null true (autenticação virá depois)
  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId: number | null;
}
