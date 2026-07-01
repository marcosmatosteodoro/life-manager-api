import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { hashPassword } from './password.util';

describe('AuthService', () => {
  let service: AuthService;
  const jwt = { signAsync: jest.fn() };
  const users = {
    findByUsername: jest.fn(),
    findByIdOrThrow: jest.fn(),
    setPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwt },
        { provide: UserService, useValue: users },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('retorna accessToken (sub=id) e mustChangePassword com credenciais válidas', async () => {
      const passwordHash = await hashPassword('senha-correta');
      users.findByUsername.mockResolvedValue({
        id: 7,
        username: 'admin',
        passwordHash,
        mustChangePassword: true,
      });
      jwt.signAsync.mockResolvedValue('token123');

      await expect(
        service.login({ username: 'admin', password: 'senha-correta' }),
      ).resolves.toEqual({ accessToken: 'token123', mustChangePassword: true });
      expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 7 });
    });

    it('lança Unauthorized com senha errada (sem assinar token)', async () => {
      const passwordHash = await hashPassword('senha-correta');
      users.findByUsername.mockResolvedValue({
        id: 7,
        passwordHash,
        mustChangePassword: false,
      });

      await expect(
        service.login({ username: 'admin', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('lança Unauthorized quando o usuário não existe', async () => {
      users.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nope', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('valida a senha atual e grava o novo hash', async () => {
      const passwordHash = await hashPassword('atual123');
      users.findByIdOrThrow.mockResolvedValue({ id: 7, passwordHash });

      await service.changePassword(7, {
        currentPassword: 'atual123',
        newPassword: 'nova-senha-8',
      });

      expect(users.setPassword).toHaveBeenCalledTimes(1);
      const [id, newHash] = users.setPassword.mock.calls[0] as [number, string];
      expect(id).toBe(7);
      expect(newHash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
      expect(newHash).not.toContain('nova-senha-8');
    });

    it('lança Unauthorized quando a senha atual está errada', async () => {
      const passwordHash = await hashPassword('atual123');
      users.findByIdOrThrow.mockResolvedValue({ id: 7, passwordHash });

      await expect(
        service.changePassword(7, {
          currentPassword: 'errada',
          newPassword: 'nova-senha-8',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(users.setPassword).not.toHaveBeenCalled();
    });
  });
});
