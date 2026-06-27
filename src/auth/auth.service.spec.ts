import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const config = { get: jest.fn() };
  const jwt = { signAsync: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: config },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  const withCreds = () => {
    config.get.mockImplementation((key: string) =>
      key === 'AUTH_USERNAME'
        ? 'user'
        : key === 'AUTH_PASSWORD'
          ? 'pass'
          : undefined,
    );
  };

  it('retorna accessToken com credenciais válidas', async () => {
    withCreds();
    jwt.signAsync.mockResolvedValue('token123');

    await expect(
      service.login({ username: 'user', password: 'pass' }),
    ).resolves.toEqual({ accessToken: 'token123' });
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'user' });
  });

  it('lança Unauthorized com senha errada (sem assinar token)', async () => {
    withCreds();

    await expect(
      service.login({ username: 'user', password: 'errada' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('lança Unauthorized com usuário errado', async () => {
    withCreds();

    await expect(
      service.login({ username: 'outro', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lança Unauthorized quando não há credenciais configuradas', async () => {
    config.get.mockReturnValue(undefined);

    await expect(
      service.login({ username: 'user', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
