import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import * as offerActions from '@state/offer/offer.actions';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {OffersHttpService} from '../../_core/http/offers.http.service';

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
        return this.http.getOffers(payload).pipe(
          map(offers => {
            return offerActions.getOffersSuccess({offers});
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
          map(() => {
            return offerActions.updateOfferSuccess();
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
