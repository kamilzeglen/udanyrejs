import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ScrapedCabinPrice {
  label: string;
  price: number;
}

export interface ScrapedTermResponse {
  startDate: string;
  endDate: string;
  sourceUrl: string;
  cabinPrices: ScrapedCabinPrice[];
}

export interface ScrapedItineraryDay {
  day: number;
  date: string;
  city: string;
  arrivalTime: string;
  departureTime: string;
}

export interface FullScrapResponse {
  name: string;
  shipName: string;
  companyName: string;
  imageUrl: string;
  pdfUrl: string;
  itinerary: ScrapedItineraryDay[];
  terms: ScrapedTermResponse[];
}

export interface PriceCheckResponse {
  available: boolean;
  cabinPrices: ScrapedCabinPrice[];
}

@Injectable()
export class ScraperClientService {
  private readonly baseUrl = process.env.SCRAPER_URL;
  private readonly internalToken = process.env.SCRAPER_INTERNAL_TOKEN;

  public constructor(private readonly httpService: HttpService) {}

  public async fullScrap(url: string): Promise<FullScrapResponse> {
    const response = await firstValueFrom(
      this.httpService.post<FullScrapResponse>(
        `${this.baseUrl}/full-scrap`,
        { url },
        { headers: { 'X-Internal-Token': this.internalToken } },
      ),
    );

    return response.data;
  }

  public async priceCheck(url: string): Promise<PriceCheckResponse> {
    const response = await firstValueFrom(
      this.httpService.post<PriceCheckResponse>(
        `${this.baseUrl}/price-check`,
        { url },
        { headers: { 'X-Internal-Token': this.internalToken } },
      ),
    );

    return response.data;
  }
}
