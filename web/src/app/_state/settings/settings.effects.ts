import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as settingsActions from '@state/settings/settings.actions';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SettingsHttpService } from '@core/_http/settings.http.service';

@Injectable()
export class SettingsEffects {
  constructor(
    private actions$: Actions,
    private http: SettingsHttpService,
  ) {}

  getSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(settingsActions.getSettings),
      switchMap(() => {
        return this.http.getSettings().pipe(
          map((settings) => {
            return settingsActions.getSettingsSuccess({ settings });
          }),
          catchError((errorMessage) => {
            return of(settingsActions.getSettingsError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  updateSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(settingsActions.updateSettings),
      switchMap(({ payload }) => {
        return this.http.updateSettings(payload).pipe(
          map((settings) => {
            return settingsActions.updateSettingsSuccess({ settings });
          }),
          catchError((errorMessage) => {
            return of(settingsActions.updateSettingsError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  runSyncNow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(settingsActions.runSyncNow),
      switchMap(() => {
        return this.http.runSyncNow().pipe(
          map(() => {
            return settingsActions.runSyncNowSuccess();
          }),
          catchError((errorMessage) => {
            return of(settingsActions.runSyncNowError({ errorMessage }));
          }),
        );
      }),
    ),
  );
}
