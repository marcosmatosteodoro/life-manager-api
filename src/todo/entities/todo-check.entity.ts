import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Todo } from './todo.entity';

// Um check por todo por dia (a base do histórico e do endpoint /today).
@Entity('todo_check')
@Unique('UQ_todo_check_todo_date', ['todoId', 'date'])
export class TodoCheck {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // todoId — FK para todo (not null)
  @ApiProperty({ example: 1, description: 'Id do todo (FK)' })
  @Column({ name: 'todo_id', type: 'int', nullable: false })
  todoId: number;

  // Relação com todo; ON DELETE CASCADE remove os checks ao apagar o todo.
  @ApiProperty({ type: () => Todo, required: false })
  @ManyToOne(() => Todo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'todo_id' })
  todo?: Todo;

  // date — dia ao qual o check se refere, not null
  @ApiProperty({
    example: '2026-06-28',
    description: 'Dia do check (YYYY-MM-DD)',
  })
  @Column({ type: 'date', nullable: false })
  date: string;

  // checked boolean, default false
  @ApiProperty({ example: false, default: false })
  @Column({ type: 'boolean', default: false })
  checked: boolean;

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
