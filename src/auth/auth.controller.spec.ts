import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const service = { login: jest.fn(), changePassword: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();
    controller = module.get(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  it('delega o login para o service', async () => {
    service.login.mockResolvedValue({
      accessToken: 'tok',
      mustChangePassword: false,
    });

    await expect(
      controller.login({ username: 'u', password: 'p' }),
    ).resolves.toEqual({ accessToken: 'tok', mustChangePassword: false });
    expect(service.login).toHaveBeenCalledWith({
      username: 'u',
      password: 'p',
    });
  });

  it('change-password repassa o userId do token e o dto', async () => {
    service.changePassword.mockResolvedValue(undefined);
    const dto = { currentPassword: 'a', newPassword: 'novasenha8' };

    await expect(controller.changePassword(7, dto)).resolves.toBeUndefined();
    expect(service.changePassword).toHaveBeenCalledWith(7, dto);
  });
});
