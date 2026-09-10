import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectUserAuthState = createFeatureSelector<AuthState>('auth');

export const selectMyself = createSelector(selectUserAuthState, (state) => state.myself);

export const selectLoading = createSelector(selectUserAuthState, (state) => state.loading);

export const selectErrorMessage = createSelector(selectUserAuthState, (state) => state.errorMessage);
