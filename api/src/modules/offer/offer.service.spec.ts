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
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
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
});
