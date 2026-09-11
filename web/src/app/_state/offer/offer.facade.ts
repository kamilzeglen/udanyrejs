import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@state';
import * as offerActions from './offer.actions';
import * as offerSelectors from './offer.selectors';
import { Offer, SearchOffersPayload } from '@interfaces';

@Injectable()
export class OfferFacade {
  public offers$ = this.store.select(offerSelectors.selectOffers);
  public loading$ = this.store.select(offerSelectors.selectLoading);
  public pagination$ = this.store.select(offerSelectors.selectPagination);

  public getOffersSuccess$ = this.actions.pipe(ofType(offerActions.getOffersSuccess));
  public getOfferSuccess$ = this.actions.pipe(ofType(offerActions.getOfferSuccess));
  public createOfferSuccess$ = this.actions.pipe(ofType(offerActions.createOfferSuccess));
  public createOfferError$ = this.actions.pipe(ofType(offerActions.createOfferError));
  public updateOfferSuccess$ = this.actions.pipe(ofType(offerActions.updateOfferSuccess));
  public updateOfferError$ = this.actions.pipe(ofType(offerActions.updateOfferError));
  public deleteOfferSuccess$ = this.actions.pipe(ofType(offerActions.deleteOfferSuccess));
  public deleteOfferError$ = this.actions.pipe(ofType(offerActions.deactivateOfferError));
  public activateOfferSuccess$ = this.actions.pipe(ofType(offerActions.activateOfferSuccess));
  public activateOfferError$ = this.actions.pipe(ofType(offerActions.activateOfferError));
  public deactivateOfferSuccess$ = this.actions.pipe(ofType(offerActions.deactivateOfferSuccess));
  public deactivateOfferError$ = this.actions.pipe(ofType(offerActions.deactivateOfferError));
  public scraping$ = this.store.select(offerSelectors.selectScraping);
  public scrapeOfferSuccess$ = this.actions.pipe(ofType(offerActions.scrapeOfferSuccess));
  public scrapeOfferError$ = this.actions.pipe(ofType(offerActions.scrapeOfferError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions,
  ) {}

  public getOffers(payload?: Partial<SearchOffersPayload>): void {
    this.store.dispatch(offerActions.getOffers({ payload }));
  }

  public getOffer(payload: { id: string }): void {
    this.store.dispatch(offerActions.getOffer({ payload }));
  }

  public createOffer(payload: { formData: Partial<Offer> }): void {
    this.store.dispatch(offerActions.createOffer({ payload }));
  }

  public updateOffer(payload: { id: string; formData: Partial<Offer> }): void {
    this.store.dispatch(offerActions.updateOffer({ payload }));
  }

  public deleteOffer(payload: { id: string }): void {
    this.store.dispatch(offerActions.deleteOffer({ payload }));
  }

  public deactivateOffer(payload: { id: string }): void {
    this.store.dispatch(offerActions.deactivateOffer({ payload }));
  }

  public activateOffer(payload: { id: string }): void {
    this.store.dispatch(offerActions.activateOffer({ payload }));
  }

  public scrapeOffer(payload: { url: string }): void {
    this.store.dispatch(offerActions.scrapeOffer({ payload }));
  }
}
