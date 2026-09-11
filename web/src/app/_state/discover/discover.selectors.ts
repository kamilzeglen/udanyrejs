import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DiscoverState } from './discover.state';

export const selectDiscoverState = createFeatureSelector<DiscoverState>('discover');

export const selectStarting = createSelector(selectDiscoverState, (state) => state.starting);
export const selectDrafts = createSelector(selectDiscoverState, (state) => state.drafts);
