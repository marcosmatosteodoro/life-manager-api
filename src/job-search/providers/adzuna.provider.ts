import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobProvider } from '../enums/job-provider.enum';
import {
  JobSearchProvider,
  JobSearchQuery,
  NormalizedJob,
} from './job-search-provider.interface';

// Formato (parcial) da resposta da Adzuna que usamos.
interface AdzunaJob {
  title?: string;
  description?: string;
  redirect_url?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  company?: { display_name?: string };
  location?: { display_name?: string };
}
interface AdzunaResponse {
  results?: AdzunaJob[];
}

/**
 * Provedor Adzuna (API oficial, grátis). Sem flag nativa de "remoto", então
 * acrescentamos "remote" à busca e detectamos no texto. Descrição vem resumida.
 */
@Injectable()
export class AdzunaProvider implements JobSearchProvider {
  readonly source = JobProvider.ADZUNA;
  private readonly logger = new Logger(AdzunaProvider.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('ADZUNA_APP_ID') &&
      this.config.get<string>('ADZUNA_APP_KEY'),
    );
  }

  async search(query: JobSearchQuery): Promise<NormalizedJob[]> {
    const appId = this.config.get<string>('ADZUNA_APP_ID');
    const appKey = this.config.get<string>('ADZUNA_APP_KEY');
    if (!appId || !appKey) return [];

    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      // Busca pela stack principal; "remote" enviesa para vagas remotas.
      what: `${query.primary.join(' ')} developer${query.remote ? ' remote' : ''}`,
      what_or: query.primary.join(' '),
      results_per_page: String(query.limit),
      max_days_old: String(query.maxDaysOld),
      sort_by: 'date',
      'content-type': 'application/json',
    });
    const url = `https://api.adzuna.com/v1/api/jobs/${query.countryCode}/search/1?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      this.logger.error(`Adzuna respondeu ${response.status}`);
      throw new Error(`Adzuna respondeu ${response.status}`);
    }
    const body = (await response.json()) as AdzunaResponse;
    return (body.results ?? []).map((job) =>
      this.normalize(job, query.countryCode),
    );
  }

  private normalize(job: AdzunaJob, countryCode: string): NormalizedJob {
    const text =
      `${job.title ?? ''} ${job.description ?? ''} ${job.location?.display_name ?? ''}`.toLowerCase();
    return {
      source: JobProvider.ADZUNA,
      title: job.title ?? '',
      company: job.company?.display_name ?? null,
      location: job.location?.display_name ?? null,
      countryCode,
      remote: text.includes('remote'),
      url: job.redirect_url ?? '',
      description: job.description ?? null,
      salaryMin: job.salary_min ?? null,
      salaryMax: job.salary_max ?? null,
      postedAt: job.created ?? null,
    };
  }
}
