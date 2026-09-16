import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  ScrapedCabinPrice,
  ScrapedPageNotFoundError,
  ScrapedSiblingLink,
  ScrapedTermPageResponse,
  ScraperClientService,
} from '@core/scraper-client/scraper-client.service';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { OfferTermPrice } from './offer-term-price.entity';
import { LogService } from '@modules/log/log.service';
import { OfferService } from './offer.service';
import { CabinType } from '@modules/cabin-type/cabin-type.entity';
import { CabinTypeService } from '@modules/cabin-type/cabin-type.service';
import { PdfFileService } from '@modules/pdf-file/pdf-file.service';
import { ImageFileService } from '@modules/image-file/image-file.service';
import {
  ImageFileType,
  PdfFileType,
} from '../../interfaces/save-update-file-types';
import { findBestMatch } from '@core/utils/fuzzy-match.util';
import { isSameDateRange } from '@core/utils/date-range.util';
import {
  OfferTermDto,
  OfferTermPriceDto,
} from '@modules/offer/dto/offer-term.dto';

function toGrosze(euroPrice: number): number {
  return Math.round(euroPrice * 100);
}

export interface OfferSyncResult {
  offerDeactivated: boolean;
  termsAdded: number;
  termsDeactivated: number;
  termsReactivated: number;
  termsSkipped: number;
  pdfsUpdated: number;
}

export interface OfferBulkSyncResult {
  syncedIds: string[];
  failedIds: string[];
  termsAdded: number;
  termsDeactivated: number;
  termsReactivated: number;
  termsSkipped: number;
  pdfsUpdated: number;
}

export interface OfferTermsBulkSyncResult {
  syncedIds: string[];
  failedIds: string[];
  reactivatedIds: string[];
  deactivatedIds: string[];
  pdfsUpdated: number;
}

interface TermSyncOutcome {
  status: 'deactivated' | 'skipped' | 'synced';
  reactivated: boolean;
  pdfUpdated: boolean;
  imageUpdated: boolean;
}

@Injectable()
export class OfferSyncService {
  private readonly logger = new Logger(OfferSyncService.name);

  public constructor(
    private readonly scraperClientService: ScraperClientService,
    @Inject(forwardRef(() => OfferService))
    private readonly offerService: OfferService,
    private readonly cabinTypeService: CabinTypeService,
    private readonly pdfFileService: PdfFileService,
    private readonly imageFileService: ImageFileService,
    private readonly logService: LogService,
  ) {}

  // Odróżnia pierwsze, pełne skrapowanie (scrapeOffer - chodzi po CAŁEJ
  // rodzinie terminów, używane tylko przy imporcie/discovery, patrz
  // OfferDiscoveryService i OfferController.scrapeOffer) od cyklicznej/
  // ręcznej synchronizacji: sync ma tylko ODŚWIEŻYĆ dane (cena, daty, PDF)
  // każdego JUŻ znanego terminu pojedynczym lekkim scrapeTerm (jedna strona,
  // bez chodzenia po siblingach). Ceny są nadpisywane tylko przy zmianie,
  // natomiast dynamicznie generowany PDF jest pobierany przy każdym syncu.
  // Nowy termin (link nieznany z naszej bazy)
  // dostaje pełny scrapeTerm tej JEDNEJ strony, bez uruchamiania całej
  // sekwencji na już istniejących terminach.
  public async syncOffer(offer: Offer): Promise<OfferSyncResult> {
    const cabinTypes = await this.cabinTypeService.findAllByCompany(
      offer.companyId,
    );
    const knownTerms = [...offer.terms];
    // Świadomie NIE filtrujemy po term.isActive - termin błędnie
    // dezaktywowany (np. przez chwilową blokadę/rate-limit strony
    // źródłowej) ma szansę sam się "naprawić" przy kolejnym syncu, jeśli
    // jego strona faktycznie znów odpowiada poprawnie.
    const termsToSync = offer.terms.filter((term) => term.sourceUrl);

    let termsAdded = 0;
    let termsDeactivated = 0;
    let termsReactivated = 0;
    let termsSkipped = 0;
    let pdfsUpdated = 0;

    // Zdjęcie oferty jest stałe (ustawiane raz), więc w odróżnieniu od PDF
    // dociągamy je tylko dopóki faktycznie go brakuje - gdy pierwszy termin
    // w tym przebiegu je uzupełni, kolejne terminy tej samej oferty już go
    // nie proszą ponownie.
    let offerImageMissing = !offer.imageFile;

    const discoveredLinks = new Map<string, ScrapedSiblingLink>();

    // Faza 1: odśwież KAŻDY znany termin z linkiem źródłowym (aktywny albo
    // nie) - lekki scrapeTerm (jedna strona), update tylko przy realnej
    // różnicy.
    for (const term of termsToSync) {
      const outcome = await this.syncKnownTerm(
        term,
        offer.companyId,
        cabinTypes,
        offer.id,
        offerImageMissing,
        discoveredLinks,
      );

      if (outcome.status === 'deactivated') {
        termsDeactivated++;
        continue;
      }

      if (outcome.status === 'skipped') {
        termsSkipped++;
        continue;
      }

      if (outcome.reactivated) {
        termsReactivated++;
      }

      if (outcome.pdfUpdated) {
        pdfsUpdated++;
      }

      if (outcome.imageUpdated) {
        offerImageMissing = false;
      }
    }

    // Faza 2: TYLKO naprawdę nowe terminy (link nieznany z naszej bazy,
    // niezależnie czy inny nasz termin jest aktywny czy nie - świadomie
    // nieaktywnego terminu odkrycie go jako sibling nie ma przywracać) -
    // pełny scrapeTerm tej jednej strony, bez dotykania reszty terminów.
    for (const [sourceUrl] of discoveredLinks) {
      if (knownTerms.some((known) => known.sourceUrl === sourceUrl)) {
        continue;
      }

      try {
        const scraped = await this.scraperClientService.scrapeTerm(
          sourceUrl,
          offerImageMissing,
        );
        const newTermDto: OfferTermDto = {
          startDate: scraped.startDate,
          endDate: scraped.endDate,
          sourceUrl,
          prices: this.buildPriceDtos(scraped.cabinPrices, cabinTypes),
        };
        const newTerm = await this.offerService.createDiscoveredTerm(
          offer,
          newTermDto,
        );
        knownTerms.push(newTerm);
        termsAdded++;

        if (
          scraped.pdfUrl &&
          (await this.tryUpdateTermPdf(newTerm.id, scraped.pdfUrl))
        ) {
          pdfsUpdated++;
        }

        if (
          offerImageMissing &&
          scraped.imageUrl &&
          (await this.tryUpdateOfferImage(offer.id, scraped.imageUrl))
        ) {
          offerImageMissing = false;
        }
      } catch (error) {
        if (error instanceof ScrapedPageNotFoundError) {
          // Sibling-link był martwy zanim zdążyliśmy na niego wejść - nic
          // nie tworzymy, to nie jest nasz istniejący termin.
          continue;
        }

        this.logger.warn(
          `Nowo odkryty termin oferty "${offer.id}" (${sourceUrl}) pominięty w tej synchronizacji - strona źródłowa nie odpowiedziała: ${(error as Error).message}`,
        );
        termsSkipped++;
      }
    }

    const offerActive = await this.offerService.offerHasActiveTerm(offer.id);

    await this.logService.createLog(
      `Zsynchronizowano ofertę "${offer.name}" (${offer.id}): ` +
        `${termsAdded} nowy(ch) termin(ów), ${termsReactivated} przywrócony(ch) termin(ów), ` +
        `${termsDeactivated} dezaktywowany(ch) termin(ów), ` +
        `${termsSkipped} pominięty(ch) z powodu błędu połączenia, ` +
        `${pdfsUpdated} zaktualizowany(ch) PDF` +
        (offerActive ? '.' : ', oferta bez aktywnych terminów.'),
      'SYSTEM',
    );

    return {
      offerDeactivated: !offerActive,
      termsAdded,
      termsDeactivated,
      termsReactivated,
      termsSkipped,
      pdfsUpdated,
    };
  }

  // Wspólna logika odświeżenia JEDNEGO już znanego terminu - używana zarówno
  // przez pełny syncOffer() (Faza 1, po kolei dla całej oferty), jak i przez
  // syncTerms() (tylko dla wybranych, pojedynczych terminów). discoveredLinks
  // jest opcjonalny - syncTerms() nie robi Fazy 2 (odkrywanie nowych
  // terminów), bo to z definicji dotyczy całej rodziny terminów oferty.
  private async syncKnownTerm(
    term: OfferTerm,
    companyId: string,
    cabinTypes: CabinType[],
    offerId: string,
    offerImageMissing: boolean,
    discoveredLinks?: Map<string, ScrapedSiblingLink>,
  ): Promise<TermSyncOutcome> {
    let scraped: ScrapedTermPageResponse;
    try {
      scraped = await this.scraperClientService.scrapeTerm(
        term.sourceUrl,
        offerImageMissing,
      );
    } catch (error) {
      if (error instanceof ScrapedPageNotFoundError) {
        await this.offerService.setTermActive(term.id, false);
        this.logger.warn(
          `Termin "${term.id}" oferty "${offerId}" dezaktywowany - strona źródłowa potwierdziła 404/410 (oferta zdjęta ze strony).`,
        );
        return {
          status: 'deactivated',
          reactivated: false,
          pdfUpdated: false,
          imageUpdated: false,
        };
      }

      // Niepowodzenie komunikacji ze scraperem (timeout, scraper padł, błąd
      // sieci) NIE oznacza że strona źródłowa faktycznie zniknęła -
      // dezaktywacja tylko na tej podstawie byłaby fałszywym alarmem
      // niszczącym żywe terminy. Próbujemy ponownie przy kolejnym syncu.
      this.logger.warn(
        `Termin "${term.id}" oferty "${offerId}" pominięty w tej synchronizacji - strona źródłowa nie odpowiedziała: ${(error as Error).message}`,
      );
      return {
        status: 'skipped',
        reactivated: false,
        pdfUpdated: false,
        imageUpdated: false,
      };
    }

    let reactivated = false;
    if (!term.isActive) {
      await this.offerService.setTermActive(term.id, true);
      reactivated = true;
      this.logger.log(
        `Termin "${term.id}" oferty "${offerId}" przywrócony - strona źródłowa znów odpowiada poprawnie.`,
      );
    }

    if (!isSameDateRange(term, scraped)) {
      await this.offerService.updateTermDates(
        term.id,
        scraped.startDate,
        scraped.endDate,
      );
    }

    const priceDtos = this.buildPriceDtos(scraped.cabinPrices, cabinTypes);
    if (!this.pricesUnchanged(term.prices ?? [], priceDtos)) {
      await this.offerService.updateTermPrices(term.id, companyId, priceDtos);
    }

    let pdfUpdated = false;
    if (
      scraped.pdfUrl &&
      (await this.tryUpdateTermPdf(term.id, scraped.pdfUrl))
    ) {
      pdfUpdated = true;
    }

    let imageUpdated = false;
    if (
      offerImageMissing &&
      scraped.imageUrl &&
      (await this.tryUpdateOfferImage(offerId, scraped.imageUrl))
    ) {
      imageUpdated = true;
    }

    if (discoveredLinks) {
      for (const sibling of scraped.siblingLinks) {
        discoveredLinks.set(sibling.sourceUrl, sibling);
      }
    }

    return { status: 'synced', reactivated, pdfUpdated, imageUpdated };
  }

  // Sync na poziomie POJEDYNCZYCH zaznaczonych terminów - w odróżnieniu od
  // syncOffer()/syncOffers() (cała oferta) odświeża WYŁĄCZNIE wskazane
  // terminy, nawet jeśli reszta terminów tej samej oferty nie została
  // zaznaczona. Bez Fazy 2 (odkrywanie nowych terminów) - to z definicji
  // dotyczy całej rodziny terminów, nie pojedynczego wyboru.
  public async syncTerms(termIds: string[]): Promise<OfferTermsBulkSyncResult> {
    const result: OfferTermsBulkSyncResult = {
      syncedIds: [],
      failedIds: [],
      reactivatedIds: [],
      deactivatedIds: [],
      pdfsUpdated: 0,
    };

    const terms = await this.offerService.findTermsByIds(termIds);
    const termById = new Map(terms.map((term) => [term.id, term]));
    const cabinTypesByCompany = new Map<string, CabinType[]>();
    // Kilka zaznaczonych terminów może należeć do TEJ SAMEJ oferty - gdy
    // pierwszemu z nich uda się uzupełnić brakujące zdjęcie oferty, kolejne
    // nie mają już po co o nie prosić (offer.imageFile w term.offer to
    // migawka sprzed tego przebiegu i się nie zaktualizuje).
    const offersWithImageHandled = new Set<string>();

    for (const termId of termIds) {
      const term = termById.get(termId);

      if (!term || !term.sourceUrl) {
        result.failedIds.push(termId);
        continue;
      }

      let cabinTypes = cabinTypesByCompany.get(term.offer.companyId);
      if (!cabinTypes) {
        cabinTypes = await this.cabinTypeService.findAllByCompany(
          term.offer.companyId,
        );
        cabinTypesByCompany.set(term.offer.companyId, cabinTypes);
      }

      const offerImageMissing =
        !term.offer.imageFile && !offersWithImageHandled.has(term.offerId);

      const outcome = await this.syncKnownTerm(
        term,
        term.offer.companyId,
        cabinTypes,
        term.offerId,
        offerImageMissing,
      );

      if (outcome.status === 'deactivated') {
        result.deactivatedIds.push(termId);
        continue;
      }

      if (outcome.status === 'skipped') {
        result.failedIds.push(termId);
        continue;
      }

      result.syncedIds.push(termId);
      if (outcome.reactivated) {
        result.reactivatedIds.push(termId);
      }
      if (outcome.pdfUpdated) {
        result.pdfsUpdated++;
      }
      if (outcome.imageUpdated) {
        offersWithImageHandled.add(term.offerId);
      }
    }

    await this.logService.createLog(
      `Zsynchronizowano ${result.syncedIds.length} zaznaczony(ch) termin(ów) ` +
        `(spośród ${termIds.length}): ${result.reactivatedIds.length} przywrócony(ch), ` +
        `${result.deactivatedIds.length} dezaktywowany(ch), ${result.failedIds.length} pominięty(ch), ` +
        `${result.pdfsUpdated} zaktualizowany(ch) PDF.`,
      'SYSTEM',
    );

    return result;
  }

  // Wersja masowa uproszczona względem OfferSyncCron: wywołuje ten sam
  // syncOffer() dla każdej podanej oferty po kolei, ale BEZ opóźnienia
  // między ofertami (syncRequestDelayMs z ustawień, używane przez
  // OfferSyncCron) - akceptowalne dla ręcznego triggera na garstce
  // zaznaczonych ofert, nie dla całej bazy.
  public async syncOffers(offerIds: string[]): Promise<OfferBulkSyncResult> {
    const result: OfferBulkSyncResult = {
      syncedIds: [],
      failedIds: [],
      termsAdded: 0,
      termsDeactivated: 0,
      termsReactivated: 0,
      termsSkipped: 0,
      pdfsUpdated: 0,
    };

    for (const offerId of offerIds) {
      const offer = await this.offerService.findOneById(offerId);
      const hasSyncableTerm = offer?.terms?.some((term) => term.sourceUrl);

      if (!offer || !hasSyncableTerm) {
        result.failedIds.push(offerId);
        continue;
      }

      try {
        const offerResult = await this.syncOffer(offer);
        result.syncedIds.push(offerId);
        result.termsAdded += offerResult.termsAdded;
        result.termsDeactivated += offerResult.termsDeactivated;
        result.termsReactivated += offerResult.termsReactivated;
        result.termsSkipped += offerResult.termsSkipped;
        result.pdfsUpdated += offerResult.pdfsUpdated;
      } catch (error) {
        this.logger.warn(
          `Bulk sync: failed to sync offer ${offerId}: ${error.message}`,
        );
        result.failedIds.push(offerId);
      }
    }

    return result;
  }

  private pricesUnchanged(
    existingPrices: OfferTermPrice[],
    newPriceDtos: OfferTermPriceDto[],
  ): boolean {
    if (existingPrices.length !== newPriceDtos.length) {
      return false;
    }

    const existingPriceByCabinTypeId = new Map(
      existingPrices.map((price) => [price.cabinTypeId, price.price]),
    );

    return newPriceDtos.every((dto) => {
      if (!dto.cabinTypeId) {
        // Kabina jeszcze nieznana dla tej firmy (dopiero co odkryta na
        // stronie) - z definicji nie może być "bez zmian".
        return false;
      }
      return existingPriceByCabinTypeId.get(dto.cabinTypeId) === dto.price;
    });
  }

  private buildPriceDtos(
    cabinPrices: ScrapedCabinPrice[],
    cabinTypes: CabinType[],
  ): OfferTermPriceDto[] {
    return cabinPrices.map((cabinPrice) => {
      const matchedCabinTypeId = findBestMatch(cabinPrice.label, cabinTypes);
      return matchedCabinTypeId
        ? {
            cabinTypeId: matchedCabinTypeId,
            price: toGrosze(cabinPrice.price),
          }
        : {
            cabinTypeName: cabinPrice.label,
            price: toGrosze(cabinPrice.price),
          };
    });
  }

  private async tryUpdateTermPdf(
    termId: string,
    pdfUrl: string,
  ): Promise<boolean> {
    try {
      const file = await this.pdfFileService.downloadPdfFromUrl(pdfUrl);
      await this.pdfFileService.updatePdfFile(
        termId,
        PdfFileType.TERM,
        file,
        'SYSTEM',
        pdfUrl,
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Nie udało się zaktualizować PDF terminu "${termId}": ${(error as Error).message}`,
      );
      return false;
    }
  }

  private async tryUpdateOfferImage(
    offerId: string,
    imageUrl: string,
  ): Promise<boolean> {
    try {
      const file = await this.imageFileService.downloadImageFromUrl(imageUrl);
      await this.imageFileService.createImageFile(
        offerId,
        ImageFileType.OFFER,
        file,
        null,
        imageUrl,
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Nie udało się pobrać zdjęcia oferty "${offerId}": ${(error as Error).message}`,
      );
      return false;
    }
  }
}
