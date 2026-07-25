import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Mock do storage de Blob (não sobe nada de verdade nos testes).
jest.mock('../common/photo-blob.storage', () => ({
  putProfilePhoto: jest
    .fn()
    .mockResolvedValue({ pathname: 'users/1/p.jpg', url: 'https://blob/x' }),
  readProfilePhotoBase64: jest.fn().mockResolvedValue('BASE64'),
  delProfilePhoto: jest.fn().mockResolvedValue(undefined),
}));
import { UserPhoto } from './entities/user-photo.entity';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

type MockRepository = Partial<Record<keyof Repository<User>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
});

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  passwordHash: 'salt:hash',
  name: 'Admin',
  heightCm: 177,
  theme: 'light',
  language: 'en-US',
  customColors: null,
  mustChangePassword: false,
  createdAt: new Date('2026-06-30T08:00:00.000Z'),
  updatedAt: new Date('2026-06-30T08:00:00.000Z'),
  ...overrides,
});

describe('UserService', () => {
  let service: UserService;
  let repository: MockRepository;
  let photoRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        {
          provide: getRepositoryToken(UserPhoto),
          useValue: createMockRepository(),
        },
      ],
    }).compile();
    service = module.get(UserService);
    repository = module.get(getRepositoryToken(User));
    photoRepository = module.get(getRepositoryToken(UserPhoto));
  });

  afterEach(() => jest.clearAllMocks());

  describe('getMe', () => {
    it('retorna o perfil SEM passwordHash', async () => {
      repository.findOne!.mockResolvedValue(buildUser());

      const result = await service.getMe(1);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toMatchObject({
        id: 1,
        username: 'admin',
        theme: 'light',
      });
    });

    it('lança NotFound quando o usuário não existe', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.getMe(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    it('atualiza campos do perfil e devolve sem hash', async () => {
      const user = buildUser();
      repository.findOne!.mockResolvedValue(user);
      repository.save!.mockImplementation((u) => Promise.resolve(u));

      const result = await service.updateMe(1, { name: 'Novo', heightCm: 180 });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toMatchObject({ name: 'Novo', heightCm: 180 });
    });

    it('grava customColors do tema custom', async () => {
      const user = buildUser();
      repository.findOne!.mockResolvedValue(user);
      repository.save!.mockImplementation((u) => Promise.resolve(u));

      const customColors = { fg: '#111111', surface: '#fafafa' };
      const result = await service.updateMe(1, {
        theme: 'custom',
        customColors,
      });

      expect(result).toMatchObject({ theme: 'custom', customColors });
    });

    it('bloqueia username já usado por outro usuário', async () => {
      repository
        .findOne!.mockResolvedValueOnce(buildUser()) // findByIdOrThrow
        .mockResolvedValueOnce(buildUser({ id: 2 })); // ensureUnique acha outro

      await expect(service.updateMe(1, { username: 'tomado' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('setPassword', () => {
    it('grava o hash e zera mustChangePassword', async () => {
      const user = buildUser({ mustChangePassword: true });
      repository.findOne!.mockResolvedValue(user);
      repository.save!.mockResolvedValue(user);

      await service.setPassword(1, 'novo:hash');

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: 'novo:hash',
          mustChangePassword: false,
        }),
      );
    });
  });

  describe('foto de perfil', () => {
    it('getMe reflete hasPhoto quando existe foto', async () => {
      repository.findOne!.mockResolvedValue(buildUser());
      photoRepository.count!.mockResolvedValue(1);
      const result = await service.getMe(1);
      expect(result.hasPhoto).toBe(true);
    });

    it('getPhoto lança NotFound quando não há', async () => {
      photoRepository.findOne!.mockResolvedValue(null);
      await expect(service.getPhoto(1)).rejects.toThrow(NotFoundException);
    });

    it('setPhoto cria a referência quando não existe', async () => {
      repository.findOne!.mockResolvedValue(buildUser());
      photoRepository.findOne!.mockResolvedValue(null);
      const result = await service.setPhoto(1, {
        data: 'BASE64',
        mimeType: 'image/jpeg',
      });
      expect(photoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          pathname: 'users/1/p.jpg',
          url: 'https://blob/x',
          mimeType: 'image/jpeg',
        }),
      );
      expect(result).toEqual({ data: 'BASE64', mimeType: 'image/jpeg' });
    });

    it('removePhoto lança NotFound quando não há foto', async () => {
      photoRepository.findOne!.mockResolvedValue(null);
      await expect(service.removePhoto(1)).rejects.toThrow(NotFoundException);
    });
  });
});
