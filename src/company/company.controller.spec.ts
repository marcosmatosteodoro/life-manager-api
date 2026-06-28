import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

const buildCompany = (overrides: Partial<Company> = {}): Company => ({
  id: 1,
  name: 'Acme Corp',
  website: 'https://acme.com',
  countryId: 1,
  observation: null,
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('CompanyController', () => {
  let controller: CompanyController;
  let service: jest.Mocked<CompanyService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<CompanyService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [{ provide: CompanyService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    service = module.get(CompanyService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service e retorna o resultado', async () => {
    const dto: CreateCompanyDto = {
      name: 'Acme Corp',
      website: 'https://acme.com',
      countryId: 1,
    };
    const created = buildCompany();
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll retorna { count, rows } do service', async () => {
    const payload = { count: 1, rows: [buildCompany()] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll()).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne repassa o id para o service', async () => {
    const entity = buildCompany();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update repassa id e dto para o service', async () => {
    const dto: UpdateCompanyDto = { name: 'Acme 2' };
    const updated = buildCompany({ name: 'Acme 2' });
    service.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove repassa o id e resolve void', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
