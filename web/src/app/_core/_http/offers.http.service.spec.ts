import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OffersHttpService } from './offers.http.service';
import { environment } from '@environment';

describe('OffersHttpService scraping methods', () => {
  let service: OffersHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OffersHttpService],
    });
    service = TestBed.inject(OffersHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts to /offers/scrape', () => {
    service.scrapeOffer({ url: 'https://rejsy4you.pl/rejs/1' }).subscribe();

    const req = httpMock.expectOne(`${environment.API_URL}/offers/scrape`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ url: 'https://rejsy4you.pl/rejs/1' });
    req.flush({ name: 'Rejs testowy' });
  });

  it('posts to /offers/:id/sync', () => {
    service.syncOffer({ id: 'offer-1' }).subscribe();

    const req = httpMock.expectOne(`${environment.API_URL}/offers/offer-1/sync`);
    expect(req.request.method).toBe('POST');
    req.flush({ synced: true });
  });
});
