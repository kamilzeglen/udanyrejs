import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ConnectivityService } from '@core/connectivity/connectivity.service';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  private urlsToSkip: string[] = ['/health'];

  constructor(private readonly connectivityService: ConnectivityService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const skipConnectivityCheck = this.urlsToSkip.some((urlPart) => req.url.toLowerCase().includes(urlPart));

    if (skipConnectivityCheck === false && this.connectivityService.isOffline()) {
      return throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Serwer niedostępny', url: req.url }));
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (skipConnectivityCheck === false && error instanceof HttpErrorResponse && this.isServerError(error)) {
          this.connectivityService.markOffline();
        }
        return throwError(() => error);
      }),
    );
  }

  private isServerError(error: HttpErrorResponse): boolean {
    return error.status === 0 || error.status >= HttpStatusCode.InternalServerError;
  }
}
