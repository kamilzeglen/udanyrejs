import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {AppState} from '@state';
import * as offerActions from './offer.actions';
import * as offerSelectors from './offer.selectors';
import {Offer} from '@interfaces';


@Injectable()
export class OfferFacade {
  public offers$ = this.store.select(offerSelectors.selectOffers);
  public loading$ = this.store.select(offerSelectors.selectLoading);

  public getOffersSuccess$ = this.actions.pipe(ofType(offerActions.getOffersSuccess));
  public getOfferSuccess$ = this.actions.pipe(ofType(offerActions.getOfferSuccess));
  public createOfferSuccess$ = this.actions.pipe(ofType(offerActions.createOfferSuccess));

  constructor(
    private store: Store<AppState>,
    private actions: Actions
  ) {
  }

  public getOffers(): void {
    this.store.dispatch(offerActions.getOffers());
  }

  public getOffer(payload: {id: string}): void {
    this.store.dispatch(offerActions.getOffer({payload}));
  }

  public createOffer(payload: Partial<Offer>): void {
    this.store.dispatch(offerActions.createOffer({payload}));
  }

  public deleteOffer(): void {
    this.store.dispatch(offerActions.getOffers());
  }
}
