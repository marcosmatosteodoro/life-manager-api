import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dog } from './entities/dog.entity';
import { DogService } from './dog.service';

describe('DogService', () => {
  let service: DogService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    preload: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve(e)),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DogService,
        { provide: getRepositoryToken(Dog), useValue: repo },
      ],
    }).compile();
    service = module.get(DogService);
  });

  afterEach(() => jest.clearAllMocks());

  it('cria e persiste', async () => {
    const dto = { name: 'Puffy', breed: 'Poodle', sex: 'femea' as const };
    await expect(service.create(dto)).resolves.toEqual(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  it('lista { count, rows } ordenado por nome', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 1 }], 1]);
    const result = await service.findAll();
    expect(repo.findAndCount).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    expect(result).toEqual({ count: 1, rows: [{ id: 1 }] });
  });

  it('findOne lança NotFound quando não existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(9)).rejects.toThrow(NotFoundException);
  });

  it('update lança NotFound quando preload é vazio', async () => {
    repo.preload.mockResolvedValue(undefined);
    await expect(service.update(9, { name: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove lança NotFound quando nada afetado', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(9)).rejects.toThrow(NotFoundException);
  });
});
