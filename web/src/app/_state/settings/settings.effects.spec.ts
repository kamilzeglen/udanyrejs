import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { SettingsEffects } from './settings.effects';
import { SettingsHttpService } from '@core/_http/settings.http.service';
import * as settingsActions from './settings.actions';
import { Settings } from '@interfaces';

describe('SettingsEffects.getSettings$', () => {
  let actions$: Observable<unknown>;
  let effects: SettingsEffects;
  let httpService: jasmine.SpyObj<SettingsHttpService>;

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

  beforeEach(() => {
    httpService = jasmine.createSpyObj('SettingsHttpService', ['getSettings', 'updateSettings', 'runSyncNow']);

    TestBed.configureTestingModule({
      providers: [
        SettingsEffects,
        provideMockActions(() => actions$),
        { provide: SettingsHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(SettingsEffects);
  });

  it('dispatches getSettingsSuccess when the HTTP call succeeds', (done) => {
    httpService.getSettings.and.returnValue(of(settings));
    actions$ = of(settingsActions.getSettings());

    effects.getSettings$.subscribe((action) => {
      expect(action).toEqual(settingsActions.getSettingsSuccess({ settings }));
      done();
    });
  });

  it('dispatches getSettingsError when the HTTP call fails', (done) => {
    httpService.getSettings.and.returnValue(throwError(() => 'network error'));
    actions$ = of(settingsActions.getSettings());

    effects.getSettings$.subscribe((action) => {
      expect(action).toEqual(settingsActions.getSettingsError({ errorMessage: 'network error' }));
      done();
    });
  });
});

describe('SettingsEffects.updateSettings$', () => {
  let actions$: Observable<unknown>;
  let effects: SettingsEffects;
  let httpService: jasmine.SpyObj<SettingsHttpService>;

  const settings: Settings = {
    id: 'settings-1',
    scrapingEnabled: false,
    scrapeHour: 6,
    scrapeMinute: 30,
    syncRequestDelayMs: 5000,
    lastSyncStartedAt: null,
    lastSyncFinishedAt: null,
    lastSyncStatus: null,
    lastSyncSummary: null,
    termCleanupEnabled: false,
    cleanupHour: 3,
    cleanupMinute: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    httpService = jasmine.createSpyObj('SettingsHttpService', ['getSettings', 'updateSettings', 'runSyncNow']);

    TestBed.configureTestingModule({
      providers: [
        SettingsEffects,
        provideMockActions(() => actions$),
        { provide: SettingsHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(SettingsEffects);
  });

  it('dispatches updateSettingsSuccess when the HTTP call succeeds', (done) => {
    httpService.updateSettings.and.returnValue(of(settings));
    actions$ = of(settingsActions.updateSettings({ payload: { scrapingEnabled: false } }));

    effects.updateSettings$.subscribe((action) => {
      expect(action).toEqual(settingsActions.updateSettingsSuccess({ settings }));
      done();
    });
  });

  it('dispatches updateSettingsError when the HTTP call fails', (done) => {
    httpService.updateSettings.and.returnValue(throwError(() => 'network error'));
    actions$ = of(settingsActions.updateSettings({ payload: { scrapingEnabled: false } }));

    effects.updateSettings$.subscribe((action) => {
      expect(action).toEqual(settingsActions.updateSettingsError({ errorMessage: 'network error' }));
      done();
    });
  });
});

describe('SettingsEffects.runSyncNow$', () => {
  let actions$: Observable<unknown>;
  let effects: SettingsEffects;
  let httpService: jasmine.SpyObj<SettingsHttpService>;

  beforeEach(() => {
    httpService = jasmine.createSpyObj('SettingsHttpService', ['getSettings', 'updateSettings', 'runSyncNow']);

    TestBed.configureTestingModule({
      providers: [
        SettingsEffects,
        provideMockActions(() => actions$),
        { provide: SettingsHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(SettingsEffects);
  });

  it('dispatches runSyncNowSuccess when the HTTP call succeeds', (done) => {
    httpService.runSyncNow.and.returnValue(of({ started: true }));
    actions$ = of(settingsActions.runSyncNow());

    effects.runSyncNow$.subscribe((action) => {
      expect(action).toEqual(settingsActions.runSyncNowSuccess());
      done();
    });
  });

  it('dispatches runSyncNowError when the HTTP call fails', (done) => {
    httpService.runSyncNow.and.returnValue(throwError(() => 'network error'));
    actions$ = of(settingsActions.runSyncNow());

    effects.runSyncNow$.subscribe((action) => {
      expect(action).toEqual(settingsActions.runSyncNowError({ errorMessage: 'network error' }));
      done();
    });
  });
});
