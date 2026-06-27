import { ConfigService } from '@nestjs/config';
import { JobProvider } from '../enums/job-provider.enum';
import { JobSearchPeriod } from '../enums/job-search-period.enum';
import { AdzunaProvider } from './adzuna.provider';
import { JobSearchQuery } from './job-search-provider.interface';

const query: JobSearchQuery = {
  countryCode: 'us',
  period: JobSearchPeriod.THREE_DAYS,
  maxDaysOld: 3,
  remote: true,
  primary: ['react', 'node'],
  secondary: ['python'],
  limit: 50,
};

const makeConfig = (values: Record<string, string | undefined>) =>
  ({ get: (k: string) => values[k] }) as unknown as ConfigService;

describe('AdzunaProvider', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  it('isConfigured reflete a presença das chaves', () => {
    const semChave = new AdzunaProvider(makeConfig({}));
    expect(semChave.isConfigured()).toBe(false);

    const comChave = new AdzunaProvider(
      makeConfig({ ADZUNA_APP_ID: 'id', ADZUNA_APP_KEY: 'key' }),
    );
    expect(comChave.isConfigured()).toBe(true);
  });

  it('sem chave, não chama a API e devolve vazio', async () => {
    const provider = new AdzunaProvider(makeConfig({}));
    await expect(provider.search(query)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normaliza a resposta (link, empresa, remoto detectado no texto)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              title: 'Remote Node Developer',
              description: 'work remote with node',
              redirect_url: 'https://adzuna/land/1',
              created: '2026-06-25T12:00:00Z',
              company: { display_name: 'Acme' },
              location: { display_name: 'Remote, US' },
              salary_min: 100000,
            },
          ],
        }),
    });

    const provider = new AdzunaProvider(
      makeConfig({ ADZUNA_APP_ID: 'id', ADZUNA_APP_KEY: 'key' }),
    );
    const [job] = await provider.search(query);

    expect(job.source).toBe(JobProvider.ADZUNA);
    expect(job.url).toBe('https://adzuna/land/1');
    expect(job.company).toBe('Acme');
    expect(job.remote).toBe(true);
    expect(job.salaryMin).toBe(100000);
    // A URL chamada inclui o país e as chaves.
    const calls = fetchMock.mock.calls as string[][];
    const calledUrl = calls[0][0];
    expect(calledUrl).toContain('/jobs/us/search/1');
    expect(calledUrl).toContain('app_id=id');
  });
});
