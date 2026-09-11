import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapedOfferDraft } from './scraped-offer-draft.entity';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { ScraperClientService } from '@core/scraper-client/scraper-client.service';
import { CompanyService } from '@modules/company/company.service';
import { ShipService } from '@modules/ship/ship.service';
import { CabinTypeService } from '@modules/cabin-type/cabin-type.service';
import { LogService } from '@modules/log/log.service';
import { findBestMatch } from '@core/utils/fuzzy-match.util';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class OfferDiscoveryService {
  private readonly logger = new Logger(OfferDiscoveryService.name);

  constructor(
    @InjectRepository(ScrapedOfferDraft)
    private readonly draftRepository: Repository<ScrapedOfferDraft>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(OfferTerm)
    private readonly offerTermRepository: Repository<OfferTerm>,
    private readonly scraperClientService: ScraperClientService,
    private readonly companyService: CompanyService,
    private readonly shipService: ShipService,
    private readonly cabinTypeService: CabinTypeService,
    private readonly logService: LogService,
  ) {}

  public async runDiscovery(
    companyNames: string[],
    count: number,
    actorEmail: string,
  ): Promise<void> {
    const { urls, unmatchedNames } =
      await this.scraperClientService.discoverOffers(companyNames, count);

    for (const name of unmatchedNames) {
      await this.logService.createLog(
        `Discovery: nie znaleziono armatora "${name}" na rejsy4you.`,
        actorEmail,
      );
    }

    const newUrls = await this.filterOutExistingUrls(urls);

    for (const url of newUrls) {
      await this.discoverOneOffer(url, actorEmail);
    }

    await this.logService.createLog(
      `Discovery zakończone: ${newUrls.length} nowych ofert dodanych do poczekalni (z ${urls.length} znalezionych).`,
      actorEmail,
    );
  }

  public async listPendingDrafts(): Promise<ScrapedOfferDraft[]> {
    return this.draftRepository
      .createQueryBuilder('draft')
      .orderBy('draft.createdAt', 'DESC')
      .getMany();
  }

  public async getDraftById(id: string): Promise<ScrapedOfferDraft> {
    const draft = await this.draftRepository
      .createQueryBuilder('draft')
      .where('draft.id = :id', { id })
      .getOne();

    if (!draft) {
      throw new AppException(API_ERRORS.SCRAPED_OFFER_DRAFT_NOT_FOUND, { id });
    }

    return draft;
  }

  public async deleteDraft(id: string, actorEmail: string): Promise<boolean> {
    const draft = await this.getDraftById(id);

    await this.draftRepository
      .createQueryBuilder()
      .delete()
      .from(ScrapedOfferDraft)
      .where('id = :id', { id })
      .execute();

    await this.logService.createLog(
      `Usunięto draft oferty: ${draft.name} (${draft.id})`,
      actorEmail,
    );

    return true;
  }

  private async filterOutExistingUrls(urls: string[]): Promise<string[]> {
    if (urls.length === 0) {
      return [];
    }

    const [existingDrafts, existingOffers, existingTerms] = await Promise.all([
      this.draftRepository
        .createQueryBuilder('draft')
        .where('draft.sourceUrl IN (:...urls)', { urls })
        .getMany(),
      this.offerRepository
        .createQueryBuilder('offer')
        .where('offer.offerUrl IN (:...urls)', { urls })
        .getMany(),
      this.offerTermRepository
        .createQueryBuilder('term')
        .where('term.sourceUrl IN (:...urls)', { urls })
        .getMany(),
    ]);

    const existingUrls = new Set<string>([
      ...existingDrafts.map((draft) => draft.sourceUrl),
      ...existingOffers.map((offer) => offer.offerUrl),
      ...existingTerms.map((term) => term.sourceUrl),
    ]);

    return urls.filter((url) => !existingUrls.has(url));
  }

  private async discoverOneOffer(
    url: string,
    actorEmail: string,
  ): Promise<void> {
    let scraped;

    try {
      scraped = await this.scraperClientService.fullScrap(url);
    } catch (error) {
      await this.logService.createLog(
        `Discovery: nie udało się zescrapować "${url}": ${(error as Error).message}`,
        actorEmail,
      );
      return;
    }

    const companies = await this.companyService.findAll();
    const matchedCompanyId = findBestMatch(scraped.companyName, companies);

    const ships = matchedCompanyId
      ? await this.shipService.findShipsByCompany(matchedCompanyId)
      : [];
    const matchedShipId = matchedCompanyId
      ? findBestMatch(scraped.shipName, ships)
      : null;

    const cabinTypes = matchedCompanyId
      ? await this.cabinTypeService.findAllByCompany(matchedCompanyId)
      : [];

    const terms = scraped.terms.map((term) => ({
      startDate: term.startDate,
      endDate: term.endDate,
      sourceUrl: term.sourceUrl,
      cabinPrices: term.cabinPrices.map((cabinPrice) => ({
        label: cabinPrice.label,
        price: cabinPrice.price,
        matchedCabinTypeId: findBestMatch(cabinPrice.label, cabinTypes),
      })),
    }));

    const draft = this.draftRepository.create({
      name: scraped.name,
      shipName: scraped.shipName,
      companyNameRaw: scraped.companyName,
      matchedCompanyId,
      matchedShipId,
      imageUrl: scraped.imageUrl || null,
      pdfUrl: scraped.pdfUrl || null,
      itinerary: scraped.itinerary,
      terms,
      sourceUrl: url,
    });

    await this.draftRepository.save(draft);
    this.logger.log(`Discovery: draft created for "${scraped.name}" (${url})`);
  }
}
