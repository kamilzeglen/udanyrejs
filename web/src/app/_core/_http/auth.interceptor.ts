import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { Router } from '@angular/router';
import { AuthHttpService } from '@core/_http/auth.http.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private urlsToSkipUnauthorized: string[] = [`/auth/verify-account`, `/auth/set-new-password`];
  // Logowanie/rejestracja/odświeżanie/wylogowanie same zgłaszają 401 jako
  // normalny wynik operacji - nie mają czego odświeżać.
  private urlsToSkipRefresh: string[] = [`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`];

  private refreshInProgress$: Observable<{ access_token: string }> | null = null;

  constructor(
    private readonly router: Router,
    private readonly snackService: SnackbarService,
    private readonly authHttpService: AuthHttpService,
  ) {}

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
        const skipUnauthorizedCheck = this.urlsToSkipUnauthorized.some((urlPart) =>
          requestUrl.toLowerCase().includes(urlPart),
        );

        if (skipUnauthorizedCheck && httpErrorResponse.status === HttpStatusCode.Unauthorized) {
          return throwError(() => httpErrorResponse);
        }

        const skipRefresh = this.urlsToSkipRefresh.some((urlPart) => requestUrl.toLowerCase().includes(urlPart));

        if (httpErrorResponse.status === HttpStatusCode.Unauthorized && !skipRefresh) {
          return this.retryAfterRefresh(request, next);
        }

        if (httpErrorResponse.status === HttpStatusCode.Unauthorized) {
          this.redirectToLogin();
          return throwError(() => httpErrorResponse);
        }

        if (httpErrorResponse.status === HttpStatusCode.TooManyRequests) {
          this.snackService.showError('Wykonujesz za dużo zapytań');
          return throwError(() => httpErrorResponse);
        }

        return throwError(() => httpErrorResponse);
      }),
    );
  }

  // Pierwsze 401 uruchamia jedno żądanie /auth/refresh; kolejne równoległe
  // 401 (np. kilka zapytań naraz po wygaśnięciu access tokenu) doczepiają
  // się do tego samego odświeżenia zamiast wywoływać je osobno.
  private retryAfterRefresh(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.refreshInProgress$) {
      this.refreshInProgress$ = this.authHttpService.refresh().pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        finalize(() => {
          this.refreshInProgress$ = null;
        }),
      );
    }

    return this.refreshInProgress$.pipe(
      switchMap(() => next.handle(request.clone({ withCredentials: true }))),
      catchError((refreshError: HttpErrorResponse) => {
        this.redirectToLogin();
        return throwError(() => refreshError);
      }),
    );
  }

  private redirectToLogin(): void {
    this.snackService.showError('Dostęp wymaga autoryzacjo');
    const encodedRedirectUrl = encodeURIComponent(this.router.url);
    this.router.navigate(['/login'], { queryParams: { redirect: encodedRedirectUrl } });
  }
}
