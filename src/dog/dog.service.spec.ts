import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

// Mock do storage de Blob (não sobe nada de verdade nos testes).
jest.mock('../common/photo-blob.storage', () => ({
  putProfilePhoto: jest
    .fn()
    .mockResolvedValue({ pathname: 'dogs/1/p.jpg', url: 'https://blob/x' }),
  readProfilePhotoBase64: jest.fn().mockResolvedValue('BASE64'),
  delProfilePhoto: jest.fn().mockResolvedValue(undefined),
}));
import { DogPhoto } from './entities/dog-photo.entity';
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
  let photoRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn((d: Partial<Dog>) => d),
      save: jest.fn((e) => Promise.resolve(e)),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };
    photoRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn((d: Partial<DogPhoto>) => d),
      save: jest.fn((e) => Promise.resolve({ id: 5, ...e })),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DogService,
        { provide: getRepositoryToken(Dog), useValue: repo },
        { provide: getRepositoryToken(DogPhoto), useValue: photoRepo },
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

  it('lista { count, rows } ordenado por nome e marca hasPhoto', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 1 }, { id: 2 }], 2]);
    photoRepo.find.mockResolvedValue([{ dogId: 2 }]);
    const result = await service.findAll();
    expect(repo.findAndCount).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    expect(result.rows.find((r) => r.id === 1)?.hasPhoto).toBe(false);
    expect(result.rows.find((r) => r.id === 2)?.hasPhoto).toBe(true);
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

  describe('foto de perfil', () => {
    it('getPhoto lança NotFound quando não há', async () => {
      photoRepo.findOne.mockResolvedValue(null);
      await expect(service.getPhoto(1)).rejects.toThrow(NotFoundException);
    });

    it('setPhoto cria a referência quando não existe', async () => {
      repo.findOne.mockResolvedValue({ id: 1 });
      photoRepo.findOne.mockResolvedValue(null);
      const result = await service.setPhoto(1, {
        data: 'BASE64',
        mimeType: 'image/jpeg',
      });
      expect(photoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dogId: 1,
          pathname: 'dogs/1/p.jpg',
          url: 'https://blob/x',
          mimeType: 'image/jpeg',
        }),
      );
      expect(result).toEqual({ data: 'BASE64', mimeType: 'image/jpeg' });
    });

    it('removePhoto lança NotFound quando não há foto', async () => {
      photoRepo.findOne.mockResolvedValue(null);
      await expect(service.removePhoto(1)).rejects.toThrow(NotFoundException);
    });
  });
});
