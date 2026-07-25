import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Dog } from '../dog/entities/dog.entity';
import { DogWalk } from '../dog-walk/entities/dog-walk.entity';
import { DogWeight } from '../dog-weight/entities/dog-weight.entity';
import {
  DogDashboardDogDto,
  DogDashboardResponseDto,
} from './dto/dog-dashboard-response.dto';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class DogDashboardService {
  constructor(
    @InjectRepository(Dog)
    private readonly dogRepository: Repository<Dog>,
    @InjectRepository(DogWalk)
    private readonly walkRepository: Repository<DogWalk>,
    @InjectRepository(DogWeight)
    private readonly weightRepository: Repository<DogWeight>,
  ) {}

  /** Agrega as estatísticas dos passeios e o peso mais recente de cada cão. */
  async getDashboard(): Promise<DogDashboardResponseDto> {
    const weekStart = this.startOfWeek();
    const monthStart = this.startOfMonth();
    const monthStartStr = this.dayStr(monthStart);

    const [
      totalWalks,
      walksThisWeek,
      walksThisMonth,
      earliest,
      last,
      avgRaw,
      perDog,
      perLocation,
      dogs,
    ] = await Promise.all([
      this.walkRepository.count(),
      this.walkRepository.count({
        where: { startedAt: MoreThanOrEqual(weekStart) },
      }),
      this.walkRepository.count({
        where: { startedAt: MoreThanOrEqual(monthStart) },
      }),
      this.walkRepository.findOne({ where: {}, order: { startedAt: 'ASC' } }),
      this.walkRepository.findOne({ where: {}, order: { startedAt: 'DESC' } }),
      this.walkRepository
        .createQueryBuilder('w')
        .select('AVG(w.duration_seconds)', 'avg')
        .getRawOne<{ avg: string | null }>(),
      this.walkRepository
        .createQueryBuilder('w')
        .leftJoin('w.dogs', 'dog')
        .select('dog.id', 'id')
        .addSelect('dog.name', 'label')
        .addSelect('COUNT(w.id)', 'count')
        .groupBy('dog.id')
        .addGroupBy('dog.name')
        .getRawMany<{ id: number; label: string; count: string }>(),
      this.walkRepository
        .createQueryBuilder('w')
        .leftJoin('w.location', 'loc')
        .select('loc.id', 'id')
        .addSelect('loc.title', 'label')
        .addSelect('COUNT(w.id)', 'count')
        .groupBy('loc.id')
        .addGroupBy('loc.title')
        .getRawMany<{ id: number; label: string; count: string }>(),
      this.dogRepository.find({ order: { name: 'ASC' } }),
    ]);

    const avgDurationSeconds = avgRaw?.avg
      ? Math.round(Number(avgRaw.avg))
      : null;

    const avgWalksPerWeek = this.estimateWalksPerWeek(
      totalWalks,
      earliest?.startedAt ?? null,
    );

    const dogStats = await Promise.all(
      dogs.map((dog) => this.dogWeightStats(dog, monthStartStr)),
    );

    return {
      totalWalks,
      walksThisWeek,
      walksThisMonth,
      avgWalksPerWeek,
      avgDurationSeconds,
      lastWalkAt: last ? last.startedAt.toISOString() : null,
      perDog: perDog
        .filter((r) => r.id != null)
        .map((r) => ({ id: r.id, label: r.label, count: Number(r.count) })),
      perLocation: perLocation
        .filter((r) => r.id != null)
        .map((r) => ({ id: r.id, label: r.label, count: Number(r.count) })),
      dogs: dogStats,
      needsWeighing: dogStats.some((d) => !d.weighedThisMonth),
    };
  }

  /** Peso mais recente do cão e se já foi pesado no mês corrente. */
  private async dogWeightStats(
    dog: Dog,
    monthStartStr: string,
  ): Promise<DogDashboardDogDto> {
    const [latest, thisMonth] = await Promise.all([
      this.weightRepository.findOne({
        where: { dogId: dog.id },
        order: { date: 'DESC', id: 'DESC' },
      }),
      this.weightRepository.count({
        where: { dogId: dog.id, date: MoreThanOrEqual(monthStartStr) },
      }),
    ]);
    return {
      id: dog.id,
      name: dog.name,
      latestWeight: latest ? Number(latest.value) : null,
      weighedThisMonth: thisMonth > 0,
    };
  }

  /** Média de passeios/semana desde o 1º passeio (mín. 1 semana). */
  private estimateWalksPerWeek(total: number, earliest: Date | null): number {
    if (!total || !earliest) return 0;
    const weeks = Math.max(1, (Date.now() - earliest.getTime()) / WEEK_MS);
    return Math.round((total / weeks) * 10) / 10;
  }

  private dayStr(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** Segunda-feira desta semana, 00:00 local. */
  private startOfWeek(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const daysSinceMonday = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - daysSinceMonday);
    return d;
  }

  /** Primeiro dia do mês corrente, 00:00 local. */
  private startOfMonth(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
  }
}
