import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  LessThanOrEqual,
  Not,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { Offer } from './offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { UserService } from '@modules/user/user.service';
import { CompanyService } from '@modules/company/company.service';
import { ShipService } from '@modules/ship/ship.service';
import { PdfFileService } from '@modules/pdf-file/pdf-file.service';
import { DestinationService } from '@modules/destination/destination.service';
import { CategoryService } from '@modules/category/category.service';
import { UpdateOfferDto } from '@modules/offer/dto/update-offer.dto';
import { User } from '@modules/user/user.entity';
import { SearchOffersDto } from '@modules/offer/dto/search-offers.dto';
import { ShareStatsService } from '@modules/share-stats/share-stats.service';
import { PaginationResp } from '../../interfaces/pagination-response';
import { LogService } from '@modules/log/log.service';
import { ScrapperService } from '@modules/scrapper/scrapper.service';
import { PdfFileType } from '../../interfaces/save-update-file-types';

@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);

  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @Inject(forwardRef(() => ImageFileService))
    private readonly imageFileService: ImageFileService,
    @Inject(forwardRef(() => ScrapperService))
    private readonly scrapperService: ScrapperService,
    private readonly pdfFileService: PdfFileService,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly shipService: ShipService,
    private readonly categoryService: CategoryService,
    private readonly destinationService: DestinationService,
    private readonly shareStatsService: ShareStatsService,
    private readonly logService: LogService,
  ) {}

  async findOneById(id: string): Promise<Offer> {
    return await this.offerRepository.findOneBy({ id });
  }

  async findAllWithURL(): Promise<Offer[]> {
    return await this.offerRepository.find({
      where: {
        offerUrl: Not(IsNull()),
        isActive: true,
      },
    });
  }

  async findActiveOffers(opts?: { lessThan: Date }): Promise<Offer[]> {
    if (opts.lessThan) {
      return await this.offerRepository.find({
        where: {
          startDate: LessThanOrEqual(opts.lessThan),
          isActive: true,
        },
      });
    } else {
      return await this.offerRepository.find({
        where: {
          isActive: true,
        },
      });
    }
  }

  async findOffersByCategory(category?: string): Promise<Offer[]> {
    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('company.imageFile', 'companyImageFile')
      .leftJoinAndSelect('offer.categories', 'categories')
      .leftJoinAndSelect('offer.imageFile', 'imageFile');

    if (category) {
      queryBuilder.where('LOWER(categories.url) = LOWER(:category)', {
        category,
      });
    }

    return queryBuilder.getMany();
  }

  async deactivate(offer: Offer): Promise<Offer> {
    offer.isActive = false;
    return await this.offerRepository.save(offer);
  }

  async activate(offer: Offer): Promise<Offer> {
    offer.isActive = true;
    return await this.offerRepository.save(offer);
  }

  async updatedBy(offer: Offer, user: User): Promise<Offer> {
    offer.updatedBy = user;
    return await this.offerRepository.save(offer);
  }

  async searchOffers(
    searchOffersDto: SearchOffersDto,
  ): Promise<{ data: Partial<Offer>[]; pagination: PaginationResp }> {
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
    const orderByWithAlias = orderBy.includes('.')
      ? orderBy
      : `offer.${orderBy}`;

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
      whereClauses.push('offer.startDate >= :startDate');
      whereParams.startDate = startDate;
    }

    if (endDate) {
      whereClauses.push('offer.endDate <= :endDate');
      whereParams.endDate = endDate;
    }

    if (destinationIdList && destinationIdList.length > 0) {
      whereClauses.push('destination.id IN (:...destinationIdList)');
      whereParams.destinationIdList = destinationIdList;
    }

    const dbQuery = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('offer.ship', 'ship')
      .leftJoinAndSelect('ship.company', 'shipCompany')
      .leftJoinAndSelect('offer.imageFile', 'offerImageFile')
      .leftJoinAndSelect('offer.pdfFile', 'pdfFile')
      .leftJoinAndSelect('company.imageFile', 'companyImageFile')
      .leftJoinAndSelect('ship.imageFile', 'shipImageFile')
      .leftJoinAndSelect('offer.categories', 'category')
      .leftJoinAndSelect('offer.destinations', 'destination')
      .leftJoinAndSelect('offer.shareStats', 'shareStats')
      .where(whereClauses.join(' AND '), whereParams)
      .select([
        'offer.id',
        'offer.name',
        'offer.price',
        'offer.offerUrl',
        'offer.isActive',
        'offer.isRecommended',
        'offer.startDate',
        'offer.endDate',
        'offer.company',
        'offer.createdAt',
        'offer.updatedAt',
        'offerImageFile.id',
        'offerImageFile.name',
        'offerImageFile.path',
        'pdfFile.id',
        'pdfFile.name',
        'pdfFile.path',
        'ship.id',
        'ship.name',
        'company.id',
        'company.name',
        'companyImageFile.id',
        'companyImageFile.name',
        'companyImageFile.path',
        'shipImageFile.id',
        'shipImageFile.name',
        'shipImageFile.path',
        'shareStats',
      ])
      .skip(offset)
      .take(limit)
      .orderBy(orderByWithAlias, orderDir.toUpperCase() as any, 'NULLS LAST');

    const [offers, count] = await dbQuery.getManyAndCount();

    return {
      data: offers,
      pagination: {
        limit,
        offset,
        orderDir,
        orderBy: orderByWithAlias,
        all: count,
        count: offers.length,
      },
    };
  }

  async createOffer(
    createOfferDto: CreateOfferDto,
    reqCreatedBy: User,
  ): Promise<Offer> {
    const { companyId, shipId, destinations, categories, ...createUserData } =
      createOfferDto;

    const existingOffer = await this.offerRepository.findOne({
      where: {
        name: createUserData.name,
        startDate: createUserData.startDate,
        endDate: createUserData.endDate,
        companyId,
        shipId,
      },
      withDeleted: false,
    });

    if (existingOffer) {
      throw new BadRequestException(
        'Oferta o tej nazwie i datach już istnieje.',
      );
    }

    const requestUser = await this.userService.findOneByEmail(
      reqCreatedBy.email,
    );
    const company = await this.companyService.findOneById(companyId);
    const ship = await this.shipService.findOneById(shipId);

    let offer = new Offer();
    Object.assign(offer, createUserData, {
      company,
      ship,
      createdBy: requestUser,
    });

    offer = await this.offerRepository.save(offer);

    const shareStats = await this.shareStatsService.createForOffer(offer);

    offer.shareStatsId = shareStats.id;
    offer = await this.offerRepository.save(offer);

    if (categories?.length) {
      offer.categories = await this.categoryService.findByIds(categories);
    }
    if (destinations?.length) {
      offer.destinations =
        await this.destinationService.findByIds(destinations);
    }

    await this.logService.createLog(
      'Dodano ofertę: ' + offer.name,
      reqCreatedBy.email,
    );
    return this.offerRepository.save(offer);
  }

  async updateOffer(
    id: string,
    updateOfferDto: UpdateOfferDto,
    reqCreatedBy: User,
  ): Promise<Offer> {
    const { companyId, shipId, destinations, categories, ...updateOfferData } =
      updateOfferDto;

    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['company', 'ship'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    const requestUser = await this.userService.findOneByEmail(
      reqCreatedBy.email,
    );
    const company = await this.companyService.findOneById(companyId);
    const ship = await this.shipService.findOneById(shipId);

    Object.assign(offer, {
      ...updateOfferData,
      updatedBy: requestUser,
      company,
      ship,
    });

    if (categories && categories.length > 0) {
      offer.categories = await this.categoryService.findByIds(categories);
    }

    if (destinations && destinations.length > 0) {
      offer.destinations =
        await this.destinationService.findByIds(destinations);
    }

    await this.logService.createLog(
      'Zaktualizowano ofertę: ' + offer.name + ' (' + offer.id + ')',
      reqCreatedBy.email,
    );
    return this.offerRepository.save(offer);
  }

  async removeOffer(offerID: string, reqCreatedBy: User): Promise<boolean> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerID },
      relations: ['categories', 'imageFile', 'pdfFile'],
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    await this.offerRepository
      .createQueryBuilder()
      .delete()
      .from('offer_destinations')
      .where('offerId = :offerID', { offerID })
      .execute();

    await this.offerRepository
      .createQueryBuilder()
      .delete()
      .from('offer_categories')
      .where('offerId = :offerID', { offerID })
      .execute();

    if (offer.imageFile) {
      await this.imageFileService.removeImageFile(offer.imageFile.path);
    }

    if (offer.pdfFile) {
      await this.pdfFileService.removePdfFile(offer.pdfFile.path);
    }

    await this.offerRepository
      .createQueryBuilder()
      .delete()
      .from(Offer)
      .where('id = :offerID', { offerID })
      .execute();

    await this.logService.createLog(
      'Usunięto ofertę: ' + offer.name + ' (' + offer.id + ')',
      reqCreatedBy.email,
    );
    return true;
  }

  async deactivateOffer(offerId: string, reqCreatedBy: User): Promise<boolean> {
    const offer = await this.findOneById(offerId);
    const user = await this.userService.findOneByEmail(reqCreatedBy.email);

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    this.deactivate(offer);
    this.updatedBy(offer, user);

    await this.logService.createLog(
      'Dezaktywowano ofertę: ' + offer.name + ' (' + offer.id + ')',
      reqCreatedBy.email,
    );
    return true;
  }

  async activateOffer(offerId: string, reqCreatedBy: User): Promise<boolean> {
    const offer = await this.findOneById(offerId);
    const user = await this.userService.findOneByEmail(reqCreatedBy.email);

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    this.activate(offer);
    this.updatedBy(offer, user);

    await this.logService.createLog(
      'Aktywowano ofertę: ' + offer.name + ' (' + offer.id + ')',
      reqCreatedBy.email,
    );
    return true;
  }

  async syncOffer(offerID: string, reqCreatedBy?: User): Promise<boolean> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerID },
      relations: ['categories', 'imageFile', 'pdfFile'],
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (!offer.offerUrl) {
      throw new Error('Offer URL not found');
    }

    const scrapeResult = await this.scrapperService.scrapSyncOffer(
      offer.id,
      offer.offerUrl,
    );

    if (!scrapeResult.exists) {
      const logMessage =
        'Dezaktywowano ofertę: ' +
        offer.name +
        ' (' +
        offer.id +
        ') (Oferta nie istnieje)';

      this.logger.log(logMessage);
      offer.isActive = false;
      await this.offerRepository.save(offer);

      if (reqCreatedBy) {
        await this.logService.createLog(logMessage, reqCreatedBy.email);
      } else {
        await this.logService.createLog(logMessage, 'SYSTEM');
      }

      return true;
    }

    if (Number(scrapeResult.price) !== Number(offer.price)) {
      // PDF
      const pdfFile = await this.pdfFileService.downloadPdfFromUrl(
        scrapeResult.pdfUrl,
      );

      await this.pdfFileService.updatePdfFile(
        offer.id,
        PdfFileType.OFFER,
        pdfFile,
        'SYSTEM',
        scrapeResult.pdfUrl,
      );

      // Offer
      const logMessage =
        'Zaktualizowano ofertę: ' +
        offer.name +
        ' (' +
        offer.id +
        ') (' +
        offer.price +
        ' € -> ' +
        scrapeResult.price +
        ' €)';

      offer.price = scrapeResult.price;
      await this.offerRepository.save(offer);

      this.logger.log(logMessage);

      if (reqCreatedBy) {
        await this.logService.createLog(logMessage, reqCreatedBy.email);
      } else {
        await this.logService.createLog(logMessage, 'SYSTEM');
      }
    }

    return true;
  }
}
