import { ApiProperty } from '@nestjs/swagger';
import { JobProvider } from '../enums/job-provider.enum';

/** Uma vaga já enriquecida (com score e flags), pronta para o front. */
export class JobRowDto {
  @ApiProperty({ enum: JobProvider, description: 'API de origem' })
  source: JobProvider;

  @ApiProperty({ example: 'Senior Backend Developer (Node.js)' })
  title: string;

  @ApiProperty({ example: 'Acme Inc', nullable: true })
  company: string | null;

  @ApiProperty({ example: 'Remote, US', nullable: true })
  location: string | null;

  @ApiProperty({
    example: 'us',
    description: 'Código do país (ISO, minúsculo)',
  })
  countryCode: string;

  @ApiProperty({ example: true, nullable: true })
  remote: boolean | null;

  @ApiProperty({ example: 'https://...' })
  url: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ example: 110000, nullable: true })
  salaryMin: number | null;

  @ApiProperty({ example: 150000, nullable: true })
  salaryMax: number | null;

  @ApiProperty({ example: '2026-06-25T12:00:00Z', nullable: true })
  postedAt: string | null;

  @ApiProperty({
    example: 7,
    description: 'Aderência à stack (maior = melhor)',
  })
  score: number;

  @ApiProperty({
    example: ['react', 'node'],
    description: 'Termos da stack que casaram',
  })
  matchedKeywords: string[];

  @ApiProperty({
    example: true,
    description: 'Heurística: indícios de que contrata estrangeiro/latino',
  })
  hiresInternational: boolean;
}

export class JobSearchResponseDto {
  @ApiProperty({ example: 12, description: 'Quantidade de vagas retornadas' })
  count: number;

  @ApiProperty({ type: JobRowDto, isArray: true })
  rows: JobRowDto[];
}
