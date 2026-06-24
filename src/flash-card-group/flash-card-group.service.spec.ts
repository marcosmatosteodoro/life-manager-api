import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { FlashCardGroup } from './entities/flash-card-group.entity';
import { FlashCardGroupService } from './flash-card-group.service';

type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = (): MockRepository<FlashCardGroup> => ({
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const buildCard = (overrides: Partial<FlashCard> = {}): FlashCard =>
  ({
    id: 1,
    term: 'give up',
    value: 'desistir',
    picture: null,
    correctAnswers: 3,
    wrongAnswers: 1,
    score: 2,
    lastReview: null,
    flashCardGroupId: 1,
    createdAt: new Date('2026-06-24T08:30:00.000Z'),
    updatedAt: new Date('2026-06-24T08:30:00.000Z'),
    creatorId: null,
    ...overrides,
  }) as FlashCard;

const buildGroup = (overrides: Partial<FlashCardGroup> = {}): FlashCardGroup =>
  ({
    id: 1,
    name: 'Phrasal Verbs',
    createdAt: new Date('2026-06-24T08:30:00.000Z'),
    updatedAt: new Date('2026-06-24T08:30:00.000Z'),
    creatorId: null,
    flashCards: [],
    ...overrides,
  }) as FlashCardGroup;

describe('FlashCardGroupService', () => {
  let service: FlashCardGroupService;
  let repository: MockRepository<FlashCardGroup>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashCardGroupService,
        {
          provide: getRepositoryToken(FlashCardGroup),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get(FlashCardGroupService);
    repository = module.get(getRepositoryToken(FlashCardGroup));
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria o grupo e retorna flashCardsCount 0 e flashCards vazio', async () => {
      const entity = buildGroup();
      repository.create!.mockReturnValue(entity);
      repository.save!.mockResolvedValue(entity);

      const result = await service.create({ name: 'Phrasal Verbs' });

      expect(result.flashCardsCount).toBe(0);
      expect(result.flashCards).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('anexa flashCardsCount e totalReviews nos flashcards', async () => {
      const group = buildGroup({
        flashCards: [
          buildCard({ id: 1, correctAnswers: 3, wrongAnswers: 1 }),
          buildCard({ id: 2, correctAnswers: 0, wrongAnswers: 2 }),
        ],
      });
      repository.findAndCount!.mockResolvedValue([[group], 1]);

      const result = await service.findAll();

      expect(result.count).toBe(1);
      expect(result.rows[0].flashCardsCount).toBe(2);
      expect(result.rows[0].flashCards![0].totalReviews).toBe(4);
      expect(result.rows[0].flashCards![1].totalReviews).toBe(2);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        relations: { flashCards: true },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('retorna o grupo com contagem quando encontrado', async () => {
      const group = buildGroup({ flashCards: [buildCard()] });
      repository.findOne!.mockResolvedValue(group);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { flashCards: true },
      });
      expect(result.flashCardsCount).toBe(1);
    });

    it('lança NotFoundException quando não encontrado', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza e recarrega o grupo com a contagem', async () => {
      const updated = buildGroup({ name: 'Novo nome' });
      repository.preload!.mockResolvedValue(updated);
      repository.save!.mockResolvedValue(updated);
      repository.findOne!.mockResolvedValue(
        buildGroup({ name: 'Novo nome', flashCards: [buildCard()] }),
      );

      const result = await service.update(1, { name: 'Novo nome' });

      expect(repository.preload).toHaveBeenCalledWith({ id: 1, name: 'Novo nome' });
      expect(result.flashCardsCount).toBe(1);
    });

    it('lança NotFoundException quando o id não existe', async () => {
      repository.preload!.mockResolvedValue(undefined);
      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('remove quando existe', async () => {
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('lança NotFoundException quando nada foi afetado', async () => {
      repository.delete!.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
