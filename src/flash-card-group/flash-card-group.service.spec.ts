import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashCard } from '../flash-card/entities/flash-card.entity';
import { FlashCardGroup } from './entities/flash-card-group.entity';
import { FlashCardGroupService } from './flash-card-group.service';

type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

// Manager transacional usado pelo método absorb.
type ManagerMock = { transaction: jest.Mock };

const createMockRepository = () =>
  ({
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    countBy: jest.fn(),
    manager: { transaction: jest.fn() },
  }) as MockRepository<FlashCardGroup> & { manager: ManagerMock };

// Query builder encadeável para o método review.
const createQueryBuilderMock = () => {
  const qb = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };
  return qb;
};

const buildCard = (overrides: Partial<FlashCard> = {}): FlashCard => ({
  id: 1,
  term: 'give up',
  value: 'desistir',
  translation: null,
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
});

const buildGroup = (
  overrides: Partial<FlashCardGroup> = {},
): FlashCardGroup => ({
  id: 1,
  name: 'Phrasal Verbs',
  createdAt: new Date('2026-06-24T08:30:00.000Z'),
  updatedAt: new Date('2026-06-24T08:30:00.000Z'),
  creatorId: null,
  flashCards: [],
  ...overrides,
});

describe('FlashCardGroupService', () => {
  let service: FlashCardGroupService;
  let repository: MockRepository<FlashCardGroup> & { manager: ManagerMock };
  let qb: ReturnType<typeof createQueryBuilderMock>;

  beforeEach(async () => {
    qb = createQueryBuilderMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashCardGroupService,
        {
          provide: getRepositoryToken(FlashCardGroup),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(FlashCard),
          useValue: { createQueryBuilder: jest.fn(() => qb) },
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

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        name: 'Novo nome',
      });
      expect(result.flashCardsCount).toBe(1);
    });

    it('lança NotFoundException quando o id não existe', async () => {
      repository.preload!.mockResolvedValue(undefined);
      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('review', () => {
    it('retorna os cards ordenados com totalReviews', async () => {
      repository.countBy!.mockResolvedValue(1);
      qb.getMany.mockResolvedValue([
        buildCard({ id: 1, correctAnswers: 1, wrongAnswers: 2 }),
      ]);

      const result = await service.review(1);

      expect(qb.where).toHaveBeenCalledWith('card.flashCardGroupId = :id', {
        id: 1,
      });
      expect(qb.orderBy).toHaveBeenCalledWith(
        'CASE WHEN card.score < 0 THEN 0 ELSE 1 END',
        'ASC',
      );
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'card.lastReview',
        'ASC',
        'NULLS FIRST',
      );
      // Desempate aleatório para variar a ordem a cada dia.
      expect(qb.addOrderBy).toHaveBeenCalledWith('RANDOM()');
      expect(result[0].totalReviews).toBe(3);
    });

    it('lança NotFoundException quando o grupo não existe', async () => {
      repository.countBy!.mockResolvedValue(0);
      await expect(service.review(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reviewBlock', () => {
    it('ordena só por RANDOM() (sem score/lastReview) e anexa totalReviews', async () => {
      repository.countBy!.mockResolvedValue(1);
      qb.getMany.mockResolvedValue([
        buildCard({ id: 1, correctAnswers: 1, wrongAnswers: 2 }),
      ]);

      const result = await service.reviewBlock(1);

      expect(qb.where).toHaveBeenCalledWith('card.flashCardGroupId = :id', {
        id: 1,
      });
      // Aleatório puro: não prioriza dificuldade nem revisão antiga.
      expect(qb.orderBy).toHaveBeenCalledWith('RANDOM()');
      expect(qb.orderBy).not.toHaveBeenCalledWith(
        'CASE WHEN card.score < 0 THEN 0 ELSE 1 END',
        'ASC',
      );
      expect(qb.addOrderBy).not.toHaveBeenCalled();
      expect(result[0].totalReviews).toBe(3);
    });

    it('lança NotFoundException quando o grupo não existe', async () => {
      repository.countBy!.mockResolvedValue(0);
      await expect(service.reviewBlock(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('absorb', () => {
    // Manager fake que roda o callback da transação. find devolve, em ordem,
    // os cards do destino e os da origem (mesma ordem do Promise.all).
    const buildManager = (
      targetCards: FlashCard[] = [],
      sourceCards: FlashCard[] = [],
      overrides: Partial<Record<string, jest.Mock>> = {},
    ) => ({
      countBy: jest.fn().mockResolvedValue(1),
      find: jest
        .fn()
        .mockResolvedValueOnce(targetCards)
        .mockResolvedValueOnce(sourceCards),
      save: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      ...overrides,
    });

    it('move termos inéditos para o destino e exclui a origem', async () => {
      const manager = buildManager(
        [buildCard({ id: 1, term: 'alpha' })],
        [buildCard({ id: 2, term: 'beta', flashCardGroupId: 2 })],
      );
      repository.manager.transaction.mockImplementation(
        (cb: (m: unknown) => unknown) => cb(manager),
      );
      repository.findOne!.mockResolvedValue(
        buildGroup({ flashCards: [buildCard(), buildCard({ id: 2 })] }),
      );

      const result = await service.absorb(1, 2);

      // 'beta' não existe no destino: card movido, sem excluir flashcard.
      expect(manager.save).toHaveBeenCalledWith(FlashCard, [
        expect.objectContaining({ id: 2, flashCardGroupId: 1 }),
      ]);
      expect(manager.delete).not.toHaveBeenCalledWith(
        FlashCard,
        expect.anything(),
      );
      expect(manager.delete).toHaveBeenCalledWith(FlashCardGroup, 2);
      expect(manager.countBy).toHaveBeenCalledTimes(2);
      expect(result.flashCardsCount).toBe(2);
    });

    it('mescla termo duplicado: mantém o mais antigo e soma os contadores', async () => {
      const target = buildCard({
        id: 1,
        term: 'give up',
        correctAnswers: 3,
        wrongAnswers: 1,
        score: 2,
        lastReview: '2026-06-22',
        createdAt: new Date('2026-06-20T08:00:00.000Z'),
        flashCardGroupId: 1,
      });
      const source = buildCard({
        id: 2,
        term: 'Give Up', // mesma palavra, caixa diferente
        correctAnswers: 5,
        wrongAnswers: 0,
        score: 5,
        lastReview: '2026-06-24',
        createdAt: new Date('2026-06-25T08:00:00.000Z'),
        flashCardGroupId: 2,
      });
      const manager = buildManager([target], [source]);
      repository.manager.transaction.mockImplementation(
        (cb: (m: unknown) => unknown) => cb(manager),
      );
      repository.findOne!.mockResolvedValue(buildGroup({ flashCards: [target] }));

      await service.absorb(1, 2);

      // Mantém o card mais antigo (id 1) com contadores somados e revisão mais recente.
      expect(manager.save).toHaveBeenCalledWith(FlashCard, [
        expect.objectContaining({
          id: 1,
          correctAnswers: 8,
          wrongAnswers: 1,
          score: 7,
          lastReview: '2026-06-24',
          flashCardGroupId: 1,
        }),
      ]);
      // Exclui o duplicado mais novo (id 2) e o grupo de origem.
      expect(manager.delete).toHaveBeenCalledWith(FlashCard, [2]);
      expect(manager.delete).toHaveBeenCalledWith(FlashCardGroup, 2);
    });

    it('lança BadRequest quando origem e destino são o mesmo grupo', async () => {
      await expect(service.absorb(1, 1)).rejects.toThrow(BadRequestException);
      // Nem chega a abrir transação.
      expect(repository.manager.transaction).not.toHaveBeenCalled();
    });

    it('lança NotFound quando o grupo destino não existe', async () => {
      const manager = buildManager([], [], {
        countBy: jest.fn().mockResolvedValue(0),
      });
      repository.manager.transaction.mockImplementation(
        (cb: (m: unknown) => unknown) => cb(manager),
      );

      await expect(service.absorb(99, 2)).rejects.toThrow(NotFoundException);
      expect(manager.find).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('lança NotFound quando o grupo de origem não existe', async () => {
      // destino existe (1ª chamada), origem não (2ª chamada)
      const manager = buildManager([], [], {
        countBy: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0),
      });
      repository.manager.transaction.mockImplementation(
        (cb: (m: unknown) => unknown) => cb(manager),
      );

      await expect(service.absorb(1, 99)).rejects.toThrow(NotFoundException);
      expect(manager.find).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
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
