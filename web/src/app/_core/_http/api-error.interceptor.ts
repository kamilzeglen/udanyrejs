import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, delay, of } from 'rxjs';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  private blockRequests = false;

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (this.blockRequests) {
      return of(null).pipe(
        delay(30000),
        switchMap(() => next.handle(req)),
      );
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 0) {
          this.blockRequests = true;
          this.router.navigate(['/error']);

          setTimeout(() => {
            this.blockRequests = false;
          }, 30000);
        }
        return throwError(() => error);
      }),
    );
  }
}
