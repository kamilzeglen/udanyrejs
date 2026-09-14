import { settingsReducer } from './settings.reducer';
import { initialState } from './settings.state';
import * as settingsActions from './settings.actions';
import { Settings } from '@interfaces';

describe('settingsReducer', () => {
  const settings: Settings = {
    id: 'settings-1',
    scrapingEnabled: true,
    scrapeHour: 4,
    scrapeMinute: 0,
    syncRequestDelayMs: 3000,
    lastSyncStartedAt: null,
    lastSyncFinishedAt: null,
    lastSyncStatus: null,
    lastSyncSummary: null,
    termCleanupEnabled: false,
    cleanupHour: 3,
    cleanupMinute: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('sets loading and clears errorMessage on getSettings', () => {
    const state = settingsReducer(initialState, settingsActions.getSettings());

    expect(state.loading).toBe(true);
    expect(state.errorMessage).toBe(null);
  });

  it('stores the settings and clears loading on getSettingsSuccess', () => {
    const state = settingsReducer(initialState, settingsActions.getSettingsSuccess({ settings }));

    expect(state.loading).toBe(false);
    expect(state.settings).toEqual(settings);
  });

  it('clears loading and sets errorMessage on getSettingsError', () => {
    const state = settingsReducer(initialState, settingsActions.getSettingsError({ errorMessage: 'boom' }));

    expect(state.loading).toBe(false);
    expect(state.errorMessage).toBe('boom');
  });

  it('sets loading and clears errorMessage on updateSettings', () => {
    const state = settingsReducer(
      initialState,
      settingsActions.updateSettings({ payload: { scrapingEnabled: false } }),
    );

    expect(state.loading).toBe(true);
    expect(state.errorMessage).toBe(null);
  });

  it('stores the updated settings and clears loading on updateSettingsSuccess', () => {
    const updated = { ...settings, scrapingEnabled: false };
    const state = settingsReducer(initialState, settingsActions.updateSettingsSuccess({ settings: updated }));

    expect(state.loading).toBe(false);
    expect(state.settings).toEqual(updated);
  });

  it('clears loading and sets errorMessage on updateSettingsError', () => {
    const state = settingsReducer(initialState, settingsActions.updateSettingsError({ errorMessage: 'boom' }));

    expect(state.loading).toBe(false);
    expect(state.errorMessage).toBe('boom');
  });

  it('sets runningSyncNow and clears errorMessage on runSyncNow', () => {
    const state = settingsReducer(initialState, settingsActions.runSyncNow());

    expect(state.runningSyncNow).toBe(true);
    expect(state.errorMessage).toBe(null);
  });

  it('clears runningSyncNow on runSyncNowSuccess', () => {
    const running = { ...initialState, runningSyncNow: true };
    const state = settingsReducer(running, settingsActions.runSyncNowSuccess());

    expect(state.runningSyncNow).toBe(false);
  });

  it('clears runningSyncNow and sets errorMessage on runSyncNowError', () => {
    const running = { ...initialState, runningSyncNow: true };
    const state = settingsReducer(running, settingsActions.runSyncNowError({ errorMessage: 'boom' }));

    expect(state.runningSyncNow).toBe(false);
    expect(state.errorMessage).toBe('boom');
  });
});
