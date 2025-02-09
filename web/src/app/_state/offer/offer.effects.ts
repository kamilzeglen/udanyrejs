import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import * as offerActions from '@state/offer/offer.actions';
import {delay, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {OffersHttpService} from '@core/_http/offers.http.service';

@Injectable()
export class OfferEffects {
  constructor(
    private actions$: Actions,
    private http: OffersHttpService,
  ) {
  }

  getOffers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.getOffers),
      switchMap(({payload}) => {
        const startTime = Date.now();

        return this.http.getOffers(payload).pipe(
          switchMap(result => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(500 - elapsedTime, 0);

            return of(offerActions.getOffersSuccess({result})).pipe(
              delay(remainingTime)
            );
          }),
          catchError(errorMessage => {
            return of(offerActions.getOfferError({errorMessage}));
          })
        );
      })
    )
  );


  getOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.getOffer),
      switchMap(({payload}) => {
        return this.http.getOffer(payload).pipe(
          map(offer => {
            return offerActions.getOfferSuccess({offer});
          }),
          catchError(errorMessage => {
            return of(offerActions.getOfferError({errorMessage}));
          })
        );
      })
    )
  );

  createOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.createOffer),
      switchMap(({payload}) => {
        return this.http.createOffer(payload).pipe(
          map((offer) => {
            return offerActions.createOfferSuccess({offer});
          }),
          catchError(errorMessage => {
            return of(offerActions.createOfferError({errorMessage}));
          })
        );
      })
    )
  )

  updateOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.updateOffer),
      switchMap(({payload}) => {
        return this.http.updateOffer(payload).pipe(
          map((offer) => {
            return offerActions.updateOfferSuccess({offer});
          }),
          catchError(errorMessage => {
            return of(offerActions.updateOfferError({errorMessage}));
          })
        );
      })
    )
  )

  deleteOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.deleteOffer),
      switchMap(({payload}) => {
        return this.http.deleteOffer(payload).pipe(
          map(() => {
            return offerActions.deleteOfferSuccess();
          }),
          catchError(errorMessage => {
            return of(offerActions.deleteOfferError({errorMessage}));
          })
        );
      })
    )
  )
}
