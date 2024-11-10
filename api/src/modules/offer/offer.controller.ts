import {Body, Controller, Delete, Get, Header, Param, Post} from '@nestjs/common';
import {OfferService} from './offer.service';
import {CreateOfferDto} from "./dto/create-offer.dto";
import {Offer} from "./offer.entity";

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {
  }

  @Get()
  @Header('Access-Control-Allow-Origin', 'https://udanyrejs.pl')
  async getAllOffers(): Promise<any[]> {
    return await this.offerService.findAll();
  }

  @Get('/:offerID')
  @Header('Access-Control-Allow-Origin', 'https://udanyrejs.pl')
  async getOneOffer(@Param('offerID') offerID: string): Promise<any[]> {
    return await this.offerService.findOne(offerID);
  }

  @Post('/add')
  @Header('Access-Control-Allow-Origin', 'https://udanyrejs.pl')
  async createOffer(@Body() createOfferDto: CreateOfferDto): Promise<Offer> {
    return await this.offerService.createOffer(createOfferDto);
  }

  @Delete('/remove/:offerID')
  @Header('Access-Control-Allow-Origin', 'https://udanyrejs.pl')
  async removeOffer(@Param('offerID') offerID: string): Promise<boolean> {
    return await this.offerService.removeOffer(offerID);
  }
}
