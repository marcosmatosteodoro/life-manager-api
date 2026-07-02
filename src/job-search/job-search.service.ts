import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../country/entities/country.entity';
import { tr } from '../i18n/translate';
import { JobSearchResponseDto, JobRowDto } from './dto/job-search-response.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobProvider } from './enums/job-provider.enum';
import {
  JobSearchPeriod,
  PERIOD_MAX_DAYS,
} from './enums/job-search-period.enum';
import {
  DEFAULT_COUNTRY_CODE,
  INTERNATIONAL_HINTS,
  STACK_PRIMARY,
  STACK_SECONDARY,
} from './job-search.config';
import { AdzunaProvider } from './providers/adzuna.provider';
import {
  JobSearchProvider,
  JobSearchQuery,
  NormalizedJob,
} from './providers/job-search-provider.interface';
import { JSearchProvider } from './providers/jsearch.provider';

@Injectable()
export class JobSearchService {
  private readonly logger = new Logger(JobSearchService.name);
  private readonly providers: JobSearchProvider[];

  constructor(
    private readonly adzuna: AdzunaProvider,
    private readonly jsearch: JSearchProvider,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {
    this.providers = [adzuna, jsearch];
  }

  /**
   * Busca vagas remotas combinando os provedores escolhidos (default: todos),
   * filtra por remoto, pontua pela stack e devolve `{ count, rows }` ordenado.
   */
  async search(dto: SearchJobsDto): Promise<JobSearchResponseDto> {
    const period = dto.period ?? JobSearchPeriod.THREE_DAYS;
    const country = await this.resolveCountry(dto.countryId);
    const selected = this.selectProviders(dto.providers);

    const query: JobSearchQuery = {
      countryCode: country.code.toLowerCase(),
      period,
      maxDaysOld: PERIOD_MAX_DAYS[period],
      remote: true, // requisito: sempre remoto
      primary: STACK_PRIMARY,
      secondary: STACK_SECONDARY,
      limit: 50,
    };

    // Um provedor falho não derruba os demais.
    const settled = await Promise.allSettled(
      selected.map((provider) => provider.search(query)),
    );
    const jobs: NormalizedJob[] = [];
    settled.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        jobs.push(...result.value);
      } else {
        this.logger.error(
          `Provedor ${selected[index].source} falhou: ${
            (result.reason as Error)?.message
          }`,
        );
      }
    });

    const rows = this.dedupe(jobs.map((job) => this.enrich(job)))
      .filter((row) => row.remote) // garante "tem que ser remoto"
      .sort((a, b) => b.score - a.score);

    return { count: rows.length, rows };
  }

  /** Provedores escolhidos (default: todos), restritos aos configurados. */
  private selectProviders(requested?: JobProvider[]): JobSearchProvider[] {
    const configured = this.providers.filter((p) => p.isConfigured());
    const chosen = requested?.length
      ? configured.filter((p) => requested.includes(p.source))
      : configured;
    if (!chosen.length) {
      throw new ServiceUnavailableException(tr('jobsearch.noProvider'));
    }
    return chosen;
  }

  /** Resolve o país pela FK; sem id, usa o padrão (Brasil). */
  private async resolveCountry(countryId?: number): Promise<Country> {
    if (countryId != null) {
      const country = await this.countryRepository.findOne({
        where: { id: countryId },
      });
      if (!country) {
        throw new NotFoundException(
          tr('jobsearch.countryNotFound', { id: countryId }),
        );
      }
      return country;
    }
    const fallback = await this.countryRepository.findOne({
      where: { code: DEFAULT_COUNTRY_CODE },
    });
    if (!fallback) {
      throw new BadRequestException(
        tr('jobsearch.defaultCountryMissing', { code: DEFAULT_COUNTRY_CODE }),
      );
    }
    return fallback;
  }

  /** Anexa score (aderência à stack) e flag de contratação internacional. */
  private enrich(job: NormalizedJob): JobRowDto {
    const title = job.title.toLowerCase();
    const haystack = `${job.title} ${job.description ?? ''}`.toLowerCase();
    const matchedKeywords: string[] = [];
    let score = 0;

    for (const kw of STACK_PRIMARY) {
      if (haystack.includes(kw)) {
        matchedKeywords.push(kw);
        score += title.includes(kw) ? 3 : 2;
      }
    }
    for (const kw of STACK_SECONDARY) {
      if (haystack.includes(kw)) {
        matchedKeywords.push(kw);
        score += title.includes(kw) ? 2 : 1;
      }
    }

    const hiresInternational = INTERNATIONAL_HINTS.some((hint) =>
      haystack.includes(hint),
    );
    if (hiresInternational) score += 2;

    return { ...job, score, matchedKeywords, hiresInternational };
  }

  /** Remove duplicatas entre provedores (mesma vaga), mantendo o maior score. */
  private dedupe(rows: JobRowDto[]): JobRowDto[] {
    const byKey = new Map<string, JobRowDto>();
    for (const row of rows) {
      const key = `${row.title}|${row.company ?? ''}`.toLowerCase().trim();
      const existing = byKey.get(key);
      if (!existing || row.score > existing.score) {
        byKey.set(key, row);
      }
    }
    return [...byKey.values()];
  }
}
