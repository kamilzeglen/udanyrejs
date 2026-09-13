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

  on(offerActions.syncOffer, (state, { payload }) => ({
    ...state,
    syncingOfferId: payload.id,
  })),
  on(offerActions.syncOfferSuccess, (state) => ({
    ...state,
    syncingOfferId: null,
  })),
  on(offerActions.syncOfferError, (state) => ({
    ...state,
    syncingOfferId: null,
  })),

  on(offerActions.deleteOffers, (state) => ({
    ...state,
    bulkDeleting: true,
    errorMessage: null,
  })),
  on(offerActions.deleteOffersSuccess, (state) => ({
    ...state,
    bulkDeleting: false,
  })),
  on(offerActions.deleteOffersError, (state, { errorMessage }) => ({
    ...state,
    bulkDeleting: false,
    errorMessage,
  })),

  on(offerActions.syncOffers, (state) => ({
    ...state,
    bulkSyncing: true,
    errorMessage: null,
  })),
  on(offerActions.syncOffersSuccess, (state) => ({
    ...state,
    bulkSyncing: false,
  })),
  on(offerActions.syncOffersError, (state, { errorMessage }) => ({
    ...state,
    bulkSyncing: false,
    errorMessage,
  })),

  on(offerActions.syncTerms, (state) => ({
    ...state,
    bulkSyncingTerms: true,
    errorMessage: null,
  })),
  on(offerActions.syncTermsSuccess, (state) => ({
    ...state,
    bulkSyncingTerms: false,
  })),
  on(offerActions.syncTermsError, (state, { errorMessage }) => ({
    ...state,
    bulkSyncingTerms: false,
    errorMessage,
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
