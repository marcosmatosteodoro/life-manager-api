import { Test, TestingModule } from '@nestjs/testing';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';

const buildCountry = (overrides: Partial<Country> = {}): Country => ({
  id: 1,
  name: 'Brasil',
  code: 'BR',
  createdAt: new Date('2026-06-22T08:30:00.000Z'),
  updatedAt: new Date('2026-06-22T08:30:00.000Z'),
  creatorId: null,
  ...overrides,
});

describe('CountryController', () => {
  let controller: CountryController;
  let service: jest.Mocked<CountryService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<CountryService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryController],
      providers: [{ provide: CountryService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CountryController>(CountryController);
    service = module.get(CountryService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega para o service e retorna o resultado', async () => {
    const dto: CreateCountryDto = { name: 'Brasil', code: 'BR' };
    const created = buildCountry();
    service.create.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll retorna { count, rows } do service', async () => {
    const payload = { count: 1, rows: [buildCountry()] };
    service.findAll.mockResolvedValue(payload);

    await expect(controller.findAll()).resolves.toEqual(payload);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne repassa o id para o service', async () => {
    const entity = buildCountry();
    service.findOne.mockResolvedValue(entity);

    await expect(controller.findOne(1)).resolves.toEqual(entity);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update repassa id e dto para o service', async () => {
    const dto: UpdateCountryDto = { name: 'Brazil' };
    const updated = buildCountry({ name: 'Brazil' });
    service.update.mockResolvedValue(updated);

    await expect(controller.update(1, dto)).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove repassa o id e resolve void', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
