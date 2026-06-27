import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const service = { login: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();
    controller = module.get(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  it('delega o login para o service', async () => {
    service.login.mockResolvedValue({ accessToken: 'tok' });

    await expect(
      controller.login({ username: 'u', password: 'p' }),
    ).resolves.toEqual({ accessToken: 'tok' });
    expect(service.login).toHaveBeenCalledWith({ username: 'u', password: 'p' });
  });
});
