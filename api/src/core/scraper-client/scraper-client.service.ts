import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';

// Odróżnia potwierdzone "strona nie istnieje" (scraper dostał 404/410
// bezpośrednio od rejsy4you) od każdego innego niepowodzenia (timeout, nasz
// scraper padł, błąd sieci) - tylko ten pierwszy przypadek uzasadnia
// dezaktywację terminu w OfferSyncService, patrz syncOffer().
export class ScrapedPageNotFoundError extends Error {
  constructor(public readonly url: string) {
    super(`Scraped page not found: ${url}`);
    this.name = 'ScrapedPageNotFoundError';
  }
}

export interface ScrapedCabinPrice {
  label: string;
  price: number;
}

export interface ScrapedTermResponse {
  startDate: string;
  endDate: string;
  sourceUrl: string;
  pdfUrl: string | null;
  cabinPrices: ScrapedCabinPrice[];
}

export interface ScrapedItineraryDay {
  day: number;
  date: string;
  city: string;
  arrivalTime: string;
  departureTime: string;
}

export interface ScrapeOfferResponse {
  name: string;
  shipName: string;
  companyName: string;
  imageUrl: string;
  itinerary: ScrapedItineraryDay[];
  terms: ScrapedTermResponse[];
  // Adresy siblingów, dla których scraper potwierdził 404/410 przy okazji
  // tego samego zapytania - pozwala dezaktywować konkretny termin bez
  // osobnego zapytania /scrape-offer na jego własny URL (patrz OfferSyncService).
  notFoundUrls?: string[];
}

export interface ScrapedSiblingLink {
  sourceUrl: string;
  startDate: string;
  endDate: string;
}

export interface ScrapedTermPageResponse {
  startDate: string;
  endDate: string;
  cabinPrices: ScrapedCabinPrice[];
  pdfUrl: string | null;
  siblingLinks: ScrapedSiblingLink[];
}

export interface DiscoverOffersResponse {
  urls: string[];
  unmatchedNames: string[];
}

@Injectable()
export class ScraperClientService {
  private readonly baseUrl = process.env.SCRAPER_URL;
  private readonly internalToken = process.env.SCRAPER_INTERNAL_TOKEN;

  public constructor(private readonly httpService: HttpService) {}

  // Skrapuje CAŁĄ rodzinę terminów oferty (primary + wszyscy siblingi) w
  // jednym zapytaniu - używane tylko przy pierwszym imporcie (discovery/
  // ręczne dodanie oferty). Do odświeżenia już znanego terminu albo pobrania
  // jednego nowo odkrytego służy lekki scrapeTerm() (jedna strona).
  public async scrapeOffer(url: string): Promise<ScrapeOfferResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ScrapeOfferResponse>(
          `${this.baseUrl}/scrape-offer`,
          { url },
          { headers: { 'X-Internal-Token': this.internalToken } },
        ),
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new ScrapedPageNotFoundError(url);
      }
      throw error;
    }
  }

  // Skrapuje TYLKO tę jedną stronę (bez chodzenia po siblingach jak
  // scrapeOffer) - używane do lekkiego odświeżenia już znanego terminu
  // (cena/daty/PDF) oraz do pobrania pełnych danych pojedynczego nowo
  // odkrytego terminu, patrz OfferSyncService.
  public async scrapeTerm(url: string): Promise<ScrapedTermPageResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ScrapedTermPageResponse>(
          `${this.baseUrl}/scrape-term`,
          { url },
          { headers: { 'X-Internal-Token': this.internalToken } },
        ),
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new ScrapedPageNotFoundError(url);
      }
      throw error;
    }
  }

  public async discoverOffers(
    shipownerNames: string[],
    count: number,
  ): Promise<DiscoverOffersResponse> {
    const response = await firstValueFrom(
      this.httpService.post<DiscoverOffersResponse>(
        `${this.baseUrl}/discover-offers`,
        { shipownerNames, count },
        { headers: { 'X-Internal-Token': this.internalToken } },
      ),
    );

    return response.data;
  }
}
