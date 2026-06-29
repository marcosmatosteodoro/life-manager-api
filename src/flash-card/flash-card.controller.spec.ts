import { Test, TestingModule } from '@nestjs/testing';
import { FlashCard } from './entities/flash-card.entity';
import { FlashCardController } from './flash-card.controller';
import { FlashCardService } from './flash-card.service';

const buildCard = (overrides: Partial<FlashCard> = {}): FlashCard => ({
  id: 1,
  term: 'give up',
  value: 'desistir',
  translation: null,
  picture: null,
  correctAnswers: 0,
  wrongAnswers: 0,
  score: 0,
  lastReview: null,
  flashCardGroupId: 1,
  createdAt: new Date('2026-06-24T08:30:00.000Z'),
  updatedAt: new Date('2026-06-24T08:30:00.000Z'),
  creatorId: null,
  totalReviews: 0,
  ...overrides,
});

describe('FlashCardController', () => {
  let controller: FlashCardController;
  let service: jest.Mocked<FlashCardService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<FlashCardService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      review: jest.fn(),
      reviewBatch: jest.fn(),
      reviewBlock: jest.fn(),
      translate: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlashCardController],
      providers: [{ provide: FlashCardService, useValue: serviceMock }],
    }).compile();

    controller = module.get(FlashCardController);
    service = module.get(FlashCardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service', async () => {
    const created = buildCard();
    service.create.mockResolvedValue(created);
    const dto = { term: 'give up', flashCardGroupId: 1 };
    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll retorna { count, rows }', async () => {
    const payload = { count: 1, rows: [buildCard()] };
    service.findAll.mockResolvedValue(payload);
    await expect(controller.findAll()).resolves.toEqual(payload);
  });

  it('findOne repassa o id', async () => {
    const card = buildCard();
    service.findOne.mockResolvedValue(card);
    await expect(controller.findOne(1)).resolves.toEqual(card);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update repassa id e dto', async () => {
    const updated = buildCard({ term: 'novo' });
    service.update.mockResolvedValue(updated);
    await expect(controller.update(1, { term: 'novo' })).resolves.toEqual(
      updated,
    );
    expect(service.update).toHaveBeenCalledWith(1, { term: 'novo' });
  });

  it('review repassa id e o boolean correctAnswers', async () => {
    const card = buildCard({ correctAnswers: 1, score: 1 });
    service.review.mockResolvedValue(card);
    await expect(
      controller.review(1, { correctAnswers: true }),
    ).resolves.toEqual(card);
    expect(service.review).toHaveBeenCalledWith(1, true);
  });

  it('reviewBatch repassa o array', async () => {
    const cards = [buildCard()];
    service.reviewBatch.mockResolvedValue(cards);
    const items = [{ id: 1, correctAnswers: true }];
    await expect(controller.reviewBatch(items)).resolves.toEqual(cards);
    expect(service.reviewBatch).toHaveBeenCalledWith(items);
  });

  it('reviewBlock repassa o array', async () => {
    const cards = [buildCard()];
    service.reviewBlock.mockResolvedValue(cards);
    const items = [{ id: 1, correctAnswers: 1, wrongAnswers: 2 }];
    await expect(controller.reviewBlock(items)).resolves.toEqual(cards);
    expect(service.reviewBlock).toHaveBeenCalledWith(items);
  });

  it('translate repassa o id', async () => {
    const card = buildCard({ translation: 'desistir' });
    service.translate.mockResolvedValue(card);
    await expect(controller.translate(1)).resolves.toEqual(card);
    expect(service.translate).toHaveBeenCalledWith(1);
  });

  it('remove repassa o id', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
