import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SettingsState } from './settings.state';

export const selectSettingsState = createFeatureSelector<SettingsState>('settings');

export const selectSettings = createSelector(selectSettingsState, (state) => state.settings);
export const selectLoading = createSelector(selectSettingsState, (state) => state.loading);
export const selectRunningSyncNow = createSelector(selectSettingsState, (state) => state.runningSyncNow);
