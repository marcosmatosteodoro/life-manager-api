import { Test, TestingModule } from '@nestjs/testing';
import { DebtController } from './debt.controller';
import { DebtService } from './debt.service';

describe('DebtController', () => {
  let controller: DebtController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    addPayment: jest.Mock;
    removePayment: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addPayment: jest.fn(),
      removePayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebtController],
      providers: [{ provide: DebtService, useValue: service }],
    }).compile();

    controller = module.get(DebtController);
  });

  it('create delega ao service', () => {
    const dto = { name: 'Cartão', totalAmount: 1000 };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll delega ao service', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne delega ao service', () => {
    controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update delega ao service', () => {
    controller.update(1, { name: 'Novo' });
    expect(service.update).toHaveBeenCalledWith(1, { name: 'Novo' });
  });

  it('remove delega ao service', () => {
    controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('addPayment delega ao service', () => {
    const dto = { value: 300, date: '2026-07-25' };
    controller.addPayment(1, dto);
    expect(service.addPayment).toHaveBeenCalledWith(1, dto);
  });

  it('removePayment delega ao service', () => {
    controller.removePayment(1, 10);
    expect(service.removePayment).toHaveBeenCalledWith(1, 10);
  });
});
