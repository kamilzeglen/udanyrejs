import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { OfferService } from './offer.service';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { UserService } from '@modules/user/user.service';
import { CompanyService } from '@modules/company/company.service';
import { ShipService } from '@modules/ship/ship.service';
import { PdfFileService } from '@modules/pdf-file/pdf-file.service';
import { DestinationService } from '@modules/destination/destination.service';
import { CategoryService } from '@modules/category/category.service';
import { CabinTypeService } from '@modules/cabin-type/cabin-type.service';
import { CabinType } from '@modules/cabin-type/cabin-type.entity';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { User } from '@modules/user/user.entity';
import { ItineraryCityResolverService } from '@modules/offer/itinerary-city-resolver.service';
import { OfferTermPrice } from './offer-term-price.entity';
import { In } from 'typeorm';
import { CityService } from '@modules/city/city.service';

describe('OfferService', () => {
  let service: OfferService;
  let cabinTypeService: { findByIds: jest.Mock };
  let transactionManager: {
    save: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    find: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let dataSource: { transaction: jest.Mock };

  const requestUser = { email: 'admin@udanyrejs.pl' } as User;

  beforeEach(async () => {
    transactionManager = {
      save: jest.fn((entity) =>
        Promise.resolve(
          Array.isArray(entity) ? entity : { id: 'generated-id', ...entity },
        ),
      ),
      create: jest.fn((_entityClass, data) => data),
      delete: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      })),
    };
    dataSource = {
      transaction: jest.fn((callback) => callback(transactionManager)),
    };
    cabinTypeService = { findByIds: jest.fn() };

    const offerRepositoryMock = {
      // Domyślnie odpowiada niepustą ofertą - createOffer/updateOffer na
      // końcu robią dodatkowy findOneById (żeby front dostał realne ID
      // nowo utworzonych terminów), więc getOne=null tutaj wywaliłby
      // większość testów na "offer.name" z nulla. Testy, którym zależy na
      // "nie znaleziono", same nadpisują ten mock lokalnie.
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest
          .fn()
          .mockResolvedValue({ id: 'generated-id', name: 'Rejs po Karaibach' }),
      })),
    };
    const offerTermRepositoryMock = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        { provide: getRepositoryToken(Offer), useValue: offerRepositoryMock },
        {
          provide: getRepositoryToken(OfferTerm),
          useValue: offerTermRepositoryMock,
        },
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: ImageFileService, useValue: {} },
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn().mockResolvedValue(requestUser),
          },
        },
        {
          provide: CompanyService,
          useValue: {
            findOneById: jest.fn().mockResolvedValue({ id: 'company-1' }),
          },
        },
        {
          provide: ShipService,
          useValue: {
            findOneById: jest.fn().mockResolvedValue({ id: 'ship-1' }),
          },
        },
        { provide: PdfFileService, useValue: {} },
        {
          provide: DestinationService,
          useValue: { findByIds: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: CategoryService,
          useValue: { findByIds: jest.fn().mockResolvedValue([]) },
        },
        { provide: CabinTypeService, useValue: cabinTypeService },
        {
          provide: LogService,
          useValue: { createLog: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ItineraryCityResolverService,
          useValue: {
            resolve: jest.fn((itinerary) => Promise.resolve(itinerary)),
          },
        },
        {
          provide: CityService,
          useValue: {
            findCoordinatesByIds: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get(OfferService);
  });

  const validCreateDto = {
    name: 'Rejs po Karaibach',
    companyId: 'company-1',
    shipId: 'ship-1',
    terms: [
      {
        startDate: '2027-01-10',
        endDate: '2027-01-17',
        prices: [
          { cabinTypeId: 'cabin-1', price: 285000 },
          { cabinTypeId: 'cabin-2', price: 350000 },
        ],
      },
      {
        startDate: '2027-02-10',
        endDate: '2027-02-17',
        prices: [{ cabinTypeId: 'cabin-1', price: 300000 }],
      },
    ],
  };

  it('creates an offer with all its terms and prices in one transaction', async () => {
    cabinTypeService.findByIds.mockResolvedValue([
      { id: 'cabin-1' },
      { id: 'cabin-2' },
    ]);

    const offer = await service.createOffer(validCreateDto as any, requestUser);

    expect(offer).toBeDefined();
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    // 1 offer + 2 terms + 2 shareStats (jeden per termin) + 3 price rows (2 w pierwszym terminie, 1 w drugim) = 8 zapisów.
    expect(transactionManager.save).toHaveBeenCalledTimes(8);
  });

  it('assigns categories to their own term, not to the whole offer', async () => {
    cabinTypeService.findByIds.mockResolvedValue([{ id: 'cabin-1' }]);
    const categoryServiceMock = (service as any).categoryService;
    categoryServiceMock.findByIds.mockResolvedValue([{ id: 'cat-zima' }]);

    const dto = {
      name: 'Rejs testowy',
      companyId: 'company-1',
      shipId: 'ship-1',
      terms: [
        {
          startDate: '2027-01-10',
          endDate: '2027-01-17',
          categories: ['cat-zima'],
          prices: [{ cabinTypeId: 'cabin-1', price: 100000 }],
        },
        {
          startDate: '2027-06-10',
          endDate: '2027-06-17',
          prices: [{ cabinTypeId: 'cabin-1', price: 150000 }],
        },
      ],
    };

    await service.createOffer(dto as any, requestUser);

    const savedTermCalls = transactionManager.create.mock.calls.filter(
      (call) => call[1]?.startDate,
    );
    expect(savedTermCalls[0][1].categories).toEqual([{ id: 'cat-zima' }]);
    expect(savedTermCalls[1][1].categories).toBeUndefined();
  });

  it('rejects an offer referencing a cabin type that does not exist', async () => {
    cabinTypeService.findByIds.mockResolvedValue([{ id: 'cabin-1' }]);

    await expect(
      service.createOffer(validCreateDto as any, requestUser),
    ).rejects.toThrow(AppException);
  });

  it('does not check for a duplicate offer by dates anymore', async () => {
    cabinTypeService.findByIds.mockResolvedValue([
      { id: 'cabin-1' },
      { id: 'cabin-2' },
    ]);

    await service.createOffer(validCreateDto as any, requestUser);

    // Skoro oferta ma teraz wiele terminów z definicji, tworzenie drugiej
    // oferty z identycznymi datami pierwszego terminu nie może się nie udać
    // z powodu duplikatu na poziomie oferty (ten check został usunięty).
    await expect(
      service.createOffer(validCreateDto as any, requestUser),
    ).resolves.toBeDefined();
  });

  it('maps a duplicate term (same offer, same dates) to OFFER_TERM_DUPLICATE', async () => {
    cabinTypeService.findByIds.mockResolvedValue([
      { id: 'cabin-1' },
      { id: 'cabin-2' },
    ]);
    transactionManager.save.mockImplementationOnce((entity) =>
      Promise.resolve(
        Array.isArray(entity) ? entity : { id: 'generated-id', ...entity },
      ),
    ); // save Offer - ok
    transactionManager.save.mockImplementationOnce(() => {
      const duplicateError: any = new Error(
        'duplicate key value violates unique constraint',
      );
      duplicateError.code = '23505';
      return Promise.reject(duplicateError);
    }); // save pierwszego OfferTerm - konflikt

    await expect(
      service.createOffer(validCreateDto as any, requestUser),
    ).rejects.toThrow(AppException);
  });

  it('creates a new cabin type for the company when a price gives a name instead of an id', async () => {
    cabinTypeService.findByIds.mockResolvedValue([]);

    const dto = {
      name: 'Rejs testowy',
      companyId: 'company-1',
      shipId: 'ship-1',
      terms: [
        {
          startDate: '2027-01-10',
          endDate: '2027-01-17',
          prices: [{ cabinTypeName: 'zewnętrzna z oknem', price: 100000 }],
        },
      ],
    };

    await service.createOffer(dto as any, requestUser);

    expect(transactionManager.createQueryBuilder).toHaveBeenCalledWith(
      CabinType,
      'cabinType',
    );
    expect(transactionManager.create).toHaveBeenCalledWith(CabinType, {
      companyId: 'company-1',
      name: 'zewnętrzna z oknem',
    });
  });

  it('reuses an existing cabin type found by a case-insensitive name match', async () => {
    cabinTypeService.findByIds.mockResolvedValue([]);
    const existingCabinTypeQuery = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 'existing-cabin-type' }),
    };
    transactionManager.createQueryBuilder.mockReturnValue(
      existingCabinTypeQuery,
    );

    const dto = {
      name: 'Rejs testowy',
      companyId: 'company-1',
      shipId: 'ship-1',
      terms: [
        {
          startDate: '2027-01-10',
          endDate: '2027-01-17',
          prices: [{ cabinTypeName: 'Wewnętrzna', price: 100000 }],
        },
      ],
    };

    await service.createOffer(dto as any, requestUser);

    const createdEntities = transactionManager.create.mock.calls.map(
      (call) => call[0],
    );
    expect(createdEntities).not.toContain(CabinType);
  });

  it('throws when a price provides neither cabinTypeId nor cabinTypeName', async () => {
    cabinTypeService.findByIds.mockResolvedValue([]);

    const dto = {
      name: 'Rejs testowy',
      companyId: 'company-1',
      shipId: 'ship-1',
      terms: [
        {
          startDate: '2027-01-10',
          endDate: '2027-01-17',
          prices: [{ price: 100000 }],
        },
      ],
    };

    await expect(service.createOffer(dto as any, requestUser)).rejects.toThrow(
      AppException,
    );
  });

  describe('updateOffer', () => {
    const existingOffer = {
      id: 'offer-1',
      name: 'Stara nazwa',
      company: { id: 'company-1' },
      ship: { id: 'ship-1' },
    };

    beforeEach(() => {
      const offerRepository = (service as any).offerRepository;
      offerRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingOffer),
      });
    });

    it('clears destinations when an empty list is submitted', async () => {
      const offerWithDestination = {
        ...existingOffer,
        destinations: [{ id: 'destination-1' }],
      };
      const offerRepository = (service as any).offerRepository;
      offerRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(offerWithDestination),
      });

      await service.updateOffer(
        'offer-1',
        {
          companyId: 'company-1',
          shipId: 'ship-1',
          destinations: [],
        } as any,
        requestUser,
      );

      expect(offerWithDestination.destinations).toEqual([]);
    });

    it('clears categories when an empty list is submitted for a term', async () => {
      const existingTerm = {
        id: 'term-1',
        offerId: 'offer-1',
        startDate: new Date('2027-05-01'),
        endDate: new Date('2027-05-08'),
        categories: [{ id: 'category-1' }],
      };
      transactionManager.find.mockResolvedValue([existingTerm]);
      cabinTypeService.findByIds.mockResolvedValue([{ id: 'cabin-1' }]);

      await service.updateOffer(
        'offer-1',
        {
          companyId: 'company-1',
          shipId: 'ship-1',
          terms: [
            {
              startDate: '2027-05-01',
              endDate: '2027-05-08',
              categories: [],
              prices: [{ cabinTypeId: 'cabin-1', price: 250000 }],
            },
          ],
        } as any,
        requestUser,
      );

      expect(existingTerm.categories).toEqual([]);
    });

    it('creates a brand new term when the offer currently has none', async () => {
      cabinTypeService.findByIds.mockResolvedValue([{ id: 'cabin-1' }]);

      await service.updateOffer(
        'offer-1',
        {
          companyId: 'company-1',
          shipId: 'ship-1',
          terms: [
            {
              startDate: '2027-05-01',
              endDate: '2027-05-08',
              prices: [{ cabinTypeId: 'cabin-1', price: 200000 }],
            },
          ],
        } as any,
        requestUser,
      );

      expect(transactionManager.delete).not.toHaveBeenCalled();
      // 1 zapisana oferta + 1 termin + 1 shareStats + 1 cena = 4.
      expect(transactionManager.save).toHaveBeenCalledTimes(4);
    });

    it('keeps the existing term (and its id) when its dates are unchanged, and only replaces its prices', async () => {
      const existingTerm = {
        id: 'term-1',
        offerId: 'offer-1',
        startDate: new Date('2027-05-01'),
        endDate: new Date('2027-05-08'),
        sourceUrl: null,
        categories: [],
      };
      transactionManager.find.mockResolvedValue([existingTerm]);
      cabinTypeService.findByIds.mockResolvedValue([{ id: 'cabin-1' }]);

      await service.updateOffer(
        'offer-1',
        {
          companyId: 'company-1',
          shipId: 'ship-1',
          terms: [
            {
              startDate: '2027-05-01',
              endDate: '2027-05-08',
              prices: [{ cabinTypeId: 'cabin-1', price: 250000 }],
            },
          ],
        } as any,
        requestUser,
      );

      expect(transactionManager.delete).toHaveBeenCalledWith(OfferTermPrice, {
        offerTermId: 'term-1',
      });
      expect(transactionManager.delete).not.toHaveBeenCalledWith(
        OfferTerm,
        expect.anything(),
      );
      expect(transactionManager.save).toHaveBeenCalledWith(existingTerm);
      // 1 zapisana oferta + 1 zapisany istniejący termin + 1 cena = 3. Brak nowego ShareStats.
      expect(transactionManager.save).toHaveBeenCalledTimes(3);
    });

    it('deletes a term that is no longer in the submitted list', async () => {
      const existingTerm = {
        id: 'term-1',
        offerId: 'offer-1',
        startDate: new Date('2027-05-01'),
        endDate: new Date('2027-05-08'),
      };
      transactionManager.find.mockResolvedValue([existingTerm]);
      cabinTypeService.findByIds.mockResolvedValue([{ id: 'cabin-1' }]);

      await service.updateOffer(
        'offer-1',
        {
          companyId: 'company-1',
          shipId: 'ship-1',
          terms: [
            {
              startDate: '2027-09-01',
              endDate: '2027-09-08',
              prices: [{ cabinTypeId: 'cabin-1', price: 250000 }],
            },
          ],
        } as any,
        requestUser,
      );

      expect(transactionManager.delete).toHaveBeenCalledWith(OfferTerm, {
        id: In(['term-1']),
      });
    });

    it('does not touch terms when the update omits them', async () => {
      await service.updateOffer(
        'offer-1',
        { companyId: 'company-1', shipId: 'ship-1', name: 'Nowa nazwa' } as any,
        requestUser,
      );

      expect(transactionManager.delete).not.toHaveBeenCalled();
      expect(cabinTypeService.findByIds).not.toHaveBeenCalled();
    });

    it('throws OFFER_NOT_FOUND for a missing offer', async () => {
      const offerRepository = (service as any).offerRepository;
      offerRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateOffer(
          'missing-offer',
          { companyId: 'company-1', shipId: 'ship-1' } as any,
          requestUser,
        ),
      ).rejects.toThrow(AppException);
    });
  });

  describe('findOneById', () => {
    it('joins terms, their prices and cabin types', async () => {
      const offerRepository = (service as any).offerRepository;
      const joins: string[] = [];
      const queryBuilder = {
        leftJoinAndSelect: jest.fn((relation: string) => {
          joins.push(relation);
          return queryBuilder;
        }),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'offer-1' }),
      };
      offerRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findOneById('offer-1');

      expect(joins).toEqual(
        expect.arrayContaining([
          'offer.terms',
          'terms.prices',
          'termPrices.cabinType',
        ]),
      );
    });

    it('attaches city coordinates to itinerary stops resolved by cityId', async () => {
      const offerRepository = (service as any).offerRepository;
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'offer-1',
          itinerary: [
            {
              day: 1,
              city: 'Gdynia',
              cityId: 'city-1',
              arrivalTime: '08:00',
              departureTime: '18:00',
            },
            {
              day: 2,
              city: 'Nieznane',
              cityId: null,
              arrivalTime: '08:00',
              departureTime: '18:00',
            },
          ],
        }),
      };
      offerRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      const cityService = (service as any).cityService;
      cityService.findCoordinatesByIds.mockResolvedValue([
        { id: 'city-1', latitude: 54.5189, longitude: 18.5305 },
      ]);

      const offer = await service.findOneById('offer-1');

      expect(cityService.findCoordinatesByIds).toHaveBeenCalledWith(['city-1']);
      expect(offer.itinerary[0]).toMatchObject({
        latitude: 54.5189,
        longitude: 18.5305,
      });
      expect(offer.itinerary[1].latitude).toBeUndefined();
    });

    it('returns the offer unchanged when it has no itinerary', async () => {
      const offerRepository = (service as any).offerRepository;
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'offer-1' }),
      };
      offerRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      const cityService = (service as any).cityService;

      const offer = await service.findOneById('offer-1');

      expect(offer).toEqual({ id: 'offer-1' });
      expect(cityService.findCoordinatesByIds).not.toHaveBeenCalled();
    });
  });

  describe('findTermsByIds', () => {
    it('joins the parent offer, prices and PDF for the requested term ids', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'term-1' }]),
      };
      offerTermRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findTermsByIds(['term-1', 'term-2']);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'term.id IN (:...termIds)',
        {
          termIds: ['term-1', 'term-2'],
        },
      );
      expect(result).toEqual([{ id: 'term-1' }]);
    });

    it('returns an empty array without querying when given no ids', async () => {
      const offerTermRepository = (service as any).offerTermRepository;

      const result = await service.findTermsByIds([]);

      expect(result).toEqual([]);
      expect(offerTermRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findActiveOffers', () => {
    it('filters by term start date instead of the removed offer.startDate column', async () => {
      const offerRepository = (service as any).offerRepository;
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      offerRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findActiveOffers({ lessThan: new Date('2027-01-01') });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('offer_term'),
        {
          lessThan: new Date('2027-01-01'),
        },
      );
    });

    it('does not throw when called without opts', async () => {
      const offerRepository = (service as any).offerRepository;
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      offerRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.findActiveOffers()).resolves.toEqual([]);
    });
  });

  describe('searchOffers', () => {
    const buildTermQueryBuilder = (
      overrides: Partial<Record<string, jest.Mock>> = {},
    ) => {
      const qb: any = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
        getMany: jest.fn().mockResolvedValue([]),
        ...overrides,
      };
      return qb;
    };

    const baseSearchDto = {
      orderBy: 'createdAt',
      orderDir: 'asc' as const,
      offset: 0,
      limit: 10,
    };

    it('avoids multiplying rows by categories and destinations for an unfiltered search', async () => {
      const idQuery = buildTermQueryBuilder();
      const countQuery = buildTermQueryBuilder();
      (service as any).offerTermRepository.createQueryBuilder
        .mockReturnValueOnce(idQuery)
        .mockReturnValueOnce(countQuery);

      await service.searchOffers(baseSearchDto as any);

      expect(idQuery.leftJoin).not.toHaveBeenCalled();
      expect(countQuery.leftJoin).not.toHaveBeenCalled();
      expect(idQuery.addOrderBy).toHaveBeenCalledWith('"termId"', 'ASC');
    });

    it('joins requested filters in both the page and count queries', async () => {
      const idQuery = buildTermQueryBuilder();
      const countQuery = buildTermQueryBuilder();
      (service as any).offerTermRepository.createQueryBuilder
        .mockReturnValueOnce(idQuery)
        .mockReturnValueOnce(countQuery);
      (service as any).categoryService.findOneByUrl = jest
        .fn()
        .mockResolvedValue({ id: 'category-1' });

      await service.searchOffers({
        ...baseSearchDto,
        category: 'summer',
        destinationIdList: ['destination-1'],
      } as any);

      for (const query of [idQuery, countQuery]) {
        expect(query.leftJoin).toHaveBeenCalledWith(
          'term.categories',
          'category',
        );
        expect(query.leftJoin).toHaveBeenCalledWith(
          'offer.destinations',
          'destination',
        );
        expect(query.where).toHaveBeenCalledWith(
          expect.stringContaining('category.id = :categoryId'),
          expect.objectContaining({
            categoryId: 'category-1',
            destinationIdList: ['destination-1'],
          }),
        );
      }
    });

    it('returns one row per matching term, not one row per offer', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const idQuery = buildTermQueryBuilder({
        getRawMany: jest.fn().mockResolvedValue([
          { termId: 'term-1', fromPrice: '285000' },
          { termId: 'term-2', fromPrice: '300000' },
        ]),
      });
      const countQuery = buildTermQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue({ count: '2' }),
      });
      const hydrationQuery = buildTermQueryBuilder({
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'term-1',
            startDate: new Date('2027-01-10'),
            endDate: new Date('2027-01-17'),
            offer: { id: 'offer-1', name: 'Rejs A' },
          },
          {
            id: 'term-2',
            startDate: new Date('2027-02-10'),
            endDate: new Date('2027-02-17'),
            offer: { id: 'offer-1', name: 'Rejs A' },
          },
        ]),
      });
      offerTermRepository.createQueryBuilder
        .mockReturnValueOnce(idQuery)
        .mockReturnValueOnce(countQuery)
        .mockReturnValueOnce(hydrationQuery);

      const result = await service.searchOffers(baseSearchDto as any);

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual(
        expect.objectContaining({ termId: 'term-1', fromPrice: 285000 }),
      );
      expect(result.data[1]).toEqual(
        expect.objectContaining({ termId: 'term-2', fromPrice: 300000 }),
      );
      expect(result.pagination.all).toBe(2);
    });

    it('paginates with limit/offset, not skip/take (TypeORM silently drops skip/take once a query has many-relation joins)', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const idQuery = buildTermQueryBuilder({
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      const countQuery = buildTermQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
      });
      offerTermRepository.createQueryBuilder
        .mockReturnValueOnce(idQuery)
        .mockReturnValueOnce(countQuery);

      await service.searchOffers({
        ...baseSearchDto,
        offset: 20,
        limit: 10,
      } as any);

      expect(idQuery.limit).toHaveBeenCalledWith(10);
      expect(idQuery.offset).toHaveBeenCalledWith(20);
      expect(idQuery.skip).not.toHaveBeenCalled();
      expect(idQuery.take).not.toHaveBeenCalled();
    });

    it('returns an empty page without querying for hydration when no term matches', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const idQuery = buildTermQueryBuilder({
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      const countQuery = buildTermQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
      });
      offerTermRepository.createQueryBuilder
        .mockReturnValueOnce(idQuery)
        .mockReturnValueOnce(countQuery);

      const result = await service.searchOffers(baseSearchDto as any);

      expect(result.data).toEqual([]);
      expect(result.pagination.all).toBe(0);
      expect(offerTermRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('filters by term dates, not by the removed offer dates', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const idQuery = buildTermQueryBuilder({
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      const countQuery = buildTermQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
      });
      offerTermRepository.createQueryBuilder
        .mockReturnValueOnce(idQuery)
        .mockReturnValueOnce(countQuery);

      await service.searchOffers({
        ...baseSearchDto,
        startDate: new Date('2027-01-01'),
        endDate: new Date('2027-12-31'),
      } as any);

      expect(idQuery.where).toHaveBeenCalledWith(
        expect.stringContaining('term.startDate >= :startDate'),
        expect.objectContaining({
          startDate: new Date('2027-01-01'),
          endDate: new Date('2027-12-31'),
        }),
      );
    });
  });

  describe('deactivateOffer / activateOffer cascade to terms', () => {
    const existingOffer = { id: 'offer-1', name: 'Rejs testowy' };

    function buildTermsUpdateBuilder() {
      return {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
    }

    beforeEach(() => {
      const offerRepository = (service as any).offerRepository;
      offerRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingOffer),
      });
    });

    it('deactivating the offer also deactivates every one of its terms', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const termsUpdateBuilder = buildTermsUpdateBuilder();
      offerTermRepository.createQueryBuilder.mockReturnValue(
        termsUpdateBuilder,
      );

      await service.deactivateOffer('offer-1', requestUser);

      expect(termsUpdateBuilder.set).toHaveBeenCalledWith({ isActive: false });
      expect(termsUpdateBuilder.where).toHaveBeenCalledWith(
        'offerId = :offerId',
        { offerId: 'offer-1' },
      );
    });

    it('activating the offer also activates every one of its terms', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const termsUpdateBuilder = buildTermsUpdateBuilder();
      offerTermRepository.createQueryBuilder.mockReturnValue(
        termsUpdateBuilder,
      );

      await service.activateOffer('offer-1', requestUser);

      expect(termsUpdateBuilder.set).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('offerHasActiveTerm', () => {
    function buildCountBuilder(count: number) {
      return {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(count),
      };
    }

    it('returns true when at least one term is still active', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      offerTermRepository.createQueryBuilder.mockReturnValue(
        buildCountBuilder(2),
      );

      const result = await service.offerHasActiveTerm('offer-1');

      expect(result).toBe(true);
    });

    it('returns false once none of its terms are active', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      offerTermRepository.createQueryBuilder.mockReturnValue(
        buildCountBuilder(0),
      );

      const result = await service.offerHasActiveTerm('offer-1');

      expect(result).toBe(false);
    });
  });

  describe('setTermActive', () => {
    it('flips only the requested term', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const updateBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
      offerTermRepository.createQueryBuilder.mockReturnValue(updateBuilder);

      await service.setTermActive('term-1', false);

      expect(updateBuilder.set).toHaveBeenCalledWith({ isActive: false });
      expect(updateBuilder.where).toHaveBeenCalledWith('id = :termId', {
        termId: 'term-1',
      });
    });
  });

  describe('updateTermDates', () => {
    it('updates only the requested term dates', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      const updateBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
      offerTermRepository.createQueryBuilder.mockReturnValue(updateBuilder);

      await service.updateTermDates('term-1', '2027-05-01', '2027-05-08');

      expect(updateBuilder.set).toHaveBeenCalledWith({
        startDate: '2027-05-01',
        endDate: '2027-05-08',
      });
      expect(updateBuilder.where).toHaveBeenCalledWith('id = :termId', {
        termId: 'term-1',
      });
    });
  });

  describe('updateTermPrices', () => {
    it('replaces the term prices inside a transaction', async () => {
      await service.updateTermPrices('term-1', 'company-1', [
        { cabinTypeId: 'cabin-1', price: 100000 },
      ]);

      expect(transactionManager.delete).toHaveBeenCalledWith(OfferTermPrice, {
        offerTermId: 'term-1',
      });
      expect(transactionManager.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeOffers', () => {
    beforeEach(() => {
      const offerRepository = (service as any).offerRepository;
      offerRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'offer-1',
          name: 'Rejs testowy',
          terms: [],
        }),
      });
      transactionManager.createQueryBuilder.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      });
    });

    it('removes every offer and reports all of them as deleted', async () => {
      const result = await service.removeOffers(
        ['offer-1', 'offer-2'],
        requestUser,
      );

      expect(dataSource.transaction).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        deletedIds: ['offer-1', 'offer-2'],
        failedIds: [],
      });
    });

    it('keeps removing the rest of the batch when one offer is not found', async () => {
      const offerRepository = (service as any).offerRepository;
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'offer-1',
            name: 'Rejs testowy',
            terms: [],
          })
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            id: 'offer-3',
            name: 'Rejs testowy 2',
            terms: [],
          }),
      };
      offerRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.removeOffers(
        ['offer-1', 'offer-missing', 'offer-3'],
        requestUser,
      );

      expect(result).toEqual({
        deletedIds: ['offer-1', 'offer-3'],
        failedIds: ['offer-missing'],
      });
    });
  });

  describe('cleanupPastTerms', () => {
    function buildDeleteBuilder() {
      return {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
    }

    function buildOffersWithoutTermsBuilder(result: unknown[]) {
      return {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(result),
      };
    }

    it('does nothing and does not open a transaction when there are no past terms', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      offerTermRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.cleanupPastTerms();

      expect(result).toEqual({ deletedTermsCount: 0, deletedOffersCount: 0 });
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('deletes past terms but keeps the offer when it still has other terms', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      offerTermRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValue([
            { id: 'term-1', offerId: 'offer-1', pdfFile: null },
          ]),
      });
      transactionManager.createQueryBuilder.mockImplementation(
        (entityClass?: unknown) =>
          entityClass
            ? buildOffersWithoutTermsBuilder([])
            : buildDeleteBuilder(),
      );

      const result = await service.cleanupPastTerms();

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ deletedTermsCount: 1, deletedOffersCount: 0 });
    });

    it('also deletes the offer, its image file included, when it has no terms left', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      offerTermRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValue([
            { id: 'term-1', offerId: 'offer-1', pdfFile: null },
          ]),
      });
      transactionManager.createQueryBuilder.mockImplementation(
        (entityClass?: unknown) =>
          entityClass
            ? buildOffersWithoutTermsBuilder([
                { id: 'offer-1', imageFile: { path: 'offers/offer-1.png' } },
              ])
            : buildDeleteBuilder(),
      );
      const imageFileService = (service as any).imageFileService;
      imageFileService.removeImageFile = jest.fn().mockResolvedValue(true);

      const result = await service.cleanupPastTerms();

      expect(result).toEqual({ deletedTermsCount: 1, deletedOffersCount: 1 });
      expect(imageFileService.removeImageFile).toHaveBeenCalledWith(
        'offers/offer-1.png',
      );
    });

    it('removes the pdf file of every deleted term from disk after the transaction commits', async () => {
      const offerTermRepository = (service as any).offerTermRepository;
      offerTermRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'term-1',
            offerId: 'offer-1',
            pdfFile: { path: 'terms/term-1.pdf' },
          },
        ]),
      });
      transactionManager.createQueryBuilder.mockImplementation(
        (entityClass?: unknown) =>
          entityClass
            ? buildOffersWithoutTermsBuilder([])
            : buildDeleteBuilder(),
      );
      const pdfFileService = (service as any).pdfFileService;
      pdfFileService.removePdfFile = jest.fn().mockResolvedValue(true);

      await service.cleanupPastTerms();

      expect(pdfFileService.removePdfFile).toHaveBeenCalledWith(
        'terms/term-1.pdf',
      );
    });
  });

  describe('createDiscoveredTerm', () => {
    it('creates the term, its share stats row and its prices in one transaction', async () => {
      const offer = { id: 'offer-1', companyId: 'company-1' } as any;

      const created = await service.createDiscoveredTerm(offer, {
        startDate: '2027-05-01',
        endDate: '2027-05-08',
        sourceUrl: 'https://rejsy4you.pl/rejs/2',
        prices: [{ cabinTypeId: 'cabin-1', price: 100000 }],
      } as any);

      expect(created).toBeDefined();
      expect(transactionManager.save).toHaveBeenCalledTimes(3);
    });
  });
});
