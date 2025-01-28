import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import * as emailActions from '@state/email/email.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {EmailHttpService} from '@core/_http/email.http.service';

@Injectable()
export class EmailEffects {
  constructor(
    private actions$: Actions,
    private http: EmailHttpService,
  ) {
  }

  sendEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(emailActions.sendEmail),
      switchMap(({payload}) => {
        return this.http.sendEmail(payload).pipe(
          map((emailSent) => {
            return emailActions.sendEmailSuccess({emailSent});
          }),
          catchError(errorMessage => {
            return of(emailActions.sendEmailError({errorMessage}));
          })
        );
      })
    )
  )
}
