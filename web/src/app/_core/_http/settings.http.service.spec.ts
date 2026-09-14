import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SettingsHttpService } from './settings.http.service';
import { environment } from '@environment';

describe('SettingsHttpService', () => {
  let service: SettingsHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SettingsHttpService],
    });
    service = TestBed.inject(SettingsHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets from /settings/', () => {
    service.getSettings().subscribe();

    const req = httpMock.expectOne(`${environment.API_URL}/settings/`);
    expect(req.request.method).toBe('GET');
    req.flush({ scrapingEnabled: true });
  });

  it('patches to /settings/', () => {
    service.updateSettings({ scrapingEnabled: false }).subscribe();

    const req = httpMock.expectOne(`${environment.API_URL}/settings/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ scrapingEnabled: false });
    req.flush({ scrapingEnabled: false });
  });

  it('posts to /offers/sync-now', () => {
    service.runSyncNow().subscribe();

    const req = httpMock.expectOne(`${environment.API_URL}/offers/sync-now`);
    expect(req.request.method).toBe('POST');
    req.flush({ started: true });
  });
});
