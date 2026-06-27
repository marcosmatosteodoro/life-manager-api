import { ConfigService } from '@nestjs/config';
import { JobProvider } from '../enums/job-provider.enum';
import { JobSearchPeriod } from '../enums/job-search-period.enum';
import { JobSearchQuery } from './job-search-provider.interface';
import { JSearchProvider } from './jsearch.provider';

const query: JobSearchQuery = {
  countryCode: 'ca',
  period: JobSearchPeriod.SEVEN_DAYS,
  maxDaysOld: 7,
  remote: true,
  primary: ['react', 'node'],
  secondary: ['python'],
  limit: 50,
};

const makeConfig = (values: Record<string, string | undefined>) =>
  ({ get: (k: string) => values[k] }) as unknown as ConfigService;

describe('JSearchProvider', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  it('isConfigured reflete a presença da chave do RapidAPI', () => {
    expect(new JSearchProvider(makeConfig({})).isConfigured()).toBe(false);
    expect(
      new JSearchProvider(makeConfig({ RAPIDAPI_KEY: 'k' })).isConfigured(),
    ).toBe(true);
  });

  it('normaliza a resposta (link de aplicação, descrição completa, remoto)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              job_title: 'Node Engineer',
              employer_name: 'Globex',
              job_city: 'Toronto',
              job_country: 'CA',
              job_is_remote: true,
              job_apply_link: 'https://apply/1',
              job_description: 'node typescript remote',
              job_posted_at_datetime_utc: '2026-06-25T12:00:00Z',
            },
          ],
        }),
    });

    const provider = new JSearchProvider(makeConfig({ RAPIDAPI_KEY: 'k' }));
    const [job] = await provider.search(query);

    expect(job.source).toBe(JobProvider.JSEARCH);
    expect(job.url).toBe('https://apply/1');
    expect(job.remote).toBe(true);
    expect(job.countryCode).toBe('ca');
    // Header de auth e janela de data corretos.
    const calls = fetchMock.mock.calls as [
      string,
      { headers: Record<string, string> },
    ][];
    const [url, init] = calls[0];
    expect(init.headers['X-RapidAPI-Key']).toBe('k');
    expect(url).toContain('date_posted=week');
    expect(url).toContain('remote_jobs_only=true');
  });
});
