import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {OfferService} from './offer.service';
import {CreateOfferDto} from "@modules/offer/dto/create-offer.dto";
import {Offer} from "@modules/offer/offer.entity";

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {
  }

  @Get('/')
  async getAllOffers(): Promise<any[]> {
    return await this.offerService.findAll();
  }

  @Get('/:offerID')
  async getOneOffer(@Param('offerID') offerID: string): Promise<any[]> {
    return await this.offerService.findOne(offerID);
  }

  @Post('/')
  async createOffer(@Body() createOfferDto: CreateOfferDto): Promise<Offer> {
    return await this.offerService.createOffer(createOfferDto);
  }

  @Delete('/:offerID')
  async removeOffer(@Param('offerID') offerID: string): Promise<boolean> {
    return await this.offerService.removeOffer(offerID);
  }
}
