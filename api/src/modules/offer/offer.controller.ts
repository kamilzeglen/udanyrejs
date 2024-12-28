import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {OfferService} from './offer.service';
import {CreateOfferDto} from "@modules/offer/dto/create-offer.dto";
import {Offer} from "@modules/offer/offer.entity";
import {AuthGuard} from "@modules/auth/guards/auth.guard";
import {AnyFilesInterceptor} from "@nestjs/platform-express";

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

  @UseGuards(AuthGuard)
  @Post('/')
  @UseInterceptors(AnyFilesInterceptor())
  async createOffer(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: { user: any },
  ): Promise<Offer> {
    const imageFile = files.find((file) => file.fieldname === 'image');
    const pdfFile = files.find((file) => file.fieldname === 'pdf');

    return await this.offerService.createOffer(createOfferDto, req.user, imageFile, pdfFile);
  }

  @UseGuards(AuthGuard)
  @Post('/:offerID')
  @UseInterceptors(AnyFilesInterceptor())
  async updateOffer(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('offerID') offerID: string,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<Offer> {
    const imageFile = files.find((file) => file.fieldname === 'image');
    const pdfFile = files.find((file) => file.fieldname === 'pdf');

    return await this.offerService.updateOffer(offerID, createOfferDto, imageFile, pdfFile);
  }

  @UseGuards(AuthGuard)
  @Delete('/:offerID')
  async removeOffer(@Param('offerID') offerID: string): Promise<boolean> {
    return await this.offerService.removeOffer(offerID);
  }
}
