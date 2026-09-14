import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EMPTY, of } from 'rxjs';
import { AdminSettingsComponent } from './admin-settings.component';
import { SettingsFacade } from '@state/settings';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { Settings } from '@interfaces';

describe('AdminSettingsComponent', () => {
  let component: AdminSettingsComponent;
  let fixture: ComponentFixture<AdminSettingsComponent>;
  let settingsFacade: {
    settings$: unknown;
    runningSyncNow$: unknown;
    updateSettingsSuccess$: unknown;
    updateSettingsError$: unknown;
    runSyncNowSuccess$: unknown;
    runSyncNowError$: unknown;
    getSettings: jasmine.Spy;
    updateSettings: jasmine.Spy;
    runSyncNow: jasmine.Spy;
  };

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

  beforeEach(async () => {
    settingsFacade = {
      settings$: of(settings),
      runningSyncNow$: of(false),
      updateSettingsSuccess$: EMPTY,
      updateSettingsError$: EMPTY,
      runSyncNowSuccess$: EMPTY,
      runSyncNowError$: EMPTY,
      getSettings: jasmine.createSpy('getSettings'),
      updateSettings: jasmine.createSpy('updateSettings'),
      runSyncNow: jasmine.createSpy('runSyncNow'),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AdminSettingsComponent],
      providers: [
        { provide: SettingsFacade, useValue: settingsFacade },
        { provide: SnackbarService, useValue: { showInfo: (): void => undefined, showError: (): void => undefined } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSettingsComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('requests the settings on init', () => {
    expect(settingsFacade.getSettings).toHaveBeenCalled();
  });

  it('patches the form with the loaded settings, converting the delay to seconds', () => {
    expect(component.settingsForm.value).toEqual({
      scrapingEnabled: true,
      scrapeHour: 4,
      scrapeMinute: 0,
      syncRequestDelaySeconds: 3,
      termCleanupEnabled: false,
      cleanupHour: 3,
      cleanupMinute: 0,
    });
  });

  it('marks the form invalid when scrapeHour is out of range', () => {
    component.settingsForm.patchValue({ scrapeHour: 24 });
    expect(component.settingsForm.invalid).toBe(true);
  });

  it('marks the form invalid when scrapeMinute is out of range', () => {
    component.settingsForm.patchValue({ scrapeMinute: 60 });
    expect(component.settingsForm.invalid).toBe(true);
  });

  it('does not dispatch updateSettings when the form is invalid', () => {
    component.settingsForm.patchValue({ scrapeHour: 24 });
    component.submitForm();
    expect(settingsFacade.updateSettings).not.toHaveBeenCalled();
  });

  it('dispatches updateSettings with the delay converted back to milliseconds', () => {
    component.settingsForm.patchValue({
      scrapingEnabled: false,
      scrapeHour: 6,
      scrapeMinute: 30,
      syncRequestDelaySeconds: 5,
      termCleanupEnabled: true,
      cleanupHour: 2,
      cleanupMinute: 15,
    });

    component.submitForm();

    expect(settingsFacade.updateSettings).toHaveBeenCalledWith({
      scrapingEnabled: false,
      scrapeHour: 6,
      scrapeMinute: 30,
      syncRequestDelayMs: 5000,
      termCleanupEnabled: true,
      cleanupHour: 2,
      cleanupMinute: 15,
    });
  });

  it('dispatches runSyncNow when triggered', () => {
    component.runSyncNow();
    expect(settingsFacade.runSyncNow).toHaveBeenCalled();
  });
});
