import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as discoverActions from '@state/discover/discover.actions';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DiscoverHttpService } from '@core/_http/discover.http.service';

@Injectable()
export class DiscoverEffects {
  constructor(
    private actions$: Actions,
    private http: DiscoverHttpService,
  ) {}

  startDiscovery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(discoverActions.startDiscovery),
      switchMap(({ payload }) => {
        return this.http.startDiscovery(payload).pipe(
          map(() => discoverActions.startDiscoverySuccess()),
          catchError((errorMessage) => of(discoverActions.startDiscoveryError({ errorMessage }))),
        );
      }),
    ),
  );

  getDrafts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(discoverActions.getDrafts),
      switchMap(() => {
        return this.http.getDrafts().pipe(
          map((drafts) => discoverActions.getDraftsSuccess({ drafts })),
          catchError((errorMessage) => of(discoverActions.getDraftsError({ errorMessage }))),
        );
      }),
    ),
  );

  getDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(discoverActions.getDraft),
      switchMap(({ payload }) => {
        return this.http.getDraft(payload).pipe(
          map((draft) => discoverActions.getDraftSuccess({ draft })),
          catchError((errorMessage) => of(discoverActions.getDraftError({ errorMessage }))),
        );
      }),
    ),
  );

  deleteDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(discoverActions.deleteDraft),
      switchMap(({ payload }) => {
        return this.http.deleteDraft(payload).pipe(
          map(() => discoverActions.deleteDraftSuccess()),
          catchError((errorMessage) => of(discoverActions.deleteDraftError({ errorMessage }))),
        );
      }),
    ),
  );
}
