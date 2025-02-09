import {initialState, OfferState} from './offer.state';
import {Action, createReducer, on} from '@ngrx/store';
import * as offerActions from '@state/offer/offer.actions';


const reducer = createReducer(
  initialState,

  on(offerActions.getOffers, state => ({
    ...state,
    loading: true,
    errorMessage: null,
    offers: [],
    offersAmount: 0,
  })),
  on(offerActions.getOffersSuccess, (state, {result}) => ({
    ...state,
    loading: false,
    errorMessage: null,
    offers: result.offers,
    offersAmount: result.totalCount,
  })),
  on(offerActions.getOffersError, (state, {errorMessage}) => ({
    ...state,
    loading: false,
    errorMessage,
    offers: [],
    offersAmount: 0,
  })),
)

export function offerReducer(state: OfferState | undefined, action: Action): OfferState {
  return reducer(state, action);
}
