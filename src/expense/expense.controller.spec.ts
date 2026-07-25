import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    summary: jest.fn(),
    analyze: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getAudio: jest.fn(),
    setAudio: jest.fn(),
    removeAudio: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [{ provide: ExpenseService, useValue: service }],
    }).compile();
    controller = module.get(ExpenseController);
  });

  afterEach(() => jest.clearAllMocks());

  it('create delega para o service', async () => {
    const dto = { title: 'x', value: 10, type: 'debito' as const, date: '2026-07-25' };
    service.create.mockResolvedValue({ id: 1 });
    await expect(controller.create(dto)).resolves.toEqual({ id: 1 });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('summary delega para o service', async () => {
    service.summary.mockResolvedValue({ month: '2026-07' });
    await controller.summary();
    expect(service.summary).toHaveBeenCalledTimes(1);
  });

  it('analyze repassa o período', async () => {
    const dto = { from: '2026-07-01', to: '2026-07-31' };
    service.analyze.mockResolvedValue({ analysis: '<p>x</p>' });
    await controller.analyze(dto);
    expect(service.analyze).toHaveBeenCalledWith(dto);
  });

  it('rotas por id repassam o id/dto', async () => {
    await controller.findOne(3);
    expect(service.findOne).toHaveBeenCalledWith(3);
    await controller.update(3, { title: 'y' });
    expect(service.update).toHaveBeenCalledWith(3, { title: 'y' });
    await controller.remove(3);
    expect(service.remove).toHaveBeenCalledWith(3);
  });

  it('áudio repassa id/dto', async () => {
    await controller.getAudio(3);
    expect(service.getAudio).toHaveBeenCalledWith(3);
    const dto = { data: 'AAA', mimeType: 'audio/webm' };
    await controller.setAudio(3, dto);
    expect(service.setAudio).toHaveBeenCalledWith(3, dto);
    await controller.removeAudio(3);
    expect(service.removeAudio).toHaveBeenCalledWith(3);
  });
});
