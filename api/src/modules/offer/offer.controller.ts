import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from '@modules/offer/dto/create-offer.dto';
import { Offer } from '@modules/offer/offer.entity';
import { AuthGuard } from '@core/guards/auth.guard';
import { SearchOffersDto } from '@modules/offer/dto/search-offers.dto';
import { PaginationResp } from '../../interfaces/pagination-response';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post('/search')
  async searchOffers(
    @Body() searchOfferDto: SearchOffersDto,
  ): Promise<{ data: Partial<Offer>[]; pagination: PaginationResp }> {
    return await this.offerService.searchOffers(searchOfferDto);
  }

  @Get('/:category')
  async searchOffersByCategory(
    @Param('category') category: string,
  ): Promise<Offer[]> {
    if (category) {
      return await this.offerService.findOffersByCategory(category);
    }
  }

  @Get('/details/:offerId')
  async getOneOffer(@Param('offerId') offerId: string): Promise<Offer> {
    return await this.offerService.findOneById(offerId);
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
  @Patch('/:offerId')
  async updateOffer(
    @Param('offerId') offerId: string,
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: { user: any },
  ): Promise<Offer> {
    return await this.offerService.updateOffer(
      offerId,
      createOfferDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:offerId')
  async removeOffer(
    @Param('offerId') offerId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.offerService.removeOffer(offerId, req.user);
  }

  @UseGuards(AuthGuard)
  @Get('/:offerId/deactivate')
  async deactivateOffer(
    @Param('offerId') offerId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.offerService.deactivateOffer(offerId, req.user);
  }

  @UseGuards(AuthGuard)
  @Get('/:offerId/activate')
  async activateOffer(
    @Param('offerId') offerId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.offerService.activateOffer(offerId, req.user);
  }
}
