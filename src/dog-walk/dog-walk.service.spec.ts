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
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    findAndCount: jest.Mock;
  };
  let dogRepo: { findBy: jest.Mock; find: jest.Mock };
  let locationRepo: { findOne: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((d) => d),
      save: jest.fn((e) => Promise.resolve({ id: 10, ...e })),
      findOne: jest.fn(),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    dogRepo = { findBy: jest.fn(), find: jest.fn().mockResolvedValue([]) };
    locationRepo = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };

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

  it('page agrega passeios + cães + locais numa resposta', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 10 }], 1]);
    dogRepo.find.mockResolvedValue([{ id: 1, name: 'Rex' }]);
    locationRepo.find.mockResolvedValue([{ id: 5, title: 'Parque' }]);

    const result = await service.page();

    expect(result.walks).toEqual([{ id: 10 }]);
    expect(result.dogs).toEqual([{ id: 1, name: 'Rex' }]);
    expect(result.locations).toEqual([{ id: 5, title: 'Parque' }]);
    expect(dogRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    expect(locationRepo.find).toHaveBeenCalledWith({ order: { title: 'ASC' } });
  });

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
