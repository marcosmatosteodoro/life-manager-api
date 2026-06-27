import { JobProvider } from '../enums/job-provider.enum';
import { JobSearchPeriod } from '../enums/job-search-period.enum';

/**
 * Query unificada passada a qualquer provedor. Cada implementação traduz
 * esses campos para os parâmetros da sua própria API — a ideia é a mesma.
 */
export interface JobSearchQuery {
  /** Código ISO do país em minúsculas (ex.: 'us', 'ca', 'br'). */
  countryCode: string;
  /** Período escolhido (alguns provedores usam janelas nomeadas). */
  period: JobSearchPeriod;
  /** Equivalente em dias (provedores que filtram por nº de dias). */
  maxDaysOld: number;
  /** Apenas vagas remotas. */
  remote: boolean;
  /** Stack principal (entra na busca). */
  primary: string[];
  /** Stack secundária (só ranqueia). */
  secondary: string[];
  /** Máximo de resultados por provedor. */
  limit: number;
}

/** Vaga normalizada por um provedor (antes do enriquecimento/score). */
export interface NormalizedJob {
  source: JobProvider;
  title: string;
  company: string | null;
  location: string | null;
  countryCode: string;
  remote: boolean | null;
  url: string;
  description: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  postedAt: string | null; // ISO
}

/** Contrato único das duas implementações (Adzuna e JSearch). */
export interface JobSearchProvider {
  /** Identifica o provedor. */
  readonly source: JobProvider;
  /** Há chave configurada para usar este provedor? */
  isConfigured(): boolean;
  /** Busca e normaliza as vagas. */
  search(query: JobSearchQuery): Promise<NormalizedJob[]>;
}
