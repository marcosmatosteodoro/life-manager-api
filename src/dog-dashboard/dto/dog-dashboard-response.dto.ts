import { ApiProperty } from '@nestjs/swagger';

export class DogDashboardCountDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Puffy', description: 'Nome do cão ou título do local' })
  label: string;

  @ApiProperty({ example: 12 })
  count: number;
}

export class DogDashboardDogDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Puffy' })
  name: string;

  @ApiProperty({ example: 4.35, nullable: true })
  latestWeight: number | null;

  @ApiProperty({ example: true })
  weighedThisMonth: boolean;
}

export class DogDashboardResponseDto {
  @ApiProperty({ example: 42 })
  totalWalks: number;

  @ApiProperty({ example: 5 })
  walksThisWeek: number;

  @ApiProperty({ example: 18 })
  walksThisMonth: number;

  @ApiProperty({ example: 4.5, description: 'Estimativa de passeios por semana' })
  avgWalksPerWeek: number;

  @ApiProperty({ example: 1620, nullable: true, description: 'Duração média (s)' })
  avgDurationSeconds: number | null;

  @ApiProperty({ example: '2026-07-22T08:00:00.000Z', nullable: true })
  lastWalkAt: string | null;

  @ApiProperty({ type: DogDashboardCountDto, isArray: true })
  perDog: DogDashboardCountDto[];

  @ApiProperty({ type: DogDashboardCountDto, isArray: true })
  perLocation: DogDashboardCountDto[];

  @ApiProperty({ type: DogDashboardDogDto, isArray: true })
  dogs: DogDashboardDogDto[];

  @ApiProperty({ example: true, description: 'Algum cão sem pesagem neste mês' })
  needsWeighing: boolean;
}
