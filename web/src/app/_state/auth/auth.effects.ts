import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as authActions from '@state/auth/auth.actions';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as routerActions from '@state/router/router.actions';
import { AuthHttpService } from '@core/_http/auth.http.service';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private http: AuthHttpService,
  ) {}

  getMyself$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.getMyself),
      switchMap(({ redirect }) => {
        return this.http.getMyself().pipe(
          map((user) => {
            return authActions.getMyselfSuccess({ user });
          }),
          catchError((error) => {
            return of(authActions.getMyselfError({ error, redirect }));
          }),
        );
      }),
    ),
  );

  getMyselfError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.getMyselfError),
      map(({ redirect }) => {
        return routerActions.changeRoute({ linkParams: ['login'], extras: { queryParams: { redirect } } });
      }),
    ),
  );

  login$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.login),
        switchMap(({ payload, redirect }) => {
          return this.http.login(payload).pipe(
            map(() => {
              return authActions.loginSuccess({ redirect });
            }),
            catchError((errorMessage) => {
              return of(authActions.loginError({ errorMessage }));
            }),
          );
        }),
      ),
    { dispatch: true },
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.loginSuccess),
      switchMap(({ redirect }) => {
        return of(authActions.getMyself({ redirect }));
      }),
    ),
  );
}
