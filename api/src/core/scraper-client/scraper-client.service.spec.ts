import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import {
  ScraperClientService,
  ScrapedPageNotFoundError,
} from './scraper-client.service';

describe('ScraperClientService', () => {
  let service: ScraperClientService;
  let httpService: { post: jest.Mock };

  beforeEach(async () => {
    httpService = { post: jest.fn() };
    process.env.SCRAPER_URL = 'http://scraper:5010';
    process.env.SCRAPER_INTERNAL_TOKEN = 'secret-token';

    const moduleRef = await Test.createTestingModule({
      providers: [
        ScraperClientService,
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = moduleRef.get(ScraperClientService);
  });

  it('posts to /scrape-offer with the internal token header', async () => {
    const response = {
      data: { name: 'Rejs testowy', terms: [] },
    } as AxiosResponse;
    httpService.post.mockReturnValue(of(response));

    const result = await service.scrapeOffer('https://rejsy4you.pl/rejs/1');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://scraper:5010/scrape-offer',
      { url: 'https://rejsy4you.pl/rejs/1' },
      { headers: { 'X-Internal-Token': 'secret-token' } },
    );
    expect(result).toEqual({ name: 'Rejs testowy', terms: [] });
  });

  it('propagates a generic error from the scraper unchanged', async () => {
    httpService.post.mockReturnValue(
      throwError(() => new Error('scraper down')),
    );

    await expect(
      service.scrapeOffer('https://rejsy4you.pl/rejs/1'),
    ).rejects.toThrow('scraper down');
  });

  it('turns a 404 from the scraper into a ScrapedPageNotFoundError so callers can tell a confirmed removal apart from a transient failure', async () => {
    const notFoundError = {
      isAxiosError: true,
      response: { status: 404 },
    } as AxiosError;
    httpService.post.mockReturnValue(throwError(() => notFoundError));

    await expect(
      service.scrapeOffer('https://rejsy4you.pl/rejs/1'),
    ).rejects.toThrow(ScrapedPageNotFoundError);
  });

  it('does not turn a non-404 scraper error into a ScrapedPageNotFoundError', async () => {
    const serverError = {
      isAxiosError: true,
      response: { status: 502 },
      message: 'Scraping failed: timeout',
    } as AxiosError;
    httpService.post.mockReturnValue(throwError(() => serverError));

    await expect(
      service.scrapeOffer('https://rejsy4you.pl/rejs/1'),
    ).rejects.not.toBeInstanceOf(ScrapedPageNotFoundError);
  });

  it('posts to /scrape-term with the internal token header', async () => {
    const response = {
      data: {
        startDate: '2026-10-04',
        endDate: '2026-10-11',
        cabinPrices: [],
        pdfUrl: null,
        siblingLinks: [],
      },
    } as AxiosResponse;
    httpService.post.mockReturnValue(of(response));

    const result = await service.scrapeTerm('https://rejsy4you.pl/rejs/1');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://scraper:5010/scrape-term',
      { url: 'https://rejsy4you.pl/rejs/1' },
      { headers: { 'X-Internal-Token': 'secret-token' } },
    );
    expect(result).toEqual({
      startDate: '2026-10-04',
      endDate: '2026-10-11',
      cabinPrices: [],
      pdfUrl: null,
      siblingLinks: [],
    });
  });

  it('turns a 404 from /scrape-term into a ScrapedPageNotFoundError', async () => {
    const notFoundError = {
      isAxiosError: true,
      response: { status: 404 },
    } as AxiosError;
    httpService.post.mockReturnValue(throwError(() => notFoundError));

    await expect(
      service.scrapeTerm('https://rejsy4you.pl/rejs/1'),
    ).rejects.toThrow(ScrapedPageNotFoundError);
  });

  it('propagates a non-404 /scrape-term error unchanged', async () => {
    const serverError = {
      isAxiosError: true,
      response: { status: 502 },
      message: 'Scraping failed: timeout',
    } as AxiosError;
    httpService.post.mockReturnValue(throwError(() => serverError));

    await expect(
      service.scrapeTerm('https://rejsy4you.pl/rejs/1'),
    ).rejects.not.toBeInstanceOf(ScrapedPageNotFoundError);
  });

  it('posts to /discover-offers with shipownerNames and count', async () => {
    const response = {
      data: {
        urls: ['https://rejsy4you.pl/rejs/1_x_1'],
        unmatchedNames: ['Nieznany'],
      },
    } as AxiosResponse;
    httpService.post.mockReturnValue(of(response));

    const result = await service.discoverOffers(['MSC Cruises'], 5);

    expect(httpService.post).toHaveBeenCalledWith(
      'http://scraper:5010/discover-offers',
      { shipownerNames: ['MSC Cruises'], count: 5 },
      { headers: { 'X-Internal-Token': 'secret-token' } },
    );
    expect(result).toEqual({
      urls: ['https://rejsy4you.pl/rejs/1_x_1'],
      unmatchedNames: ['Nieznany'],
    });
  });
});
