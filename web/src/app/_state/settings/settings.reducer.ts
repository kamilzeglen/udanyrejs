import { Action, createReducer, on } from '@ngrx/store';
import { initialState, SettingsState } from './settings.state';
import * as settingsActions from '@state/settings/settings.actions';

const reducer = createReducer(
  initialState,

  on(settingsActions.getSettings, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
  })),
  on(settingsActions.getSettingsSuccess, (state, { settings }) => ({
    ...state,
    loading: false,
    settings,
  })),
  on(settingsActions.getSettingsError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
  })),

  on(settingsActions.updateSettings, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
  })),
  on(settingsActions.updateSettingsSuccess, (state, { settings }) => ({
    ...state,
    loading: false,
    settings,
  })),
  on(settingsActions.updateSettingsError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
  })),

  on(settingsActions.runSyncNow, (state) => ({
    ...state,
    runningSyncNow: true,
    errorMessage: null,
  })),
  on(settingsActions.runSyncNowSuccess, (state) => ({
    ...state,
    runningSyncNow: false,
  })),
  on(settingsActions.runSyncNowError, (state, { errorMessage }) => ({
    ...state,
    runningSyncNow: false,
    errorMessage,
  })),
);

export function settingsReducer(state: SettingsState | undefined, action: Action): SettingsState {
  return reducer(state, action);
}
