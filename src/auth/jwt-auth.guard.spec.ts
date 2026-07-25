import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { EXTENSION_ALLOWED_KEY } from './extension.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

const makeContext = (headers: Record<string, string>): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwt: { verifyAsync: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    jwt = { verifyAsync: jest.fn() };
    reflector = { getAllAndOverride: jest.fn() };
    guard = new JwtAuthGuard(
      jwt as unknown as JwtService,
      reflector as unknown as Reflector,
    );
  });

  it('libera rota pública sem exigir token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(makeContext({}))).resolves.toBe(true);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  it('aceita um token Bearer válido', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verifyAsync.mockResolvedValue({ sub: 'user' });

    await expect(
      guard.canActivate(makeContext({ authorization: 'Bearer abc' })),
    ).resolves.toBe(true);
    expect(jwt.verifyAsync).toHaveBeenCalledWith('abc');
  });

  it('bloqueia quando o token está ausente', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(makeContext({}))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('bloqueia token inválido ou expirado', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwt.verifyAsync.mockRejectedValue(new Error('bad'));

    await expect(
      guard.canActivate(makeContext({ authorization: 'Bearer ruim' })),
    ).rejects.toThrow(UnauthorizedException);
  });

  describe('token fixo da extensão', () => {
    afterEach(() => {
      delete process.env.EXTENSION_API_TOKEN;
    });

    it('aceita o token fixo numa rota @ExtensionAllowed() (sem checar JWT)', async () => {
      process.env.EXTENSION_API_TOKEN = 'ext-secret';
      // não é público; é permitido para a extensão.
      reflector.getAllAndOverride.mockImplementation(
        (key: string) => key === EXTENSION_ALLOWED_KEY,
      );

      await expect(
        guard.canActivate(makeContext({ authorization: 'Bearer ext-secret' })),
      ).resolves.toBe(true);
      expect(jwt.verifyAsync).not.toHaveBeenCalled();
    });

    it('nega o token fixo fora das rotas permitidas (403)', async () => {
      process.env.EXTENSION_API_TOKEN = 'ext-secret';
      reflector.getAllAndOverride.mockReturnValue(false); // nem público nem permitido

      await expect(
        guard.canActivate(makeContext({ authorization: 'Bearer ext-secret' })),
      ).rejects.toThrow(ForbiddenException);
      expect(jwt.verifyAsync).not.toHaveBeenCalled();
    });

    it('token diferente do fixo cai no fluxo normal de JWT', async () => {
      process.env.EXTENSION_API_TOKEN = 'ext-secret';
      reflector.getAllAndOverride.mockReturnValue(false);
      jwt.verifyAsync.mockResolvedValue({ sub: 'user' });

      await expect(
        guard.canActivate(makeContext({ authorization: 'Bearer outro' })),
      ).resolves.toBe(true);
      expect(jwt.verifyAsync).toHaveBeenCalledWith('outro');
    });
  });
});
