import { Test, TestingModule } from '@nestjs/testing';
import { FlashCardGroupController } from './flash-card-group.controller';
import { FlashCardGroupService } from './flash-card-group.service';
import { FlashCardGroup } from './entities/flash-card-group.entity';

const USER_ID = 1;

const buildGroup = (
  overrides: Partial<FlashCardGroup> = {},
): FlashCardGroup => ({
  id: 1,
  name: 'Phrasal Verbs',
  type: 'text',
  createdAt: new Date('2026-06-24T08:30:00.000Z'),
  updatedAt: new Date('2026-06-24T08:30:00.000Z'),
  creatorId: null,
  flashCards: [],
  flashCardsCount: 0,
  ...overrides,
});

describe('FlashCardGroupController', () => {
  let controller: FlashCardGroupController;
  let service: jest.Mocked<FlashCardGroupService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<FlashCardGroupService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      review: jest.fn(),
      reviewBlock: jest.fn(),
      reviewQuiz: jest.fn(),
      absorb: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlashCardGroupController],
      providers: [{ provide: FlashCardGroupService, useValue: serviceMock }],
    }).compile();

    controller = module.get(FlashCardGroupController);
    service = module.get(FlashCardGroupService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service', async () => {
    const created = buildGroup();
    service.create.mockResolvedValue(created);
    await expect(
      controller.create({ name: 'Phrasal Verbs' }, USER_ID),
    ).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(
      { name: 'Phrasal Verbs' },
      USER_ID,
    );
  });

  it('findAll retorna { count, rows }', async () => {
    const payload = { count: 1, rows: [buildGroup()] };
    service.findAll.mockResolvedValue(payload);
    await expect(controller.findAll(USER_ID)).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledWith(USER_ID);
  });

  it('findOne repassa o id', async () => {
    const group = buildGroup();
    service.findOne.mockResolvedValue(group);
    await expect(controller.findOne(1, USER_ID)).resolves.toEqual(group);
    expect(service.findOne).toHaveBeenCalledWith(1, USER_ID);
  });

  it('update repassa id e dto', async () => {
    const updated = buildGroup({ name: 'Novo' });
    service.update.mockResolvedValue(updated);
    await expect(
      controller.update(1, { name: 'Novo' }, USER_ID),
    ).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, { name: 'Novo' }, USER_ID);
  });

  it('remove repassa o id', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove(1, USER_ID)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1, USER_ID);
  });

  it('review repassa o id para o service', async () => {
    service.review.mockResolvedValue([]);
    await expect(controller.review(1, USER_ID)).resolves.toEqual([]);
    expect(service.review).toHaveBeenCalledWith(1, USER_ID);
  });

  it('reviewBlock repassa o id para o service', async () => {
    service.reviewBlock.mockResolvedValue([]);
    await expect(controller.reviewBlock(1, USER_ID)).resolves.toEqual([]);
    expect(service.reviewBlock).toHaveBeenCalledWith(1, USER_ID);
  });

  it('reviewQuiz repassa o id para o service', async () => {
    service.reviewQuiz.mockResolvedValue([]);
    await expect(controller.reviewQuiz(1, USER_ID)).resolves.toEqual([]);
    expect(service.reviewQuiz).toHaveBeenCalledWith(1, USER_ID);
  });

  it('absorb repassa o id do destino e o sourceId', async () => {
    const merged = buildGroup();
    service.absorb.mockResolvedValue(merged);
    await expect(
      controller.absorb(1, { sourceId: 2 }, USER_ID),
    ).resolves.toEqual(merged);
    expect(service.absorb).toHaveBeenCalledWith(1, 2, USER_ID);
  });
});
