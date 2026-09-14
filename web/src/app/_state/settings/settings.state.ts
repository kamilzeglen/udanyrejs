import { Settings } from '@interfaces';

export type SettingsState = Readonly<{
  settings: Settings;
  loading: boolean;
  runningSyncNow: boolean;
  errorMessage: string;
}>;

export const initialState: SettingsState = {
  settings: null,
  loading: false,
  runningSyncNow: false,
  errorMessage: null,
};
