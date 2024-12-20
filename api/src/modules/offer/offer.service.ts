import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Offer} from './offer.entity';
import {CreateOfferDto} from "./dto/create-offer.dto";
import {ImageFileService} from "@modules/image-file/image-file.service";

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private readonly imageFileService: ImageFileService,
  ) {
  }

  async findAll(): Promise<any[]> {
    return await this.offerRepository.find();
  }

  async findOne(id: string): Promise<any> {
    return  this.offerRepository.findOneBy({id});
  }

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {

    const {imageFile, ...createUserDate} = createOfferDto

    const offer = this.offerRepository.create(createUserDate);
    const savedOffer = await this.offerRepository.save(offer);

    if (createOfferDto.imageFile) {
      this.imageFileService.saveFile(createOfferDto.imageFile, savedOffer)
    }

    return await this.offerRepository.save(savedOffer);
  }

  async removeOffer(offerID: string): Promise<boolean> {
    return !!(await this.offerRepository.softDelete(offerID));
  }
}
