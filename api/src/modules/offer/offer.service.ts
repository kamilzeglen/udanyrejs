import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Offer} from './offer.entity';
import {CreateOfferDto} from "./dto/create-offer.dto";
import {ImageFileService} from "@modules/image-file/image-file.service";
import {UserService} from "@modules/user/user.service";
import {CompanyService} from "@modules/company/company.service";
import {ShipService} from "@modules/ship/ship.service";
import {PdfFileService} from "@modules/pdf-file/pdf-file.service";
import {DestinationService} from "@modules/destination/destination.service";
import {CategoryService} from "@modules/category/category.service";
import {UpdateOfferDto} from "@modules/offer/dto/update-offer.dto";
import {User} from "@modules/user/user.entity";
import {ItineraryService} from "@modules/itinerary/itinerary.service";

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private readonly imageFileService: ImageFileService,
    private readonly pdfFileService: PdfFileService,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly shipService: ShipService,
    private readonly categoryService: CategoryService,
    private readonly destinationService: DestinationService,
    private readonly itineraryService: ItineraryService,
  ) {
  }

  async findAll(): Promise<any[]> {
    return await this.offerRepository.find();
  }

  findOneById(id: string): Promise<Offer> {
    return this.offerRepository.findOneBy({id});
  }

  async findOffersByCategory(category?: string): Promise<Offer[]> {
    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('company.imageFile', 'companyImageFile')  // Dodanie ImageFile dla Company
      .leftJoinAndSelect('offer.categories', 'categories')
      .leftJoinAndSelect('offer.imageFile', 'imageFile');

    if (category) {
      queryBuilder.where('LOWER(categories.url) = LOWER(:category)', {category});
    }

    return queryBuilder.getMany();
  }

  async createOffer(
    createOfferDto: CreateOfferDto,
    reqCreatedBy: User,
  ): Promise<Offer> {
    const {companyId, shipId, destinations, categories, itinerary, ...createUserData} = createOfferDto;

    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const company = await this.companyService.findOneByID(companyId);
    const ship = await this.shipService.findOneByID(shipId);

    const offer: Offer = this.offerRepository.create({
      ...createUserData,
      company,
      ship,
      createdBy,
      updatedBy
    });

    const savedOffer = await this.offerRepository.save(offer);

    if (itinerary && itinerary.length > 0) {
      await this.itineraryService.createItineraries(itinerary, savedOffer, reqCreatedBy.id);
    }

    if (categories && categories.length > 0) {
      savedOffer.categories = await this.categoryService.findByIds(categories);
    }

    if (destinations && destinations.length > 0) {
      savedOffer.destinations = await this.destinationService.findByIds(destinations);
    }

    console.log(savedOffer)
    return this.offerRepository.save(savedOffer);
  }

async updateOffer(
  id: string,
  updateOfferDto: UpdateOfferDto,
  reqCreatedBy: User,
): Promise<Offer> {
  const {companyId, shipId, destinations, categories, itinerary, ...updateOfferData} = updateOfferDto;

  // Pobierz istniejącą ofertę z relacjami
  const existingOffer = await this.offerRepository.findOne({
    where: { id },
    relations: ['company', 'ship', 'itinerary', 'categories', 'destinations'],
  });

  if (!existingOffer) {
    throw new NotFoundException(`Offer with ID ${id} not found`);
  }

  // Ustawienie użytkownika aktualizującego
  const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);
  const company = await this.companyService.findOneByID(companyId);
  const ship = await this.shipService.findOneByID(shipId);

  // Zaktualizowanie podstawowych danych oferty
  Object.assign(existingOffer, {
    ...updateOfferData,
    updatedBy,
    company,
    ship,
    updatedAt: new Date(),
  });

  if (existingOffer.itinerary && existingOffer.itinerary.length > 0) {
    await this.itineraryService.deleteItineraries(existingOffer);
  }

  if (itinerary && itinerary.length > 0) {
    // await this.itineraryService.updateItineraries(itinerary, existingOffer, reqCreatedBy.id);
  }

  // Aktualizacja kategorii
  if (categories && categories.length > 0) {
    existingOffer.categories = await this.categoryService.findByIds(categories);
  }

  // Aktualizacja destynacji
  if (destinations && destinations.length > 0) {
    existingOffer.destinations = await this.destinationService.findByIds(destinations);
  }

  return await this.offerRepository.save(existingOffer);
}

async removeOffer(offerID: string): Promise<boolean> {
  const offer = await this.offerRepository.findOne({
    where: { id: offerID },
    relations: ['categories', 'imageFile', 'pdfFile'],
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  // Usuń powiązania z kategoriami w tabeli pośredniczącej
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

  // Usuń pliki (jeśli istnieją)
  if (offer.imageFile) {
    await this.imageFileService.removeImageFile(offer.imageFile.path);
  }

  if (offer.pdfFile) {
    await this.pdfFileService.removePdfFile(offer.pdfFile.path);
  }

  // Usuń ofertę
  await this.offerRepository
    .createQueryBuilder()
    .delete()
    .from(Offer)
    .where('id = :offerID', { offerID })
    .execute();

  return true;
}
}
