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
  ) {
  }

  async findAll(): Promise<any[]> {
    return await this.offerRepository.find();
  }

  async findOne(id: string): Promise<any> {
    return  this.offerRepository.findOneBy({id});
  }

  async createOffer(
    createOfferDto: CreateOfferDto,
    reqCreatedBy: any,
    imageFile: Express.Multer.File,
    pdfFile: Express.Multer.File,
  ): Promise<Offer> {
    const {companyId, shipId, ...createUserData} = createOfferDto;
    console.log(createOfferDto)

    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const company = await this.companyService.findOneByID(companyId);
    const ship = await this.shipService.findOneByID(shipId);

    const offer = this.offerRepository.create({
      ...createUserData,
      company,
      ship,
      createdBy,
    });

    const savedOffer = await this.offerRepository.save(offer);

    if (imageFile) {
      savedOffer.imageFile = await this.imageFileService.saveFile(imageFile, savedOffer);
    }

    if (pdfFile) {
      savedOffer.pdfFile = await this.pdfFileService.saveFile(pdfFile, savedOffer);
    }

    return this.offerRepository.save(savedOffer);
  }

async updateOffer(
  id: string,
  updateOfferDto: CreateOfferDto,
  imageFile: Express.Multer.File | null,
  pdfFile: Express.Multer.File | null,
): Promise<Offer> {
  const existingOffer = await this.offerRepository.findOne({
    where: { id },
    relations: ['company', 'ship'],
  });

  if (!existingOffer) {
    throw new NotFoundException(`Offer with ID ${id} not found`);
  }

  const company = updateOfferDto.companyId
    ? await this.companyService.findOneByID(updateOfferDto.companyId)
    : existingOffer.company;

  const ship = updateOfferDto.shipId
    ? await this.shipService.findOneByID(updateOfferDto.shipId)
    : existingOffer.ship;

  Object.assign(existingOffer, {
    ...updateOfferDto,
    company,
    ship,
    updatedAt: new Date(),
  });

  if (imageFile) {
    existingOffer.imageFile = await this.imageFileService.updateFile(imageFile, existingOffer);
  }

  if (pdfFile) {
    existingOffer.pdfFile = await this.pdfFileService.updateFile(pdfFile, existingOffer);
  }

  // Zapisz zmiany w bazie danych
  return this.offerRepository.save(existingOffer);
}


  async removeOffer(offerID: string): Promise<boolean> {
    return !!(await this.offerRepository.softDelete(offerID));
  }
}
