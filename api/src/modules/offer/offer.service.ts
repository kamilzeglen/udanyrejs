import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { OfferTermPrice } from './offer-term-price.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferTermDto } from './dto/offer-term.dto';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { UserService } from '@modules/user/user.service';
import { CompanyService } from '@modules/company/company.service';
import { ShipService } from '@modules/ship/ship.service';
import { PdfFileService } from '@modules/pdf-file/pdf-file.service';
import { DestinationService } from '@modules/destination/destination.service';
import { CategoryService } from '@modules/category/category.service';
import { CabinTypeService } from '@modules/cabin-type/cabin-type.service';
import { CabinType } from '@modules/cabin-type/cabin-type.entity';
import { OfferTermPriceDto } from '@modules/offer/dto/offer-term.dto';
import { UpdateOfferDto } from '@modules/offer/dto/update-offer.dto';
import { User } from '@modules/user/user.entity';
import { SearchOffersDto } from '@modules/offer/dto/search-offers.dto';
import { ShareStats } from '@modules/share-stats/share-stat.entity';
import { PaginationResp } from '../../interfaces/pagination-response';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import { ItineraryCityResolverService } from '@modules/offer/itinerary-city-resolver.service';

@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);

  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(OfferTerm)
    private readonly offerTermRepository: Repository<OfferTerm>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ImageFileService))
    private readonly imageFileService: ImageFileService,
    private readonly pdfFileService: PdfFileService,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly shipService: ShipService,
    private readonly categoryService: CategoryService,
    private readonly destinationService: DestinationService,
    private readonly cabinTypeService: CabinTypeService,
    private readonly logService: LogService,
    private readonly itineraryCityResolverService: ItineraryCityResolverService,
  ) {}

  async findOneById(id: string): Promise<Offer> {
    return await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('offer.ship', 'ship')
      .leftJoinAndSelect('offer.imageFile', 'imageFile')
      .leftJoinAndSelect('offer.pdfFile', 'pdfFile')
      .leftJoinAndSelect('offer.destinations', 'destinations')
      .leftJoinAndSelect('offer.shareStats', 'shareStats')
      .leftJoinAndSelect('offer.terms', 'terms')
      .leftJoinAndSelect('terms.categories', 'categories')
      .leftJoinAndSelect('terms.prices', 'termPrices')
      .leftJoinAndSelect('termPrices.cabinType', 'cabinType')
      .leftJoinAndSelect('offer.createdBy', 'createdBy')
      .leftJoinAndSelect('offer.updatedBy', 'updatedBy')
      .where('offer.id = :id', { id })
      .getOne();
  }

  async findAllWithURL(): Promise<Offer[]> {
    return await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.terms', 'terms')
      .leftJoinAndSelect('terms.prices', 'prices')
      .leftJoinAndSelect('prices.cabinType', 'cabinType')
      .where('offer.offerUrl IS NOT NULL')
      .andWhere('offer.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findActiveOffers(opts?: { lessThan: Date }): Promise<Offer[]> {
    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.isActive = :isActive', { isActive: true });

    if (opts?.lessThan) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM offer_term term WHERE term."offerId" = offer.id AND term."startDate" <= :lessThan)',
        { lessThan: opts.lessThan },
      );
    }

    return queryBuilder.getMany();
  }

  async findOffersByCategory(category?: string): Promise<Offer[]> {
    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('company.imageFile', 'companyImageFile')
      .leftJoinAndSelect('offer.terms', 'terms')
      .leftJoinAndSelect('terms.categories', 'categories')
      .leftJoinAndSelect('offer.imageFile', 'imageFile');

    if (category) {
      queryBuilder.where('LOWER(categories.url) = LOWER(:category)', {
        category,
      });
    }

    return queryBuilder.getMany();
  }

  async searchOffers(searchOffersDto: SearchOffersDto): Promise<{
    data: Array<
      Partial<Offer> & {
        termId: string;
        startDate: Date;
        endDate: Date;
        fromPrice: number;
      }
    >;
    pagination: PaginationResp;
  }> {
    const {
      orderBy,
      orderDir,
      offset,
      limit,
      category,
      startDate,
      endDate,
      destinationIdList,
      companyIdList,
      showInactive,
    } = searchOffersDto;

    const whereClauses: string[] = [];
    const whereParams: ObjectLiteral = {};

    if (category === 'recommended') {
      whereClauses.push('offer.isRecommended = :isRecommended');
      whereParams.isRecommended = true;
    }

    if (category?.length && category !== 'recommended') {
      const categoryId = (await this.categoryService.findOneByUrl(category)).id;
      whereClauses.push('category.id = :categoryId');
      whereParams.categoryId = categoryId;
    }

    if (!showInactive) {
      whereClauses.push('offer.isActive = :active');
      whereParams.active = true;
    }

    if (companyIdList && companyIdList.length > 0) {
      whereClauses.push('offer.companyId IN (:...companyIdList)');
      whereParams.companyIdList = companyIdList;
    }

    if (startDate) {
      whereClauses.push('term.startDate >= :startDate');
      whereParams.startDate = startDate;
    }

    if (endDate) {
      whereClauses.push('term.endDate <= :endDate');
      whereParams.endDate = endDate;
    }

    if (destinationIdList && destinationIdList.length > 0) {
      whereClauses.push('destination.id IN (:...destinationIdList)');
      whereParams.destinationIdList = destinationIdList;
    }

    const whereSql = whereClauses.join(' AND ');
    const orderByExpression = this.resolveTermOrderBy(orderBy);
    // Postgres wymaga, żeby przy SELECT DISTINCT każda kolumna z ORDER BY
    // była też w liście SELECT. Tu selectujemy tylko "termId" i "fromPrice",
    // więc każde inne pole sortowania (offer.name, term.startDate, ...)
    // trzeba dołożyć do SELECT pod własnym aliasem ("orderValue") i sortować
    // po TYM aliasie, nigdy po surowym wyrażeniu.
    const orderColumnAlias =
      orderByExpression === 'fromPrice' ? 'fromPrice' : 'orderValue';

    let idQueryBuilder = this.offerTermRepository
      .createQueryBuilder('term')
      .innerJoin('term.offer', 'offer')
      .leftJoin('term.categories', 'category')
      .leftJoin('offer.destinations', 'destination')
      .select('term.id', 'termId')
      .addSelect((subQuery) => {
        return subQuery
          .select('MIN(price.price)', 'min')
          .from(OfferTermPrice, 'price')
          .where('price.offerTermId = term.id');
      }, 'fromPrice');

    if (orderColumnAlias === 'orderValue') {
      idQueryBuilder = idQueryBuilder.addSelect(
        orderByExpression,
        'orderValue',
      );
    }

    // limit()/offset(), nie skip()/take() - TypeORM po cichu pomija skip()/take()
    // (zero błędu, zero ostrzeżenia) w zapytaniach z joinami do relacji "many"
    // (tu: term.categories, offer.destinations), przez co paginacja przestawała
    // działać i zwracane były wszystkie wiersze naraz.
    const idQuery = idQueryBuilder
      .where(whereSql, whereParams)
      .distinct(true)
      .limit(limit)
      .offset(offset)
      .orderBy(
        `"${orderColumnAlias}"`,
        orderDir.toUpperCase() as any,
        'NULLS LAST',
      );

    const rawIdRows = await idQuery.getRawMany<{
      termId: string;
      fromPrice: string | null;
    }>();
    const orderedTermIds = rawIdRows.map((row) => row.termId);
    const fromPriceByTermId = new Map(
      rawIdRows.map((row) => [
        row.termId,
        row.fromPrice === null ? null : Number(row.fromPrice),
      ]),
    );

    const countRow = await this.offerTermRepository
      .createQueryBuilder('term')
      .innerJoin('term.offer', 'offer')
      .leftJoin('term.categories', 'category')
      .leftJoin('offer.destinations', 'destination')
      .select('COUNT(DISTINCT term.id)', 'count')
      .where(whereSql, whereParams)
      .getRawOne<{ count: string }>();
    const count = Number(countRow.count);

    const pagination: PaginationResp = {
      limit,
      offset,
      orderDir,
      orderBy: orderByExpression,
      all: count,
      count: orderedTermIds.length,
    };

    if (!orderedTermIds.length) {
      return { data: [], pagination };
    }

    const terms = await this.offerTermRepository
      .createQueryBuilder('term')
      .innerJoinAndSelect('term.offer', 'offer')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('offer.ship', 'ship')
      .leftJoinAndSelect('ship.company', 'shipCompany')
      .leftJoinAndSelect('offer.imageFile', 'offerImageFile')
      .leftJoinAndSelect('offer.pdfFile', 'pdfFile')
      .leftJoinAndSelect('company.imageFile', 'companyImageFile')
      .leftJoinAndSelect('ship.imageFile', 'shipImageFile')
      .leftJoinAndSelect('term.categories', 'category')
      .leftJoinAndSelect('offer.destinations', 'destination')
      .leftJoinAndSelect('offer.shareStats', 'shareStats')
      .where('term.id IN (:...termIds)', { termIds: orderedTermIds })
      .getMany();

    const termById = new Map(terms.map((term) => [term.id, term]));

    const data = orderedTermIds
      .map((termId) => termById.get(termId))
      .filter((term): term is OfferTerm => Boolean(term))
      .map((term) =>
        this.mapTermToSearchResult(
          term,
          fromPriceByTermId.get(term.id) ?? null,
        ),
      );

    return { data, pagination };
  }

  private resolveTermOrderBy(orderBy: string): string {
    if (orderBy === 'startDate' || orderBy === 'endDate') {
      return `term.${orderBy}`;
    }
    if (orderBy === 'price') {
      return 'fromPrice';
    }
    if (orderBy.includes('.')) {
      return orderBy;
    }
    return `offer.${orderBy}`;
  }

  private mapTermToSearchResult(
    term: OfferTerm,
    fromPrice: number | null,
  ): Partial<Offer> & {
    termId: string;
    startDate: Date;
    endDate: Date;
    fromPrice: number;
  } {
    const offerFields: Partial<Offer> & { terms?: OfferTerm[] } = {
      ...term.offer,
    };
    delete offerFields.terms;

    return {
      ...offerFields,
      termId: term.id,
      startDate: term.startDate,
      endDate: term.endDate,
      fromPrice,
    };
  }

  async createOffer(
    createOfferDto: CreateOfferDto,
    reqCreatedBy: User,
  ): Promise<Offer> {
    const { companyId, shipId, destinations, terms, ...createUserData } =
      createOfferDto;

    const requestUser = await this.userService.findOneByEmail(
      reqCreatedBy.email,
    );
    const company = await this.companyService.findOneById(companyId);
    const ship = await this.shipService.findOneById(shipId);

    const destinationEntities = destinations?.length
      ? await this.destinationService.findByIds(destinations)
      : [];

    createUserData.itinerary = await this.itineraryCityResolverService.resolve(
      createUserData.itinerary,
      reqCreatedBy.email,
    );

    await this.assertCabinTypesExist(terms);

    const offer = await this.dataSource.transaction(async (manager) => {
      let newOffer = new Offer();
      Object.assign(newOffer, createUserData, {
        company,
        ship,
        createdBy: requestUser,
      });

      newOffer = await manager.save(newOffer);

      const shareStats = new ShareStats();
      shareStats.offerId = newOffer.id;
      shareStats.facebookClicks = 0;
      shareStats.instagramClicks = 0;
      shareStats.tiktokClicks = 0;
      const savedShareStats = await manager.save(shareStats);

      newOffer.shareStatsId = savedShareStats.id;

      if (destinationEntities.length) {
        newOffer.destinations = destinationEntities;
      }

      await this.saveOfferTerms(manager, newOffer.id, companyId, terms);

      return manager.save(newOffer);
    });

    await this.logService.createLog(
      'Dodano ofertę: ' + offer.name,
      reqCreatedBy.email,
    );
    this.logger.log(`Created offer ${offer.id} (${offer.name})`);
    return offer;
  }

  async updateOffer(
    id: string,
    updateOfferDto: UpdateOfferDto,
    reqCreatedBy: User,
  ): Promise<Offer> {
    const { companyId, shipId, destinations, terms, ...updateOfferData } =
      updateOfferDto;

    const offer = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('offer.ship', 'ship')
      .where('offer.id = :id', { id })
      .getOne();

    if (!offer) {
      throw new AppException(API_ERRORS.OFFER_NOT_FOUND, { id });
    }

    if (terms?.length) {
      await this.assertCabinTypesExist(terms);
    }

    const requestUser = await this.userService.findOneByEmail(
      reqCreatedBy.email,
    );
    const company = await this.companyService.findOneById(companyId);
    const ship = await this.shipService.findOneById(shipId);

    updateOfferData.itinerary = await this.itineraryCityResolverService.resolve(
      updateOfferData.itinerary,
      reqCreatedBy.email,
    );

    Object.assign(offer, {
      ...updateOfferData,
      updatedBy: requestUser,
      company,
      ship,
    });

    if (destinations && destinations.length > 0) {
      offer.destinations =
        await this.destinationService.findByIds(destinations);
    }

    return this.dataSource.transaction(async (manager) => {
      const savedOffer = await manager.save(offer);

      if (terms?.length) {
        await manager.delete(OfferTerm, { offerId: savedOffer.id });
        await this.saveOfferTerms(manager, savedOffer.id, companyId, terms);
      }

      await this.logService.createLog(
        'Zaktualizowano ofertę: ' +
          savedOffer.name +
          ' (' +
          savedOffer.id +
          ')',
        reqCreatedBy.email,
      );
      this.logger.log(`Updated offer ${savedOffer.id} (${savedOffer.name})`);

      return savedOffer;
    });
  }

  async removeOffer(offerID: string, reqCreatedBy: User): Promise<boolean> {
    const offer = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.imageFile', 'imageFile')
      .leftJoinAndSelect('offer.pdfFile', 'pdfFile')
      .where('offer.id = :offerID', { offerID })
      .getOne();

    if (!offer) {
      throw new AppException(API_ERRORS.OFFER_NOT_FOUND, { id: offerID });
    }

    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .delete()
        .from('offer_destinations')
        .where('offerId = :offerID', { offerID })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(Offer)
        .where('id = :offerID', { offerID })
        .execute();
    });

    // Sprzątanie plików wykonujemy dopiero po zatwierdzonej transakcji SQL —
    // osierocony plik na dysku jest mniej szkodliwy niż usunięty rekord przy
    // błędzie w połowie transakcji.
    if (offer.imageFile) {
      await this.imageFileService.removeImageFile(offer.imageFile.path);
    }

    if (offer.pdfFile) {
      await this.pdfFileService.removePdfFile(offer.pdfFile.path);
    }

    await this.logService.createLog(
      'Usunięto ofertę: ' + offer.name + ' (' + offer.id + ')',
      reqCreatedBy.email,
    );
    this.logger.log(`Removed offer ${offer.id} (${offer.name})`);
    return true;
  }

  async deactivateOffer(offerId: string, reqCreatedBy: User): Promise<boolean> {
    const offer = await this.findOneById(offerId);
    const user = await this.userService.findOneByEmail(reqCreatedBy.email);

    if (!offer) {
      throw new AppException(API_ERRORS.OFFER_NOT_FOUND, { id: offerId });
    }

    offer.isActive = false;
    offer.updatedBy = user;
    await this.offerRepository.save(offer);

    await this.logService.createLog(
      'Dezaktywowano ofertę: ' + offer.name + ' (' + offer.id + ')',
      reqCreatedBy.email,
    );
    this.logger.log(`Deactivated offer ${offer.id} (${offer.name})`);
    return true;
  }

  async activateOffer(offerId: string, reqCreatedBy: User): Promise<boolean> {
    const offer = await this.findOneById(offerId);
    const user = await this.userService.findOneByEmail(reqCreatedBy.email);

    if (!offer) {
      throw new AppException(API_ERRORS.OFFER_NOT_FOUND, { id: offerId });
    }

    offer.isActive = true;
    offer.updatedBy = user;
    await this.offerRepository.save(offer);

    await this.logService.createLog(
      'Aktywowano ofertę: ' + offer.name + ' (' + offer.id + ')',
      reqCreatedBy.email,
    );
    this.logger.log(`Activated offer ${offer.id} (${offer.name})`);
    return true;
  }

  private async assertCabinTypesExist(terms: OfferTermDto[]): Promise<void> {
    const cabinTypeIds = Array.from(
      new Set(
        terms
          .flatMap((term) => term.prices.map((price) => price.cabinTypeId))
          .filter((cabinTypeId): cabinTypeId is string => !!cabinTypeId),
      ),
    );

    if (cabinTypeIds.length === 0) {
      return;
    }

    const foundCabinTypes = await this.cabinTypeService.findByIds(cabinTypeIds);

    if (foundCabinTypes.length !== cabinTypeIds.length) {
      throw new AppException(API_ERRORS.CABIN_TYPE_NOT_FOUND, { cabinTypeIds });
    }
  }

  private async saveOfferTerms(
    manager: EntityManager,
    offerId: string,
    companyId: string,
    terms: OfferTermDto[],
  ): Promise<void> {
    for (const termDto of terms) {
      const categoryEntities = termDto.categories?.length
        ? await this.categoryService.findByIds(termDto.categories)
        : undefined;

      const term = manager.create(OfferTerm, {
        offerId,
        startDate: termDto.startDate,
        endDate: termDto.endDate,
        sourceUrl: termDto.sourceUrl,
        categories: categoryEntities,
      });
      const savedTerm = await this.saveTermOrThrowOnDuplicate(manager, term);

      const prices = [];
      for (const priceDto of termDto.prices) {
        const cabinTypeId = await this.resolveCabinTypeId(
          manager,
          companyId,
          priceDto,
        );
        prices.push(
          manager.create(OfferTermPrice, {
            offerTermId: savedTerm.id,
            cabinTypeId,
            price: priceDto.price,
          }),
        );
      }
      await manager.save(prices);
    }
  }

  private async resolveCabinTypeId(
    manager: EntityManager,
    companyId: string,
    priceDto: OfferTermPriceDto,
  ): Promise<string> {
    if (priceDto.cabinTypeId) {
      return priceDto.cabinTypeId;
    }

    if (!priceDto.cabinTypeName) {
      throw new AppException(API_ERRORS.CABIN_TYPE_IDENTIFIER_REQUIRED);
    }

    const existingCabinType = await manager
      .createQueryBuilder(CabinType, 'cabinType')
      .where('cabinType.companyId = :companyId', { companyId })
      .andWhere('LOWER(cabinType.name) = LOWER(:name)', {
        name: priceDto.cabinTypeName,
      })
      .getOne();

    if (existingCabinType) {
      return existingCabinType.id;
    }

    const newCabinType = manager.create(CabinType, {
      companyId,
      name: priceDto.cabinTypeName,
    });
    const savedCabinType = await manager.save(newCabinType);
    return savedCabinType.id;
  }

  private async saveTermOrThrowOnDuplicate(
    manager: EntityManager,
    term: OfferTerm,
  ): Promise<OfferTerm> {
    try {
      return await manager.save(term);
    } catch (error) {
      // Kod '23505' to unique_violation w Postgresie - unikalny indeks
      // (offerId, startDate, endDate) z Task 1 złapał duplikat terminu.
      if (error?.code === '23505') {
        throw new AppException(API_ERRORS.OFFER_TERM_DUPLICATE, {
          offerId: term.offerId,
          startDate: term.startDate,
          endDate: term.endDate,
        });
      }
      throw error;
    }
  }
}
