import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { OfferService } from './offer.service';
import { Offer } from './offer.entity';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { UserService } from '@modules/user/user.service';
import { CompanyService } from '@modules/company/company.service';
import { ShipService } from '@modules/ship/ship.service';
import { PdfFileService } from '@modules/pdf-file/pdf-file.service';
import { DestinationService } from '@modules/destination/destination.service';
import { CategoryService } from '@modules/category/category.service';
import { CabinTypeService } from '@modules/cabin-type/cabin-type.service';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { User } from '@modules/user/user.entity';

describe('OfferService', () => {
  let service: OfferService;
  let cabinTypeService: { findByIds: jest.Mock };
  let transactionManager: {
    save: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        { provide: getRepositoryToken(Offer), useValue: offerRepositoryMock },
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
    // 1 offer + 1 shareStats + 2 terms + 3 price rows (2 w pierwszym terminie, 1 w drugim) = 7 zapisów.
    expect(transactionManager.save).toHaveBeenCalledTimes(7);
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
    transactionManager.save.mockImplementationOnce((entity) =>
      Promise.resolve(
        Array.isArray(entity) ? entity : { id: 'generated-id', ...entity },
      ),
    ); // save ShareStats - ok
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

    it('replaces all existing terms when new terms are provided', async () => {
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

      expect(transactionManager.delete).toHaveBeenCalledWith(
        expect.anything(),
        { offerId: 'offer-1' },
      );
      // 1 zapis oferty + 1 termin + 1 cena = 3.
      expect(transactionManager.save).toHaveBeenCalledTimes(3);
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
});
