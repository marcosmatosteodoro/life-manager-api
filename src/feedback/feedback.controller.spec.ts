import { Test, TestingModule } from '@nestjs/testing';
import { Feedback } from './entities/feedback.entity';
import { FeedbackPeriod } from './enums/feedback-period.enum';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

const USER_ID = 1;

const buildFeedback = (overrides: Partial<Feedback> = {}): Feedback => ({
  id: 1,
  period: FeedbackPeriod.THIRTY_DAYS,
  periodStart: '2026-05-28',
  periodEnd: '2026-06-27',
  inputData: '{}',
  prompt: 'system\n\nuser',
  response: '<h3>Feedback</h3>',
  createdAt: new Date('2026-06-27T08:30:00.000Z'),
  updatedAt: new Date('2026-06-27T08:30:00.000Z'),
  creatorId: USER_ID,
  ...overrides,
});

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: jest.Mocked<FeedbackService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<FeedbackService>> = {
      generate: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [{ provide: FeedbackService, useValue: serviceMock }],
    }).compile();

    controller = module.get(FeedbackController);
    service = module.get(FeedbackService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('generate delega o dto para o service', async () => {
    const created = buildFeedback();
    service.generate.mockResolvedValue(created);

    await expect(
      controller.generate({ period: FeedbackPeriod.THIRTY_DAYS }, USER_ID),
    ).resolves.toEqual(created);
    expect(service.generate).toHaveBeenCalledWith(
      {
        period: FeedbackPeriod.THIRTY_DAYS,
      },
      USER_ID,
    );
  });

  it('findAll retorna { count, rows }', async () => {
    const payload = { count: 1, rows: [buildFeedback()] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll(USER_ID)).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledWith(USER_ID);
  });

  it('findOne repassa o id', async () => {
    const entity = buildFeedback();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1, USER_ID)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1, USER_ID);
  });
});
