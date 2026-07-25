import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dog } from '../dog/entities/dog.entity';
import { DogWalkLocation } from '../dog-walk-location/entities/dog-walk-location.entity';
import { DogWalk } from './entities/dog-walk.entity';
import { DogWalkService } from './dog-walk.service';

const DTO = {
  dogIds: [1, 2],
  locationId: 5,
  startedAt: '2026-07-22T08:00:00.000Z',
  endedAt: '2026-07-22T08:30:00.000Z',
  durationSeconds: 1800,
};

describe('DogWalkService', () => {
  let service: DogWalkService;
  let repo: { create: jest.Mock; save: jest.Mock; findOne: jest.Mock };
  let dogRepo: { findBy: jest.Mock };
  let locationRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve({ id: 10, ...e })),
      findOne: jest.fn(),
    };
    dogRepo = { findBy: jest.fn() };
    locationRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DogWalkService,
        { provide: getRepositoryToken(DogWalk), useValue: repo },
        { provide: getRepositoryToken(Dog), useValue: dogRepo },
        {
          provide: getRepositoryToken(DogWalkLocation),
          useValue: locationRepo,
        },
      ],
    }).compile();
    service = module.get(DogWalkService);
  });

  afterEach(() => jest.clearAllMocks());

  it('cria o passeio SEM dono (recurso compartilhado) e cães resolvidos', async () => {
    locationRepo.findOne.mockResolvedValue({ id: 5 });
    dogRepo.findBy.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    repo.findOne.mockResolvedValue({ id: 10 });

    await service.create(DTO);

    // Compartilhado: creatorId sempre null.
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        locationId: 5,
        durationSeconds: 1800,
        creatorId: null,
        dogs: [{ id: 1 }, { id: 2 }],
      }),
    );
    expect(repo.save).toHaveBeenCalled();
  });

  it('lança NotFound quando o local não existe', async () => {
    locationRepo.findOne.mockResolvedValue(null);
    await expect(service.create(DTO)).rejects.toThrow(NotFoundException);
  });

  it('lança NotFound quando algum cão não existe', async () => {
    locationRepo.findOne.mockResolvedValue({ id: 5 });
    dogRepo.findBy.mockResolvedValue([{ id: 1 }]); // faltou o 2
    await expect(service.create(DTO)).rejects.toThrow(NotFoundException);
  });
});
