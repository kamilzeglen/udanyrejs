import {createFeatureSelector, createSelector} from '@ngrx/store';
import {CommonState} from './common.state';


export const selectCommonState = createFeatureSelector<CommonState>('common');

export const selectLoading = createSelector(selectCommonState, state => state.loading);

export const selectCompanies = createSelector(selectCommonState, state => state.companies);
export const selectShips = createSelector(selectCommonState, state => state.ships);
export const selectCategories = createSelector(selectCommonState, state => state.categories);
export const selectDestinations = createSelector(selectCommonState, state => state.destinations);
