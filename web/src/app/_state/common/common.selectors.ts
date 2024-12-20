import {createFeatureSelector, createSelector} from '@ngrx/store';
import {CommonState} from './common.state';


export const selectCommonState = createFeatureSelector<CommonState>('common');

export const selectCompanies = createSelector(selectCommonState, state => state.companies);
export const selectLoading = createSelector(selectCommonState, state => state.loading);
