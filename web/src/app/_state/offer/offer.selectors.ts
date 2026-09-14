import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OfferState } from './offer.state';

export const selectOffersState = createFeatureSelector<OfferState>('offer');

export const selectOffers = createSelector(selectOffersState, (state) => state.offers);
export const selectLoading = createSelector(selectOffersState, (state) => state.loading);
export const selectLoadError = createSelector(selectOffersState, (state) => Boolean(state.errorMessage));
export const selectScraping = createSelector(selectOffersState, (state) => state.scraping);
export const selectSyncingOfferId = createSelector(selectOffersState, (state) => state.syncingOfferId);
export const selectBulkDeleting = createSelector(selectOffersState, (state) => state.bulkDeleting);
export const selectBulkSyncing = createSelector(selectOffersState, (state) => state.bulkSyncing);
export const selectBulkSyncingTerms = createSelector(selectOffersState, (state) => state.bulkSyncingTerms);
export const selectPagination = createSelector(selectOffersState, (state) => state.pagination);
