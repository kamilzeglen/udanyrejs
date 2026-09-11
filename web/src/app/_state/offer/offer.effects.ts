import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as offerActions from '@state/offer/offer.actions';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { OffersHttpService } from '@core/_http/offers.http.service';

@Injectable()
export class OfferEffects {
  constructor(
    private actions$: Actions,
    private http: OffersHttpService,
  ) {}

  getOffers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.getOffers),
      switchMap(({ payload }) => {
        const { all: _all, count: _count, ...rest } = payload;
        return this.http.getOffers(rest).pipe(
          map((offers) => {
            return offerActions.getOffersSuccess({ offers: offers });
          }),
          catchError((errorMessage) => {
            return of(offerActions.getOfferError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  getOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.getOffer),
      switchMap(({ payload }) => {
        return this.http.getOffer(payload).pipe(
          map((offer) => {
            return offerActions.getOfferSuccess({ offer });
          }),
          catchError((errorMessage) => {
            return of(offerActions.getOfferError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  createOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.createOffer),
      switchMap(({ payload }) => {
        return this.http.createOffer(payload).pipe(
          map((offer) => {
            return offerActions.createOfferSuccess({ offer });
          }),
          catchError((errorMessage) => {
            return of(offerActions.createOfferError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  updateOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.updateOffer),
      switchMap(({ payload }) => {
        return this.http.updateOffer(payload).pipe(
          map((offer) => {
            return offerActions.updateOfferSuccess({ offer });
          }),
          catchError((errorMessage) => {
            return of(offerActions.updateOfferError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  deleteOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.deleteOffer),
      switchMap(({ payload }) => {
        return this.http.deleteOffer(payload).pipe(
          map(() => {
            return offerActions.deleteOfferSuccess();
          }),
          catchError((errorMessage) => {
            return of(offerActions.deleteOfferError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  deactivateOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.deactivateOffer),
      switchMap(({ payload }) => {
        return this.http.deactivateOffer(payload).pipe(
          map(() => {
            return offerActions.deactivateOfferSuccess();
          }),
          catchError((errorMessage) => {
            return of(offerActions.deactivateOfferError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  activateOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.activateOffer),
      switchMap(({ payload }) => {
        return this.http.activateOffer(payload).pipe(
          map(() => {
            return offerActions.activateOfferSuccess();
          }),
          catchError((errorMessage) => {
            return of(offerActions.activateOfferError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  scrapeOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(offerActions.scrapeOffer),
      switchMap(({ payload }) => {
        return this.http.scrapeOffer(payload).pipe(
          map((scrapedOffer) => {
            return offerActions.scrapeOfferSuccess({ scrapedOffer });
          }),
          catchError((errorMessage) => {
            return of(offerActions.scrapeOfferError({ errorMessage }));
          }),
        );
      }),
    ),
  );
}
