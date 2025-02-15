import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import * as scrapperActions from '@state/scrapper/scrapper.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {ScrapperHttpService} from '@core/_http/scrapper.http.service';

@Injectable()
export class ScrapperEffects {
  constructor(
    private actions$: Actions,
    private http: ScrapperHttpService,
  ) {
  }

  scrapOfferFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scrapperActions.scrapOfferFile),
      switchMap(({payload}) => {
        return this.http.scrapOffer(payload).pipe(
          map((offer) => {
            return scrapperActions.scrapOfferFileSuccess({offer});
          }),
          catchError(errorMessage => {
            return of(scrapperActions.scrapOfferFileError({errorMessage}));
          })
        );
      })
    )
  )

  syncOfferPrice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scrapperActions.syncOfferPrice),
      switchMap(({payload}) => {
        return this.http.syncOfferPrice(payload).pipe(
          map(() => {
            return scrapperActions.syncOfferPriceSuccess();
          }),
          catchError(errorMessage => {
            return of(scrapperActions.syncOfferPriceError({errorMessage}));
          })
        );
      })
    )
  )
}
