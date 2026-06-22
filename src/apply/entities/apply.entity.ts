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
import { Company } from '../../company/entities/company.entity';
import { ApplyStatus } from '../enums/apply-status.enum';

@Entity('apply')
export class Apply {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // name varchar, not null
  @ApiProperty({ example: 'Vaga Backend Node - Acme' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // link varchar, null true
  @ApiProperty({ example: 'https://acme.com/vagas/123', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string | null;

  // date date, not null
  @ApiProperty({ example: '2026-06-22' })
  @Column({ type: 'date', nullable: false })
  date: string;

  // status enum, not null
  @ApiProperty({ enum: ApplyStatus, example: ApplyStatus.APPLIED })
  @Column({ type: 'enum', enum: ApplyStatus, nullable: false })
  status: ApplyStatus;

  // description text, null true
  @ApiProperty({ example: 'Processo via LinkedIn...', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  // companyId — FK para company (not null)
  @ApiProperty({ example: 1, description: 'Id da empresa (FK)' })
  @Column({ name: 'company_id', type: 'int', nullable: false })
  companyId: number;

  // Relação com company; ON DELETE RESTRICT evita apagar empresa com candidaturas.
  @ApiProperty({ type: () => Company, required: false })
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

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
