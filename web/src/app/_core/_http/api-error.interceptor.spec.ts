import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiErrorInterceptor } from './api-error.interceptor';
import { ConnectivityService } from '@core/connectivity/connectivity.service';
import { environment } from '@environment';

describe('ApiErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let connectivityService: jasmine.SpyObj<ConnectivityService>;

  beforeEach(() => {
    connectivityService = jasmine.createSpyObj('ConnectivityService', ['isOffline', 'markOffline']);
    connectivityService.isOffline.and.returnValue(false);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true },
        { provide: ConnectivityService, useValue: connectivityService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reports the connection as offline on a 500 server error', () => {
    http.get(`${environment.API_URL}/category`).subscribe({ error: jasmine.createSpy('onError') });

    httpMock.expectOne(`${environment.API_URL}/category`).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(connectivityService.markOffline).toHaveBeenCalled();
  });

  it('reports the connection as offline on a network failure (status 0)', () => {
    http.get(`${environment.API_URL}/category`).subscribe({ error: jasmine.createSpy('onError') });

    httpMock.expectOne(`${environment.API_URL}/category`).error(new ProgressEvent('error'), { status: 0 });

    expect(connectivityService.markOffline).toHaveBeenCalled();
  });

  it('does not treat a normal 4xx response as a connectivity problem', () => {
    http.get(`${environment.API_URL}/category`).subscribe({ error: jasmine.createSpy('onError') });

    httpMock.expectOne(`${environment.API_URL}/category`).flush('not found', { status: 404, statusText: 'Not Found' });

    expect(connectivityService.markOffline).not.toHaveBeenCalled();
  });

  it('blocks every request without hitting the network while offline', () => {
    connectivityService.isOffline.and.returnValue(true);

    http.get(`${environment.API_URL}/category`).subscribe({ error: jasmine.createSpy('onError') });
    http.get(`${environment.API_URL}/company`).subscribe({ error: jasmine.createSpy('onError') });

    expect(httpMock.match(`${environment.API_URL}/category`).length).toBe(0);
    expect(httpMock.match(`${environment.API_URL}/company`).length).toBe(0);
  });

  it('lets the health check through even while offline, so it can detect recovery', () => {
    connectivityService.isOffline.and.returnValue(true);

    let result: unknown;
    http.get(`${environment.API_URL}/health`).subscribe((response) => (result = response));
    httpMock.expectOne(`${environment.API_URL}/health`).flush({ status: 'ok' });

    expect(result).toEqual({ status: 'ok' });
  });
});
