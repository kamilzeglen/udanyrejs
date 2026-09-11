import { initialState, OfferState } from './offer.state';
import { Action, createReducer, on } from '@ngrx/store';
import * as offerActions from '@state/offer/offer.actions';

const reducer = createReducer(
  initialState,

  on(offerActions.getOffers, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
    offers: [],
  })),
  on(offerActions.getOffersSuccess, (state, { offers }) => ({
    ...state,
    loading: false,
    offers: offers.data,
    pagination: offers.pagination,
  })),
  on(offerActions.getOffersError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
    offers: [],
  })),

  on(offerActions.scrapeOffer, (state) => ({
    ...state,
    scraping: true,
  })),
  on(offerActions.scrapeOfferSuccess, (state) => ({
    ...state,
    scraping: false,
  })),
  on(offerActions.scrapeOfferError, (state) => ({
    ...state,
    scraping: false,
  })),
);

export function offerReducer(state: OfferState | undefined, action: Action): OfferState {
  return reducer(state, action);
}
