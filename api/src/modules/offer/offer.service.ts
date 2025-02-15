import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
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
import axios from 'axios';
import { Scrapper } from '../../interfaces/scrapper';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @Inject(forwardRef(() => ImageFileService))
    private readonly imageFileService: ImageFileService,
    private readonly pdfFileService: PdfFileService,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly shipService: ShipService,
    private readonly categoryService: CategoryService,
    private readonly destinationService: DestinationService,
    private readonly shareStatsService: ShareStatsService,
  ) {}

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
      active,
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

    if (active) {
      whereClauses.push('offer.isActive = (:...active)');
      whereParams.active = active;
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

  findOneById(id: string): Promise<Offer> {
    return this.offerRepository.findOneBy({ id });
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

  async createOffer(
    createOfferDto: CreateOfferDto,
    reqCreatedBy: User,
  ): Promise<Offer> {
    const { companyId, shipId, destinations, categories, ...createUserData } =
      createOfferDto;

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

    return this.offerRepository.save(offer);
  }

  async updateOffer(
    id: string,
    updateOfferDto: UpdateOfferDto,
    reqCreatedBy: User,
  ): Promise<Offer> {
    const { companyId, shipId, destinations, categories, ...updateOfferData } =
      updateOfferDto;

    const existingOffer = await this.offerRepository.findOne({
      where: { id },
      relations: ['company', 'ship'],
    });

    if (!existingOffer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    const requestUser = await this.userService.findOneByEmail(
      reqCreatedBy.email,
    );
    const company = await this.companyService.findOneById(companyId);
    const ship = await this.shipService.findOneById(shipId);

    Object.assign(existingOffer, {
      ...updateOfferData,
      updatedBy: requestUser,
      company,
      ship,
    });

    if (categories && categories.length > 0) {
      existingOffer.categories =
        await this.categoryService.findByIds(categories);
    }

    if (destinations && destinations.length > 0) {
      existingOffer.destinations =
        await this.destinationService.findByIds(destinations);
    }

    return this.offerRepository.save(existingOffer);
  }

  async syncOfferPrice(offerID: string): Promise<boolean> {
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

    const scrapeResult = await this.syncOffer(offer.id, offer.offerUrl);
    console.log(scrapeResult);

    if (!scrapeResult.exists) {
      offer.isActive = false;
      await this.offerRepository.save(offer);
      return true;
    }

    if (scrapeResult.price !== offer.price) {
      offer.price = scrapeResult.price;
      await this.offerRepository.save(offer);
    }

    return true;
  }

  async removeOffer(offerID: string): Promise<boolean> {
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

    return true;
  }

  async deactivateOffer(offerId: string): Promise<boolean> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    offer.isActive = false;
    await this.offerRepository.save(offer);
    return true;
  }

  async activateOffer(offerId: string): Promise<boolean> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    offer.isActive = true;
    await this.offerRepository.save(offer);
    return true;
  }

  async syncOffer(offerId: string, url: string): Promise<Scrapper> {
    try {
      const response = await axios.post('http://localhost:3001/price-scrap', {
        id: offerId,
        url,
      });

      const { exists, price } = response.data;

      return { id: offerId, exists, price };
    } catch (error) {
      console.error('Błąd podczas scrapowania:', error.message || error);
      throw new Error('Error while scraping cruise price');
    }
  }
}
