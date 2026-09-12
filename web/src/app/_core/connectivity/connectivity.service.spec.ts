import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ConnectivityService } from './connectivity.service';
import { environment } from '@environment';

describe('ConnectivityService', () => {
  let service: ConnectivityService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], { url: '/offers' });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: router }],
    });

    service = TestBed.inject(ConnectivityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts online', () => {
    expect(service.isOffline()).toBeFalse();
  });

  it('navigates to /error and flags offline on the first failure', () => {
    service.markOffline();

    expect(service.isOffline()).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/error']);
  });

  it('does not navigate again for a repeated failure while already offline', () => {
    service.markOffline();
    service.markOffline();

    expect(router.navigate).toHaveBeenCalledTimes(1);
  });

  it('polls /health on an interval while offline and clears the flag once it recovers', fakeAsync(() => {
    service.markOffline();

    tick(5000);
    httpMock.expectOne(`${environment.API_URL}/health`).flush('boom', { status: 500, statusText: 'Server Error' });
    expect(service.isOffline()).toBeTrue();

    tick(5000);
    httpMock.expectOne(`${environment.API_URL}/health`).flush({ status: 'ok' });

    expect(service.isOffline()).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/offers');

    tick(5000);
    httpMock.expectNone(`${environment.API_URL}/health`);
  }));

  it('checks health immediately when retried manually, without waiting for the interval', () => {
    service.markOffline();

    service.retryNow();

    httpMock.expectOne(`${environment.API_URL}/health`).flush({ status: 'ok' });
    expect(service.isOffline()).toBeFalse();
  });

  it('ignores an overlapping manual retry while a check is already in flight', () => {
    service.markOffline();

    service.retryNow();
    service.retryNow();

    expect(httpMock.match(`${environment.API_URL}/health`).length).toBe(1);
  });
});
