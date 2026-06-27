import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashCardGroup } from '../flash-card-group/entities/flash-card-group.entity';
import { FlashCard } from './entities/flash-card.entity';
import { FlashCardService } from './flash-card.service';

type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <T extends object>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const buildCard = (overrides: Partial<FlashCard> = {}): FlashCard => ({
  id: 1,
  term: 'give up',
  value: 'desistir',
  picture: null,
  correctAnswers: 0,
  wrongAnswers: 0,
  score: 0,
  lastReview: null,
  flashCardGroupId: 1,
  createdAt: new Date('2026-06-24T08:30:00.000Z'),
  updatedAt: new Date('2026-06-24T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('FlashCardService', () => {
  let service: FlashCardService;
  let cardRepo: MockRepository<FlashCard>;
  let groupRepo: MockRepository<FlashCardGroup>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashCardService,
        {
          provide: getRepositoryToken(FlashCard),
          useValue: createMockRepository<FlashCard>(),
        },
        {
          provide: getRepositoryToken(FlashCardGroup),
          useValue: createMockRepository<FlashCardGroup>(),
        },
      ],
    }).compile();

    service = module.get(FlashCardService);
    cardRepo = module.get(getRepositoryToken(FlashCard));
    groupRepo = module.get(getRepositoryToken(FlashCardGroup));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('valida o grupo, cria e anexa totalReviews', async () => {
      const entity = buildCard({ correctAnswers: 0, wrongAnswers: 0 });
      groupRepo.findOne!.mockResolvedValue({ id: 1 });
      cardRepo.create!.mockReturnValue(entity);
      cardRepo.save!.mockResolvedValue(entity);

      const result = await service.create({
        term: 'give up',
        flashCardGroupId: 1,
      });

      expect(groupRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result.totalReviews).toBe(0);
    });

    it('lança NotFoundException quando o grupo não existe', async () => {
      groupRepo.findOne!.mockResolvedValue(null);
      await expect(
        service.create({ term: 'x', flashCardGroupId: 999 }),
      ).rejects.toThrow(NotFoundException);
      expect(cardRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll / findOne', () => {
    it('findAll anexa totalReviews em cada card', async () => {
      const rows = [
        buildCard({ id: 1, correctAnswers: 2, wrongAnswers: 1 }),
        buildCard({ id: 2, correctAnswers: 0, wrongAnswers: 0 }),
      ];
      cardRepo.findAndCount!.mockResolvedValue([rows, 2]);

      const result = await service.findAll();

      expect(result.count).toBe(2);
      expect(result.rows[0].totalReviews).toBe(3);
      expect(result.rows[1].totalReviews).toBe(0);
    });

    it('findOne retorna o card com totalReviews', async () => {
      cardRepo.findOne!.mockResolvedValue(
        buildCard({ correctAnswers: 5, wrongAnswers: 2 }),
      );
      const result = await service.findOne(1);
      expect(result.totalReviews).toBe(7);
    });

    it('findOne lança NotFoundException quando não encontrado', async () => {
      cardRepo.findOne!.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('valida o grupo quando flashCardGroupId é enviado', async () => {
      const updated = buildCard({ flashCardGroupId: 2 });
      groupRepo.findOne!.mockResolvedValue({ id: 2 });
      cardRepo.preload!.mockResolvedValue(updated);
      cardRepo.save!.mockResolvedValue(updated);

      await service.update(1, { flashCardGroupId: 2 });

      expect(groupRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
    });

    it('não valida grupo quando não é enviado', async () => {
      const updated = buildCard({ term: 'novo termo' });
      cardRepo.preload!.mockResolvedValue(updated);
      cardRepo.save!.mockResolvedValue(updated);

      await service.update(1, { term: 'novo termo' });

      expect(groupRepo.findOne).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando o card não existe', async () => {
      cardRepo.preload!.mockResolvedValue(undefined);
      await expect(service.update(999, { term: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('review', () => {
    it('acerto: +1 correctAnswers, +1 score, seta lastReview', async () => {
      const card = buildCard({ correctAnswers: 2, wrongAnswers: 1, score: 1 });
      cardRepo.findOne!.mockResolvedValue(card);
      cardRepo.save!.mockImplementation((c) => Promise.resolve(c as FlashCard));

      const result = await service.review(1, true);

      expect(result.correctAnswers).toBe(3);
      expect(result.score).toBe(2);
      expect(result.wrongAnswers).toBe(1);
      expect(result.lastReview).not.toBeNull();
      expect(result.totalReviews).toBe(4);
    });

    it('erro: +1 wrongAnswers, -1 score (pode ficar negativo)', async () => {
      const card = buildCard({ correctAnswers: 0, wrongAnswers: 0, score: 0 });
      cardRepo.findOne!.mockResolvedValue(card);
      cardRepo.save!.mockImplementation((c) => Promise.resolve(c as FlashCard));

      const result = await service.review(1, false);

      expect(result.wrongAnswers).toBe(1);
      expect(result.score).toBe(-1);
      expect(result.totalReviews).toBe(1);
    });

    it('lança NotFoundException quando o card não existe', async () => {
      cardRepo.findOne!.mockResolvedValue(null);
      await expect(service.review(999, true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reviewBatch', () => {
    it('aplica o review em vários cards', async () => {
      const cards = [
        buildCard({ id: 1, correctAnswers: 0, score: 0 }),
        buildCard({ id: 2, wrongAnswers: 0, score: 0 }),
      ];
      cardRepo.find!.mockResolvedValue(cards);
      cardRepo.save!.mockImplementation((c) =>
        Promise.resolve(c as FlashCard[]),
      );

      const result = await service.reviewBatch([
        { id: 1, correctAnswers: true },
        { id: 2, correctAnswers: false },
      ]);

      expect(result[0].correctAnswers).toBe(1);
      expect(result[0].score).toBe(1);
      expect(result[1].wrongAnswers).toBe(1);
      expect(result[1].score).toBe(-1);
    });

    it('lança NotFoundException quando algum id não existe', async () => {
      cardRepo.find!.mockResolvedValue([buildCard({ id: 1 })]);
      await expect(
        service.reviewBatch([
          { id: 1, correctAnswers: true },
          { id: 2, correctAnswers: true },
        ]),
      ).rejects.toThrow(NotFoundException);
      expect(cardRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove quando existe', async () => {
      cardRepo.delete!.mockResolvedValue({ affected: 1, raw: [] });
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      cardRepo.delete!.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
