import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommonState } from './common.state';

export const selectCommonState = createFeatureSelector<CommonState>('common');

export const selectLoading = createSelector(selectCommonState, (state) => state.loading);

export const selectCompanies = createSelector(selectCommonState, (state) => state.companies);
export const selectShips = createSelector(selectCommonState, (state) => state.ships);
export const selectCategories = createSelector(selectCommonState, (state) => state.categories);
export const selectLogs = createSelector(selectCommonState, (state) => state.logs);
export const selectDestinations = createSelector(selectCommonState, (state) => state.destinations);
export const selectCabinTypes = createSelector(selectCommonState, (state) => state.cabinTypes);
