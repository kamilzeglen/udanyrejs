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
);

export function offerReducer(state: OfferState | undefined, action: Action): OfferState {
  return reducer(state, action);
}
