import { createAction, props } from '@ngrx/store';
import { Settings } from '@interfaces';

export const getSettings = createAction('[Settings] Get Settings');
export const getSettingsSuccess = createAction('[Settings] Get Settings Success', props<{ settings: Settings }>());
export const getSettingsError = createAction('[Settings] Get Settings Error', props<{ errorMessage: string }>());

export const updateSettings = createAction('[Settings] Update Settings', props<{ payload: Partial<Settings> }>());
export const updateSettingsSuccess = createAction(
  '[Settings] Update Settings Success',
  props<{ settings: Settings }>(),
);
export const updateSettingsError = createAction('[Settings] Update Settings Error', props<{ errorMessage: string }>());

export const runSyncNow = createAction('[Settings] Run Sync Now');
export const runSyncNowSuccess = createAction('[Settings] Run Sync Now Success');
export const runSyncNowError = createAction('[Settings] Run Sync Now Error', props<{ errorMessage: string }>());
