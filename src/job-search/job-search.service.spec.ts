import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Country } from '../country/entities/country.entity';
import { JobProvider } from './enums/job-provider.enum';
import { JobSearchPeriod } from './enums/job-search-period.enum';
import { JobSearchService } from './job-search.service';
import { AdzunaProvider } from './providers/adzuna.provider';
import {
  JobSearchQuery,
  NormalizedJob,
} from './providers/job-search-provider.interface';
import { JSearchProvider } from './providers/jsearch.provider';

const job = (overrides: Partial<NormalizedJob> = {}): NormalizedJob => ({
  source: JobProvider.ADZUNA,
  title: 'Developer',
  company: 'Acme',
  location: 'Remote',
  countryCode: 'us',
  remote: true,
  url: 'https://x',
  description: '',
  salaryMin: null,
  salaryMax: null,
  postedAt: null,
  ...overrides,
});

describe('JobSearchService', () => {
  let service: JobSearchService;
  let adzuna: {
    source: JobProvider;
    isConfigured: jest.Mock;
    search: jest.Mock;
  };
  let jsearch: {
    source: JobProvider;
    isConfigured: jest.Mock;
    search: jest.Mock;
  };
  let countryRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    adzuna = {
      source: JobProvider.ADZUNA,
      isConfigured: jest.fn().mockReturnValue(true),
      search: jest.fn().mockResolvedValue([]),
    };
    jsearch = {
      source: JobProvider.JSEARCH,
      isConfigured: jest.fn().mockReturnValue(true),
      search: jest.fn().mockResolvedValue([]),
    };
    countryRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1, code: 'BR' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobSearchService,
        { provide: AdzunaProvider, useValue: adzuna },
        { provide: JSearchProvider, useValue: jsearch },
        { provide: getRepositoryToken(Country), useValue: countryRepo },
      ],
    }).compile();

    service = module.get(JobSearchService);
  });

  afterEach(() => jest.clearAllMocks());

  it('usa os dois provedores por default e mescla os resultados', async () => {
    adzuna.search.mockResolvedValue([
      job({ title: 'React Node Dev', company: 'Acme' }),
    ]);
    jsearch.search.mockResolvedValue([
      job({ source: JobProvider.JSEARCH, title: 'Python Eng', company: 'Y' }),
    ]);

    const result = await service.search({});

    expect(adzuna.search).toHaveBeenCalledTimes(1);
    expect(jsearch.search).toHaveBeenCalledTimes(1);
    expect(result.count).toBe(2);
  });

  it('ordena por aderência à stack (react/node no título pontua mais)', async () => {
    adzuna.search.mockResolvedValue([
      job({
        title: 'React Node Developer',
        company: 'Acme',
        description: 'typescript',
      }),
      job({ title: 'Python Engineer', company: 'Y', description: 'python' }),
    ]);
    jsearch.search.mockResolvedValue([]);

    const result = await service.search({});

    expect(result.rows[0].title).toBe('React Node Developer');
    expect(result.rows[0].matchedKeywords).toEqual(
      expect.arrayContaining(['react', 'node', 'typescript']),
    );
  });

  it('marca hiresInternational por heurística no texto', async () => {
    adzuna.search.mockResolvedValue([
      job({ title: 'Node Dev', description: 'visa sponsorship available' }),
    ]);
    jsearch.search.mockResolvedValue([]);

    const result = await service.search({});

    expect(result.rows[0].hiresInternational).toBe(true);
  });

  it('filtra vagas não-remotas', async () => {
    adzuna.search.mockResolvedValue([
      job({ title: 'Onsite Node', remote: false }),
      job({ title: 'Remote Node', remote: true }),
    ]);
    jsearch.search.mockResolvedValue([]);

    const result = await service.search({});

    expect(result.count).toBe(1);
    expect(result.rows[0].title).toBe('Remote Node');
  });

  it('deduplica a mesma vaga vinda dos dois provedores', async () => {
    adzuna.search.mockResolvedValue([
      job({ title: 'React Dev', company: 'Acme' }),
    ]);
    jsearch.search.mockResolvedValue([
      job({ source: JobProvider.JSEARCH, title: 'React Dev', company: 'Acme' }),
    ]);

    const result = await service.search({});

    expect(result.count).toBe(1);
  });

  it('respeita a seleção de um único provedor', async () => {
    adzuna.search.mockResolvedValue([job()]);
    jsearch.search.mockResolvedValue([job({ source: JobProvider.JSEARCH })]);

    await service.search({ providers: [JobProvider.ADZUNA] });

    expect(adzuna.search).toHaveBeenCalledTimes(1);
    expect(jsearch.search).not.toHaveBeenCalled();
  });

  it('tolera falha de um provedor e retorna o do outro', async () => {
    adzuna.search.mockRejectedValue(new Error('boom'));
    jsearch.search.mockResolvedValue([
      job({ source: JobProvider.JSEARCH, title: 'Node' }),
    ]);

    const result = await service.search({});

    expect(result.count).toBe(1);
    expect(result.rows[0].source).toBe(JobProvider.JSEARCH);
  });

  it('lança ServiceUnavailable quando nenhum provedor está configurado', async () => {
    adzuna.isConfigured.mockReturnValue(false);
    jsearch.isConfigured.mockReturnValue(false);

    await expect(service.search({})).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('passa o período (default 3 dias) e o país resolvido aos provedores', async () => {
    await service.search({});

    expect(countryRepo.findOne).toHaveBeenCalledWith({ where: { code: 'BR' } });
    const calls = adzuna.search.mock.calls as JobSearchQuery[][];
    const query = calls[0][0];
    expect(query.period).toBe(JobSearchPeriod.THREE_DAYS);
    expect(query.countryCode).toBe('br');
  });

  it('lança NotFound quando o countryId informado não existe', async () => {
    countryRepo.findOne.mockResolvedValue(null);

    await expect(service.search({ countryId: 99 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança BadRequest quando o país padrão não está cadastrado', async () => {
    countryRepo.findOne.mockResolvedValue(null);

    await expect(service.search({})).rejects.toThrow(BadRequestException);
  });
});
