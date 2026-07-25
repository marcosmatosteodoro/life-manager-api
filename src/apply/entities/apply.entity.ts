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
import { AdviceStatus } from '../enums/advice-status.enum';
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

  // Criado por humano (app) ou robô (extensão). Default: humano.
  @ApiProperty({
    example: true,
    description: 'Humano (app) ou robô (extensão)',
  })
  @Column({ name: 'is_human', type: 'boolean', default: true })
  isHuman: boolean;

  // Conselho da extensão (1 não aplique … 4 ótimo match). Opcional.
  @ApiProperty({
    enum: AdviceStatus,
    nullable: true,
    example: AdviceStatus.EVALUATE,
  })
  @Column({ name: 'advice_status', type: 'smallint', nullable: true })
  adviceStatus: AdviceStatus | null;

  // Motivo/decisão (por que apliquei ou não), opcional — usado no Conselheiro.
  @ApiProperty({
    nullable: true,
    example: 'Extensão não soube; apliquei porque...',
  })
  @Column({ name: 'decision_description', type: 'text', nullable: true })
  decisionDescription: string | null;

  // companyId — FK para company (not null)
  @ApiProperty({ example: 1, description: 'Id da empresa (FK)' })
  @Column({ name: 'company_id', type: 'int', nullable: false })
  companyId: number;

  // Relação com company; ON DELETE RESTRICT evita apagar empresa com candidaturas.
  @ApiProperty({ type: () => Company, required: false })
  @ManyToOne(() => Company, (company) => company.applies, {
    onDelete: 'RESTRICT',
  })
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
