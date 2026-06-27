import { Test, TestingModule } from '@nestjs/testing';
import { JobProvider } from './enums/job-provider.enum';
import { JobSearchController } from './job-search.controller';
import { JobSearchService } from './job-search.service';

describe('JobSearchController', () => {
  let controller: JobSearchController;
  const service = { search: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobSearchController],
      providers: [{ provide: JobSearchService, useValue: service }],
    }).compile();
    controller = module.get(JobSearchController);
  });

  afterEach(() => jest.clearAllMocks());

  it('delega a busca para o service', async () => {
    const payload = { count: 0, rows: [] };
    service.search.mockResolvedValue(payload);

    const dto = { providers: [JobProvider.ADZUNA] };
    await expect(controller.search(dto)).resolves.toEqual(payload);
    expect(service.search).toHaveBeenCalledWith(dto);
  });
});
