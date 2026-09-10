import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmailState } from './email.state';

export const selectEmailState = createFeatureSelector<EmailState>('email');

export const selectEmailSent = createSelector(selectEmailState, (state) => state.emailSent);
export const selectSending = createSelector(selectEmailState, (state) => state.sending);
