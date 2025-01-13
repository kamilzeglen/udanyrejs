import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {Router} from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private urlsToSkipUnauthorized: string[] = [`/auth/verify-account`, `/auth/set-new-password`];

  constructor(
    private readonly router: Router,
    private readonly snackService: SnackbarService,
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      withCredentials: true,
    });

    return next.handle(request).pipe(
      map((httpReq: any) => {
        return httpReq;
      }),
      catchError((httpErrorResponse: HttpErrorResponse) => {
        const requestUrl = request.url;
        const skipErrorCheck = this.urlsToSkipUnauthorized.some(urlPart => requestUrl.toLowerCase().includes(urlPart));

        if (skipErrorCheck && httpErrorResponse.status === HttpStatusCode.Unauthorized) {
          return throwError(() => httpErrorResponse);
        }

        if (httpErrorResponse.status === HttpStatusCode.Unauthorized) {
          this.snackService.showError('Dostęp wymaga autoryzacjo')
          const encodedRedirectUrl = encodeURIComponent(this.router.url);
          this.router.navigate(['/login'], { queryParams: { redirect: encodedRedirectUrl } });
          return throwError(() => httpErrorResponse);
        }

        if (httpErrorResponse.status === HttpStatusCode.TooManyRequests) {
          this.snackService.showError('Wykonujesz za dużo zapytań');
          return throwError(() => httpErrorResponse);
        }

        return throwError(() => httpErrorResponse);
      })
    );
  }
}
