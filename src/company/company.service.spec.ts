import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../country/entities/country.entity';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './entities/company.entity';

// Mock tipado do Repository — nenhuma chamada real ao banco.
type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <T extends object>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const buildCompany = (overrides: Partial<Company> = {}): Company => ({
  id: 1,
  name: 'Acme Corp',
  website: 'https://acme.com',
  countryId: 1,
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

const buildCountry = (overrides: Partial<Country> = {}): Country => ({
  id: 1,
  name: 'Brasil',
  code: 'BR',
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('CompanyService', () => {
  let service: CompanyService;
  let companyRepository: MockRepository<Company>;
  let countryRepository: MockRepository<Country>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: getRepositoryToken(Company),
          useValue: createMockRepository<Company>(),
        },
        {
          provide: getRepositoryToken(Country),
          useValue: createMockRepository<Country>(),
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    companyRepository = module.get(getRepositoryToken(Company));
    countryRepository = module.get(getRepositoryToken(Country));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('valida o país, cria e persiste, retornando o registro salvo', async () => {
      const dto: CreateCompanyDto = {
        name: 'Acme Corp',
        website: 'https://acme.com',
        countryId: 1,
      };
      const entity = buildCompany();
      countryRepository.findOne!.mockResolvedValue(buildCountry());
      companyRepository.create!.mockReturnValue(entity);
      companyRepository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(countryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(companyRepository.create).toHaveBeenCalledWith(dto);
      expect(companyRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando o país (countryId) não existe', async () => {
      countryRepository.findOne!.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Acme',
          website: 'https://acme.com',
          countryId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(companyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retorna { count, rows } com a relação country e ordenado por nome', async () => {
      const rows = [buildCompany({ id: 1 }), buildCompany({ id: 2 })];
      companyRepository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll();

      expect(companyRepository.findAndCount).toHaveBeenCalledWith({
        relations: { country: true },
        order: { name: 'ASC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      companyRepository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('findOne', () => {
    it('retorna o registro (com country) quando encontrado', async () => {
      const entity = buildCompany();
      companyRepository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne(1);

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { country: true },
      });
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      companyRepository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('faz preload e salva sem validar país quando countryId não é enviado', async () => {
      const updated = buildCompany({ name: 'Acme 2' });
      companyRepository.preload!.mockResolvedValue(updated);
      companyRepository.save!.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Acme 2' });

      expect(countryRepository.findOne).not.toHaveBeenCalled();
      expect(companyRepository.preload).toHaveBeenCalledWith({
        id: 1,
        name: 'Acme 2',
      });
      expect(result).toEqual(updated);
    });

    it('valida o país quando countryId é enviado', async () => {
      const updated = buildCompany({ countryId: 2 });
      countryRepository.findOne!.mockResolvedValue(buildCountry({ id: 2 }));
      companyRepository.preload!.mockResolvedValue(updated);
      companyRepository.save!.mockResolvedValue(updated);

      const result = await service.update(1, { countryId: 2 });

      expect(countryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(result).toEqual(updated);
    });

    it('lança NotFoundException quando o país (countryId) enviado não existe', async () => {
      countryRepository.findOne!.mockResolvedValue(null);

      await expect(service.update(1, { countryId: 999 })).rejects.toThrow(
        NotFoundException,
      );
      expect(companyRepository.preload).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando o id da empresa não existe (preload null)', async () => {
      companyRepository.preload!.mockResolvedValue(undefined);

      await expect(service.update(999, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
      expect(companyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove quando o registro existe', async () => {
      companyRepository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(companyRepository.delete).toHaveBeenCalledWith(1);
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      companyRepository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
