import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommonHttpService } from './common.http.service';
import { environment } from '@environment';

describe('CommonHttpService dictionary cache', () => {
  let service: CommonHttpService;
  let http: HttpTestingController;
  const url = `${environment.API_URL}/category`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CommonHttpService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shares one request between concurrent subscribers and subsequent reads', () => {
    const results: unknown[] = [];
    service.getCategories().subscribe((value) => results.push(value));
    service.getCategories().subscribe((value) => results.push(value));
    http.expectOne(url).flush([{ id: 'category-1' }]);
    service.getCategories().subscribe((value) => results.push(value));

    http.expectNone(url);
    expect(results).toEqual(Array(3).fill([{ id: 'category-1' }]));
  });

  it('expires cached results five minutes after the response', () => {
    const now = spyOn(Date, 'now').and.returnValue(1000);
    service.getCategories().subscribe();
    http.expectOne(url).flush([]);
    now.and.returnValue(301000);
    let result: unknown;
    service.getCategories().subscribe((value) => (result = value));
    http.expectOne(url).flush([{ id: 'fresh' }]);
    expect(result).toEqual([{ id: 'fresh' }]);
  });

  it('allows retries after a failed request', () => {
    service.getCategories().subscribe({ error: () => undefined });
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server error' });
    let result: unknown;
    service.getCategories().subscribe((value) => (result = value));
    http.expectOne(url).flush([{ id: 'recovered' }]);
    expect(result).toEqual([{ id: 'recovered' }]);
  });

  it('invalidates cached dictionaries after a successful edit', () => {
    service.getCategories().subscribe();
    http.expectOne(url).flush([{ id: 'old' }]);
    service.updateCategory({ id: 'old', formData: new FormData() }).subscribe();
    http.expectOne(`${url}/old`).flush({ id: 'updated' });
    let result: unknown;
    service.getCategories().subscribe((value) => (result = value));
    http.expectOne(url).flush([{ id: 'updated' }]);
    expect(result).toEqual([{ id: 'updated' }]);
  });

  it('does not repopulate the cache with a request started before an edit', () => {
    service.getCategories().subscribe();
    const oldRequest = http.expectOne(url);
    service.deleteCategory({ id: 'old' }).subscribe();
    http.expectOne(`${url}/old`).flush(true);
    oldRequest.flush([{ id: 'old' }]);
    let result: unknown;
    service.getCategories().subscribe((value) => (result = value));
    http.expectOne(url).flush([]);
    expect(result).toEqual([]);
  });

  it('keeps a valid cache when a mutation fails', () => {
    service.getCategories().subscribe();
    http.expectOne(url).flush([{ id: 'old' }]);
    service.deleteCategory({ id: 'old' }).subscribe({ error: () => undefined });
    http.expectOne(`${url}/old`).flush({}, { status: 500, statusText: 'Server error' });
    let result: unknown;
    service.getCategories().subscribe((value) => (result = value));
    http.expectNone(url);
    expect(result).toEqual([{ id: 'old' }]);
  });

  it('keeps companies and destinations in separate cache entries', () => {
    service.getCompanies().subscribe();
    http.expectOne(`${environment.API_URL}/company`).flush([{ id: 'company' }]);
    service.getDestinations().subscribe();
    http.expectOne(`${environment.API_URL}/destination/`).flush([{ id: 'destination' }]);
    service.getCompanies().subscribe((value) => expect(value[0].id).toBe('company'));
    service.getDestinations().subscribe((value) => expect(value[0].id).toBe('destination'));
    http.expectNone(`${environment.API_URL}/company`);
    http.expectNone(`${environment.API_URL}/destination/`);
  });

  it('loads a public destination by its English slug', () => {
    service.getPublicDestination({ slug: 'caribbean' }).subscribe();

    http
      .expectOne(`${environment.API_URL}/destination/public/caribbean`)
      .flush({ id: 'destination-1', slug: 'caribbean' });
  });

  it('loads a public cruise line by its English slug', () => {
    service.getPublicCompany({ slug: 'msc-cruises' }).subscribe();

    http.expectOne(`${environment.API_URL}/company/public/msc-cruises`).flush({ id: 'company-1', slug: 'msc-cruises' });
  });

  it('always fetches administrative logs', () => {
    service.getLogs().subscribe();
    http.expectOne(`${environment.API_URL}/log/`).flush([]);
    let result: unknown;
    service.getLogs().subscribe((value) => {
      result = value;
    });
    http.expectOne(`${environment.API_URL}/log/`).flush([{ id: 'new-log' }]);
    expect(result).toEqual([{ id: 'new-log' }]);
  });
});
