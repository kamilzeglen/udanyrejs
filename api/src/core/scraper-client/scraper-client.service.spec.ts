import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ScraperClientService } from './scraper-client.service';

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

  it('posts to /full-scrap with the internal token header', async () => {
    const response = {
      data: { name: 'Rejs testowy', terms: [] },
    } as AxiosResponse;
    httpService.post.mockReturnValue(of(response));

    const result = await service.fullScrap('https://rejsy4you.pl/rejs/1');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://scraper:5010/full-scrap',
      { url: 'https://rejsy4you.pl/rejs/1' },
      { headers: { 'X-Internal-Token': 'secret-token' } },
    );
    expect(result).toEqual({ name: 'Rejs testowy', terms: [] });
  });

  it('propagates an error from the scraper', async () => {
    httpService.post.mockReturnValue(
      throwError(() => new Error('scraper down')),
    );

    await expect(
      service.fullScrap('https://rejsy4you.pl/rejs/1'),
    ).rejects.toThrow('scraper down');
  });

  it('posts to /price-check', async () => {
    const response = {
      data: { available: true, cabinPrices: [] },
    } as AxiosResponse;
    httpService.post.mockReturnValue(of(response));

    const result = await service.priceCheck('https://rejsy4you.pl/rejs/1');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://scraper:5010/price-check',
      { url: 'https://rejsy4you.pl/rejs/1' },
      { headers: { 'X-Internal-Token': 'secret-token' } },
    );
    expect(result).toEqual({ available: true, cabinPrices: [] });
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
