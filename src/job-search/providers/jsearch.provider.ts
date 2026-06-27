import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobProvider } from '../enums/job-provider.enum';
import { JobSearchPeriod } from '../enums/job-search-period.enum';
import {
  JobSearchProvider,
  JobSearchQuery,
  NormalizedJob,
} from './job-search-provider.interface';

// Formato (parcial) da resposta da JSearch que usamos.
interface JSearchJob {
  job_title?: string;
  employer_name?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_is_remote?: boolean;
  job_apply_link?: string;
  job_description?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_posted_at_datetime_utc?: string;
}
interface JSearchResponse {
  data?: JSearchJob[];
}

/**
 * Provedor JSearch (RapidAPI, agrega o Google for Jobs). Tem flag nativa de
 * remoto e descrição completa — melhor para casar a stack no texto.
 */
@Injectable()
export class JSearchProvider implements JobSearchProvider {
  readonly source = JobProvider.JSEARCH;
  private readonly logger = new Logger(JSearchProvider.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('RAPIDAPI_KEY'));
  }

  async search(query: JobSearchQuery): Promise<NormalizedJob[]> {
    const apiKey = this.config.get<string>('RAPIDAPI_KEY');
    if (!apiKey) return [];

    const params = new URLSearchParams({
      query: `${query.primary.join(' ')} developer`,
      page: '1',
      num_pages: '1',
      date_posted: this.datePosted(query.period),
      remote_jobs_only: String(query.remote),
      country: query.countryCode,
    });
    const url = `https://jsearch.p.rapidapi.com/search?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
    if (!response.ok) {
      this.logger.error(`JSearch respondeu ${response.status}`);
      throw new Error(`JSearch respondeu ${response.status}`);
    }
    const body = (await response.json()) as JSearchResponse;
    return (body.data ?? []).map((job) =>
      this.normalize(job, query.countryCode, query.remote),
    );
  }

  /** Mapeia o período para a janela nomeada da JSearch. */
  private datePosted(period: JobSearchPeriod): string {
    switch (period) {
      case JobSearchPeriod.TODAY:
        return 'today';
      case JobSearchPeriod.THREE_DAYS:
        return '3days';
      case JobSearchPeriod.SEVEN_DAYS:
        return 'week';
      case JobSearchPeriod.ONE_MONTH:
        return 'month';
    }
  }

  private normalize(
    job: JSearchJob,
    countryCode: string,
    remoteRequested: boolean,
  ): NormalizedJob {
    const location =
      [job.job_city, job.job_state, job.job_country]
        .filter(Boolean)
        .join(', ') || null;
    return {
      source: JobProvider.JSEARCH,
      title: job.job_title ?? '',
      company: job.employer_name ?? null,
      location,
      countryCode: (job.job_country ?? countryCode).toLowerCase(),
      // Pedimos remote_jobs_only; assume remoto quando o campo não vem.
      remote: job.job_is_remote ?? remoteRequested,
      url: job.job_apply_link ?? '',
      description: job.job_description ?? null,
      salaryMin: job.job_min_salary ?? null,
      salaryMax: job.job_max_salary ?? null,
      postedAt: job.job_posted_at_datetime_utc ?? null,
    };
  }
}
