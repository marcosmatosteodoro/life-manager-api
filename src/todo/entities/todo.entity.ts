import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// `simple-array` guarda como texto ("1,3,5"); o transformer garante number[].
const numberArray = {
  to: (value: number[]): number[] => value,
  from: (value: string[] | null): number[] => (value ?? []).map(Number),
};

@Entity('todo')
export class Todo {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // name varchar, not null
  @ApiProperty({ example: 'Treinar' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // description text, null true
  @ApiProperty({ example: 'Academia ou corrida', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  // startDate date, not null
  @ApiProperty({ example: '2026-06-01' })
  @Column({ name: 'start_date', type: 'date', nullable: false })
  startDate: string;

  // endDate date, null true
  @ApiProperty({ example: '2026-12-31', nullable: true })
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  // days: dias da semana ISO (1=seg … 7=dom); um ou mais, not null
  @ApiProperty({ example: [1, 3, 5], description: 'Dias ISO (1=seg…7=dom)' })
  @Column({ type: 'simple-array', transformer: numberArray })
  days: number[];

  // tag varchar, null true
  @ApiProperty({ example: 'saúde', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  tag: string | null;

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
