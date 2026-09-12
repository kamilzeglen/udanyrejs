import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OfferService } from './offer.service';
import { CreateOfferDto } from '@modules/offer/dto/create-offer.dto';
import { Offer } from '@modules/offer/offer.entity';
import { AuthGuard } from '@core/guards/auth.guard';
import { SearchOffersDto } from '@modules/offer/dto/search-offers.dto';
import {
  ScraperClientService,
  ScrapeOfferResponse,
} from '@core/scraper-client/scraper-client.service';
import { isAllowedScrapeHost } from '@core/scraper-client/allowed-scrape-host.util';
import { ScrapeOfferDto } from '@modules/offer/dto/scrape-offer.dto';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import { OfferSyncResult, OfferSyncService } from './offer-sync.service';
import { OfferDiscoveryService } from './offer-discovery.service';
import { DiscoverOffersDto } from '@modules/offer/dto/discover-offers.dto';
import { ScrapedOfferDraft } from '@modules/offer/scraped-offer-draft.entity';
import { CompanyService } from '@modules/company/company.service';
import { Company } from '@modules/company/company.entity';

@Controller('offers')
export class OfferController {
  private readonly logger = new Logger(OfferController.name);

  constructor(
    private readonly offerService: OfferService,
    private readonly scraperClientService: ScraperClientService,
    private readonly offerSyncService: OfferSyncService,
    private readonly offerDiscoveryService: OfferDiscoveryService,
    private readonly companyService: CompanyService,
  ) {}

  @Post('/search')
  async searchOffers(@Body() searchOfferDto: SearchOffersDto) {
    return await this.offerService.searchOffers(searchOfferDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(AuthGuard)
  @Post('/scrape')
  async scrapeOffer(
    @Body() scrapeOfferDto: ScrapeOfferDto,
  ): Promise<ScrapeOfferResponse> {
    const allowedHosts = (process.env.ALLOWED_SCRAPE_HOSTS ?? '')
      .split(',')
      .map((host) => host.trim());
    const urlIsAllowed = isAllowedScrapeHost(scrapeOfferDto.url, allowedHosts);

    if (!urlIsAllowed) {
      throw new AppException(API_ERRORS.SCRAPE_URL_NOT_ALLOWED);
    }

    return this.scraperClientService.scrapeOffer(scrapeOfferDto.url);
  }

  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  @UseGuards(AuthGuard)
  @Post('/discover')
  async discoverOffers(
    @Body() discoverOffersDto: DiscoverOffersDto,
    @Req() req: { user: any },
  ): Promise<{ started: boolean }> {
    const companies = await Promise.all(
      discoverOffersDto.companyIds.map((id) =>
        this.companyService.findOneById(id),
      ),
    );
    const companyNames = companies
      .filter((company): company is Company => Boolean(company))
      .map((company) => company.name);

    this.offerDiscoveryService
      .runDiscovery(companyNames, discoverOffersDto.count, req.user.email)
      .catch((error) => {
        this.logger.error(`Discovery run failed: ${(error as Error).message}`);
      });

    return { started: true };
  }

  @UseGuards(AuthGuard)
  @Get('/discover/drafts')
  async listDiscoveryDrafts(): Promise<ScrapedOfferDraft[]> {
    return this.offerDiscoveryService.listPendingDrafts();
  }

  @UseGuards(AuthGuard)
  @Get('/discover/drafts/:draftId')
  async getDiscoveryDraft(
    @Param('draftId') draftId: string,
  ): Promise<ScrapedOfferDraft> {
    return this.offerDiscoveryService.getDraftById(draftId);
  }

  @UseGuards(AuthGuard)
  @Delete('/discover/drafts/:draftId')
  async deleteDiscoveryDraft(
    @Param('draftId') draftId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return this.offerDiscoveryService.deleteDraft(draftId, req.user.email);
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

  @UseGuards(AuthGuard)
  @Post('/:offerId/sync')
  async syncOffer(@Param('offerId') offerId: string): Promise<OfferSyncResult> {
    const offer = await this.offerService.findOneById(offerId);

    if (!offer) {
      throw new AppException(API_ERRORS.OFFER_NOT_FOUND, { id: offerId });
    }

    const hasSyncableTerm = offer.terms?.some((term) => term.sourceUrl);
    if (!hasSyncableTerm) {
      throw new AppException(API_ERRORS.OFFER_SYNC_NO_URL, { id: offerId });
    }

    return this.offerSyncService.syncOffer(offer);
  }
}
