import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@state';
import * as settingsActions from './settings.actions';
import * as settingsSelectors from './settings.selectors';
import { Settings } from '@interfaces';

@Injectable()
export class SettingsFacade {
  public settings$ = this.store.select(settingsSelectors.selectSettings);
  public loading$ = this.store.select(settingsSelectors.selectLoading);
  public runningSyncNow$ = this.store.select(settingsSelectors.selectRunningSyncNow);

  public getSettingsSuccess$ = this.actions.pipe(ofType(settingsActions.getSettingsSuccess));
  public getSettingsError$ = this.actions.pipe(ofType(settingsActions.getSettingsError));
  public updateSettingsSuccess$ = this.actions.pipe(ofType(settingsActions.updateSettingsSuccess));
  public updateSettingsError$ = this.actions.pipe(ofType(settingsActions.updateSettingsError));
  public runSyncNowSuccess$ = this.actions.pipe(ofType(settingsActions.runSyncNowSuccess));
  public runSyncNowError$ = this.actions.pipe(ofType(settingsActions.runSyncNowError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions,
  ) {}

  public getSettings(): void {
    this.store.dispatch(settingsActions.getSettings());
  }

  public updateSettings(payload: Partial<Settings>): void {
    this.store.dispatch(settingsActions.updateSettings({ payload }));
  }

  public runSyncNow(): void {
    this.store.dispatch(settingsActions.runSyncNow());
  }
}
