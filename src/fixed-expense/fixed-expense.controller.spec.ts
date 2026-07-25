import { Test, TestingModule } from '@nestjs/testing';
import { FixedExpenseController } from './fixed-expense.controller';
import { FixedExpenseService } from './fixed-expense.service';

describe('FixedExpenseController', () => {
  let controller: FixedExpenseController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FixedExpenseController],
      providers: [{ provide: FixedExpenseService, useValue: service }],
    }).compile();

    controller = module.get(FixedExpenseController);
  });

  it('create delega ao service', () => {
    const dto = { name: 'Luz', value: 189.9, paymentDay: 10 };
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
    controller.update(1, { value: 200 });
    expect(service.update).toHaveBeenCalledWith(1, { value: 200 });
  });

  it('remove delega ao service', () => {
    controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
