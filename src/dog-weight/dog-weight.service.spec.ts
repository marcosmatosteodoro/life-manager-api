import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dog } from '../dog/entities/dog.entity';
import { DogWeight } from './entities/dog-weight.entity';
import { DogWeightService } from './dog-weight.service';

describe('DogWeightService', () => {
  let service: DogWeightService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    preload: jest.Mock;
    delete: jest.Mock;
  };
  let dogRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve(e)),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };
    dogRepo = { findOne: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DogWeightService,
        { provide: getRepositoryToken(DogWeight), useValue: repo },
        { provide: getRepositoryToken(Dog), useValue: dogRepo },
      ],
    }).compile();
    service = module.get(DogWeightService);
  });

  afterEach(() => jest.clearAllMocks());

  it('cria quando o cão existe', async () => {
    dogRepo.findOne.mockResolvedValue({ id: 1 });
    const dto = { dogId: 1, value: 4.35, date: '2026-07-22' };
    await expect(service.create(dto)).resolves.toEqual(dto);
  });

  it('lança NotFound quando o cão não existe', async () => {
    dogRepo.findOne.mockResolvedValue(null);
    await expect(
      service.create({ dogId: 9, value: 4, date: '2026-07-22' }),
    ).rejects.toThrow(NotFoundException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('findAll filtra por dogId quando informado', async () => {
    repo.findAndCount.mockResolvedValue([[], 0]);
    await service.findAll(3);
    expect(repo.findAndCount).toHaveBeenCalledWith({
      where: { dogId: 3 },
      order: { date: 'DESC', id: 'DESC' },
    });
  });
});
