import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { City } from './city.entity';
import { UserService } from '@modules/user/user.service';
import { DestinationService } from '@modules/destination/destination.service';
import { LogService } from '@modules/log/log.service';

function buildQueryBuilderMock(result: unknown) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(result),
  };
}

describe('CityService.findOrCreateByName', () => {
  let service: CityService;
  let cityRepository: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let userService: { findOneByEmail: jest.Mock };
  let logService: { createLog: jest.Mock };

  beforeEach(async () => {
    cityRepository = {
      createQueryBuilder: jest.fn(() => buildQueryBuilderMock(null)),
      create: jest.fn((data) => data),
      save: jest.fn((entity) => Promise.resolve({ id: 'city-new', ...entity })),
    };
    userService = {
      findOneByEmail: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', email: 'admin@udanyrejs.pl' }),
    };
    logService = { createLog: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CityService,
        { provide: getRepositoryToken(City), useValue: cityRepository },
        { provide: UserService, useValue: userService },
        { provide: DestinationService, useValue: {} },
        { provide: LogService, useValue: logService },
      ],
    }).compile();

    service = moduleRef.get(CityService);
  });

  it('returns the existing city when a case-insensitive match is found', async () => {
    cityRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilderMock({ id: 'city-1', name: 'Gdynia' }),
    );

    const result = await service.findOrCreateByName(
      '  gdynia  ',
      'admin@udanyrejs.pl',
    );

    expect(result).toEqual({ id: 'city-1', name: 'Gdynia' });
    expect(cityRepository.save).not.toHaveBeenCalled();
  });

  it('creates a new city with the trimmed name when none matches', async () => {
    cityRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilderMock(null),
    );

    const result = await service.findOrCreateByName(
      '  Nowe Miasto  ',
      'admin@udanyrejs.pl',
    );

    expect(cityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nowe Miasto', destinations: [] }),
    );
    expect(result).toEqual(
      expect.objectContaining({ id: 'city-new', name: 'Nowe Miasto' }),
    );
    expect(logService.createLog).toHaveBeenCalledWith(
      expect.stringContaining('Nowe Miasto'),
      'admin@udanyrejs.pl',
    );
  });

  it('stores coordinates when a city is created manually', async () => {
    await service.createCity(
      {
        name: 'Gdynia',
        latitude: 54.5189,
        longitude: 18.5305,
      },
      { email: 'admin@udanyrejs.pl' } as any,
    );

    expect(cityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Gdynia',
        latitude: 54.5189,
        longitude: 18.5305,
      }),
    );
  });

  it('clears both coordinates when null values are submitted during editing', async () => {
    const city = {
      id: 'city-1',
      name: 'Gdynia',
      latitude: 54.5189,
      longitude: 18.5305,
    };
    cityRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilderMock(city),
    );

    const result = await service.updateCity(
      'city-1',
      { latitude: null, longitude: null },
      { email: 'admin@udanyrejs.pl' } as any,
    );

    expect(result).toEqual(
      expect.objectContaining({ latitude: null, longitude: null }),
    );
  });

  it('re-fetches the winner instead of failing when two requests create the same city concurrently', async () => {
    cityRepository.createQueryBuilder
      .mockReturnValueOnce(buildQueryBuilderMock(null))
      .mockReturnValueOnce(
        buildQueryBuilderMock({ id: 'city-race-winner', name: 'Wyspy' }),
      );
    cityRepository.save.mockRejectedValueOnce(
      new Error('duplicate key value violates unique constraint'),
    );

    const result = await service.findOrCreateByName(
      'Wyspy',
      'admin@udanyrejs.pl',
    );

    expect(result).toEqual({ id: 'city-race-winner', name: 'Wyspy' });
  });
});

describe('CityService.findCoordinatesByIds', () => {
  let service: CityService;
  let cityRepository: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    cityRepository = { createQueryBuilder: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CityService,
        { provide: getRepositoryToken(City), useValue: cityRepository },
        { provide: UserService, useValue: {} },
        { provide: DestinationService, useValue: {} },
        { provide: LogService, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(CityService);
  });

  it('selects only id, latitude and longitude for the requested city ids', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'city-1', latitude: 54.5189, longitude: 18.5305 },
        ]),
    };
    cityRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.findCoordinatesByIds(['city-1']);

    expect(queryBuilder.select).toHaveBeenCalledWith([
      'city.id',
      'city.latitude',
      'city.longitude',
    ]);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'city.id IN (:...cityIds)',
      { cityIds: ['city-1'] },
    );
    expect(result).toEqual([
      { id: 'city-1', latitude: 54.5189, longitude: 18.5305 },
    ]);
  });

  it('returns an empty array without querying when given no ids', async () => {
    const result = await service.findCoordinatesByIds([]);

    expect(result).toEqual([]);
    expect(cityRepository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
