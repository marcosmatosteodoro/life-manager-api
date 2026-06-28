import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { ApplyService } from './apply.service';
import { CreateApplyDto } from './dto/create-apply.dto';
import { Apply } from './entities/apply.entity';
import { ApplyStatus } from './enums/apply-status.enum';

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

const buildApply = (overrides: Partial<Apply> = {}): Apply => ({
  id: 1,
  name: 'Vaga Backend Node - Acme',
  link: 'https://acme.com/vagas/123',
  date: '2026-06-22',
  status: ApplyStatus.APPLIED,
  description: null,
  companyId: 1,
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

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

describe('ApplyService', () => {
  let service: ApplyService;
  let applyRepository: MockRepository<Apply>;
  let companyRepository: MockRepository<Company>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplyService,
        {
          provide: getRepositoryToken(Apply),
          useValue: createMockRepository<Apply>(),
        },
        {
          provide: getRepositoryToken(Company),
          useValue: createMockRepository<Company>(),
        },
      ],
    }).compile();

    service = module.get<ApplyService>(ApplyService);
    applyRepository = module.get(getRepositoryToken(Apply));
    companyRepository = module.get(getRepositoryToken(Company));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('valida a empresa, cria e persiste, retornando o registro salvo', async () => {
      const dto: CreateApplyDto = {
        name: 'Vaga Backend Node - Acme',
        date: '2026-06-22',
        status: ApplyStatus.APPLIED,
        companyId: 1,
      };
      const entity = buildApply({ link: null });
      companyRepository.findOne!.mockResolvedValue(buildCompany());
      applyRepository.create!.mockReturnValue(entity);
      applyRepository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(applyRepository.create).toHaveBeenCalledWith(dto);
      expect(applyRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando a empresa (companyId) não existe', async () => {
      companyRepository.findOne!.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'X',
          date: '2026-06-22',
          status: ApplyStatus.APPLIED,
          companyId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(applyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retorna { count, rows } com a relação company e ordenado por data desc', async () => {
      const rows = [buildApply({ id: 1 }), buildApply({ id: 2 })];
      applyRepository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll();

      expect(applyRepository.findAndCount).toHaveBeenCalledWith({
        relations: { company: true },
        order: { date: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      applyRepository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('findOne', () => {
    it('retorna o registro (com company) quando encontrado', async () => {
      const entity = buildApply();
      applyRepository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne(1);

      expect(applyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { company: true },
      });
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      applyRepository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('faz preload e salva sem validar empresa quando companyId não é enviado', async () => {
      const updated = buildApply({ status: ApplyStatus.INTERVIEW_SCHEDULED });
      applyRepository.preload!.mockResolvedValue(updated);
      applyRepository.save!.mockResolvedValue(updated);

      const result = await service.update(1, {
        status: ApplyStatus.INTERVIEW_SCHEDULED,
      });

      expect(companyRepository.findOne).not.toHaveBeenCalled();
      expect(applyRepository.preload).toHaveBeenCalledWith({
        id: 1,
        status: ApplyStatus.INTERVIEW_SCHEDULED,
      });
      expect(result).toEqual(updated);
    });

    it('valida a empresa quando companyId é enviado', async () => {
      const updated = buildApply({ companyId: 2 });
      companyRepository.findOne!.mockResolvedValue(buildCompany({ id: 2 }));
      applyRepository.preload!.mockResolvedValue(updated);
      applyRepository.save!.mockResolvedValue(updated);

      const result = await service.update(1, { companyId: 2 });

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(result).toEqual(updated);
    });

    it('lança NotFoundException quando a empresa (companyId) enviada não existe', async () => {
      companyRepository.findOne!.mockResolvedValue(null);

      await expect(service.update(1, { companyId: 999 })).rejects.toThrow(
        NotFoundException,
      );
      expect(applyRepository.preload).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando o id da candidatura não existe (preload null)', async () => {
      applyRepository.preload!.mockResolvedValue(undefined);

      await expect(
        service.update(999, { status: ApplyStatus.APPROVED }),
      ).rejects.toThrow(NotFoundException);
      expect(applyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove quando o registro existe', async () => {
      applyRepository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(applyRepository.delete).toHaveBeenCalledWith(1);
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      applyRepository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
