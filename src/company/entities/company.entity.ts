import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Apply } from '../../apply/entities/apply.entity';
import { Country } from '../../country/entities/country.entity';

@Entity('company')
export class Company {
  // id numérico incremental, not null
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // name varchar, not null
  @ApiProperty({ example: 'Acme Corp' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // website varchar, not null
  @ApiProperty({ example: 'https://acme.com' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  website: string;

  // countryId — FK para country (not null)
  @ApiProperty({ example: 1, description: 'Id do país (FK)' })
  @Column({ name: 'country_id', type: 'int', nullable: false })
  countryId: number;

  // observation text, null true — anotações livres sobre a empresa
  @ApiProperty({
    example: 'Processo seletivo longo; recrutadora: Maria',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  observation: string | null;

  // Relação com country; ON DELETE RESTRICT evita apagar país com empresas.
  @ApiProperty({ type: () => Country, required: false })
  @ManyToOne(() => Country, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'country_id' })
  country?: Country;

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

  // Relação inversa com apply (não é coluna; usada para contar candidaturas).
  @OneToMany(() => Apply, (apply) => apply.company)
  applies?: Apply[];

  // applyCount — preenchido via loadRelationCountAndMap na listagem (não persistido).
  @ApiProperty({ example: 3, description: 'Quantidade de candidaturas' })
  applyCount?: number;
}
