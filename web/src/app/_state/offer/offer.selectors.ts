import {createFeatureSelector, createSelector} from '@ngrx/store';
import {OfferState} from './offer.state';


export const selectOffersState = createFeatureSelector<OfferState>('offer');

export const selectOffers = createSelector(selectOffersState, state => state.offers);
export const selectLoading = createSelector(selectOffersState, state => state.loading);
