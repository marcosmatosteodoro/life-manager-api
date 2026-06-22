import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplyService } from './apply.service';
import { CreateApplyDto } from './dto/create-apply.dto';
import { Apply } from './entities/apply.entity';
import { ApplyStatus } from './enums/apply-status.enum';

// Mock tipado do Repository — nenhuma chamada real ao banco.
type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = (): MockRepository<Apply> => ({
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
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('ApplyService', () => {
  let service: ApplyService;
  let repository: MockRepository<Apply>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplyService,
        {
          provide: getRepositoryToken(Apply),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ApplyService>(ApplyService);
    repository = module.get<MockRepository<Apply>>(getRepositoryToken(Apply));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria a entidade e persiste, retornando o registro salvo', async () => {
      const dto: CreateApplyDto = {
        name: 'Vaga Backend Node - Acme',
        date: '2026-06-22',
        status: ApplyStatus.APPLIED,
      };
      const entity = buildApply({ link: null });
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findAll', () => {
    it('retorna no formato { count, rows } ordenado por data desc', async () => {
      const rows = [buildApply({ id: 1 }), buildApply({ id: 2 })];
      repository.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        order: { date: 'DESC' },
      });
      expect(result).toEqual({ count: 2, rows });
    });

    it('retorna count 0 e rows vazio quando não há registros', async () => {
      repository.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result).toEqual({ count: 0, rows: [] });
    });
  });

  describe('findOne', () => {
    it('retorna o registro quando encontrado', async () => {
      const entity = buildApply();
      repository.findOne!.mockResolvedValue(entity);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(entity);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('faz preload e salva o registro atualizado (mudança de status)', async () => {
      const updated = buildApply({ status: ApplyStatus.INTERVIEW_SCHEDULED });
      repository.preload!.mockResolvedValue(updated);
      repository.save!.mockResolvedValue(updated);

      const result = await service.update(1, {
        status: ApplyStatus.INTERVIEW_SCHEDULED,
      });

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        status: ApplyStatus.INTERVIEW_SCHEDULED,
      });
      expect(repository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('lança NotFoundException quando o id não existe (preload null)', async () => {
      repository.preload!.mockResolvedValue(undefined);

      await expect(
        service.update(999, { status: ApplyStatus.APPROVED }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove quando o registro existe', async () => {
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      repository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
