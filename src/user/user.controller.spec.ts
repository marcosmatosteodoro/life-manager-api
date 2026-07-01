import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  const service = { getMe: jest.fn(), updateMe: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: service }],
    }).compile();
    controller = module.get(UserController);
  });

  afterEach(() => jest.clearAllMocks());

  it('getMe repassa o userId do token', async () => {
    service.getMe.mockResolvedValue({ id: 7 });
    await expect(controller.getMe(7)).resolves.toEqual({ id: 7 });
    expect(service.getMe).toHaveBeenCalledWith(7);
  });

  it('updateMe repassa userId e dto', async () => {
    const dto = { name: 'Novo' };
    service.updateMe.mockResolvedValue({ id: 7, name: 'Novo' });
    await expect(controller.updateMe(7, dto)).resolves.toEqual({
      id: 7,
      name: 'Novo',
    });
    expect(service.updateMe).toHaveBeenCalledWith(7, dto);
  });
});
