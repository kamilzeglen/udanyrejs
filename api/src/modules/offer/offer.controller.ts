import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {OfferService} from './offer.service';
import {CreateOfferDto} from "@modules/offer/dto/create-offer.dto";
import {Offer} from "@modules/offer/offer.entity";
import {AuthGuard} from "@modules/auth/guards/auth.guard";
import {FileInterceptor} from "@nestjs/platform-express";
import {SaveTypes} from "../../interfaces/save-update-file-types";
import {ImageFileService} from "@modules/image-file/image-file.service";

@Controller('offers')
export class OfferController {
  constructor(
    private readonly offerService: OfferService,
    private readonly imageFileService: ImageFileService
  ) {
  }

  @Get('/')
  async searchOffers(): Promise<Offer[]> {
    return await this.offerService.findAll();
  }

  @Get('/:category')
  async searchOffersByCategory(@Param('category') category: string): Promise<Offer[]> {
    if (category) {
      return await this.offerService.findOffersByCategory(category);
    }
  }

  @Get('/details/:offerID')
  async getOneOffer(@Param('offerID') offerID: string): Promise<Offer> {
    return await this.offerService.findOneById(offerID);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createOffer(
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: { user: any },
  ): Promise<Offer> {
    return await this.offerService.createOffer(createOfferDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/:offerID')
  async updateOffer(
    @Param('offerID') offerID: string,
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: { user: any },
  ): Promise<Offer> {
    return await this.offerService.updateOffer(offerID, createOfferDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete('/:offerID')
  async removeOffer(@Param('offerID') offerID: string): Promise<boolean> {
    return await this.offerService.removeOffer(offerID);
  }

  @Post('/imageFile/:targetID')
  @UseInterceptors(FileInterceptor('imageFile'))
  async findAll(
    @Param('imageFileType') imageFileType: string,
    @Param('targetId') targetId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('Brak pliku w żądaniu');
    }

    if (imageFileType === 'offer') {
      const offer = await this.offerService.findOneById(targetId);
      return this.imageFileService.createFile(file, SaveTypes.OFFER, offer)
    }
  }
}
