import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, map, ReplaySubject, takeUntil } from 'rxjs';
import { SettingsFacade } from '@state/settings';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { Settings } from '@interfaces';

const SYNC_STATUS_LABELS: Record<string, string> = {
  running: 'W trakcie',
  success: 'Zakończona sukcesem',
  error: 'Zakończona błędem',
};

export interface SettingsViewModel {
  settings: Settings;
  runDisabled: boolean;
  statusLabel: string;
}

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss',
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public settingsForm: FormGroup;

  public viewModel$ = combineLatest([this.settingsFacade.settings$, this.settingsFacade.runningSyncNow$]).pipe(
    map(([settings, runningSyncNow]) => this.buildViewModel(settings, runningSyncNow)),
  );

  constructor(
    private readonly settingsFacade: SettingsFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
  ) {}

  public ngOnInit(): void {
    this.settingsForm = this.fb.group({
      scrapingEnabled: [true],
      scrapeHour: [4, [Validators.required, Validators.min(0), Validators.max(23)]],
      scrapeMinute: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      syncRequestDelaySeconds: [3, [Validators.required, Validators.min(0)]],
      termCleanupEnabled: [false],
      cleanupHour: [3, [Validators.required, Validators.min(0), Validators.max(23)]],
      cleanupMinute: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
    });

    this.settingsFacade.settings$.pipe(takeUntil(this.destroy$)).subscribe((settings) => {
      if (!settings) {
        return;
      }

      this.settingsForm.patchValue({
        scrapingEnabled: settings.scrapingEnabled,
        scrapeHour: settings.scrapeHour,
        scrapeMinute: settings.scrapeMinute,
        syncRequestDelaySeconds: Math.round(settings.syncRequestDelayMs / 1000),
        termCleanupEnabled: settings.termCleanupEnabled,
        cleanupHour: settings.cleanupHour,
        cleanupMinute: settings.cleanupMinute,
      });
    });

    this.settingsFacade.updateSettingsSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Zapisano ustawienia');
    });

    this.settingsFacade.updateSettingsError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas zapisywania ustawień');
    });

    this.settingsFacade.runSyncNowSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Synchronizacja uruchomiona w tle');
    });

    this.settingsFacade.runSyncNowError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się uruchomić synchronizacji');
    });

    this.settingsFacade.getSettings();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public submitForm(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    const formValue = this.settingsForm.value;

    this.settingsFacade.updateSettings({
      scrapingEnabled: formValue.scrapingEnabled,
      scrapeHour: formValue.scrapeHour,
      scrapeMinute: formValue.scrapeMinute,
      syncRequestDelayMs: formValue.syncRequestDelaySeconds * 1000,
      termCleanupEnabled: formValue.termCleanupEnabled,
      cleanupHour: formValue.cleanupHour,
      cleanupMinute: formValue.cleanupMinute,
    });
  }

  public refreshStatus(): void {
    this.settingsFacade.getSettings();
  }

  public runSyncNow(): void {
    this.settingsFacade.runSyncNow();
  }

  private buildViewModel(settings: Settings, runningSyncNow: boolean): SettingsViewModel {
    return {
      settings,
      runDisabled: runningSyncNow || settings?.lastSyncStatus === 'running',
      statusLabel: settings?.lastSyncStatus ? SYNC_STATUS_LABELS[settings.lastSyncStatus] : null,
    };
  }
}
