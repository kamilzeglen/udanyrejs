import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, ReplaySubject, take, takeUntil } from 'rxjs';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { AllDeviceInfo, Company } from '@interfaces';
import { CommonFacade } from '@state/common';
import { RouterFacade } from '@state/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RowSelection } from '@shared/row-selection/row-selection';
import { MatDialog } from '@angular/material/dialog';
import { ImportModalComponent } from '@shared/import-modal/import-modal.component';
import { ImportExportFacade } from '@state/importExport';
import { triggerFileDownload } from '@core/utils/trigger-file-download.util';

interface CompanyRow extends Company {
  selected: boolean;
}

interface CompanyListViewModel {
  rows: CompanyRow[];
  selectedCount: number;
  headerChecked: boolean;
  headerIndeterminate: boolean;
}

@Component({
  selector: 'app-admin-company-list',
  templateUrl: './admin-company-list.component.html',
  styleUrl: './admin-company-list.component.scss',
})
export class AdminCompanyListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public companies$ = this.commonFacade.companies$;
  public ships$ = this.commonFacade.ships$;
  public loading$ = this.commonFacade.loading$;

  public allColumns: string[] = [
    'select',
    'id',
    'name',
    'key',
    'seoTitle',
    'seoDescription',
    'description',
    'image',
    'isActive',
    'actions',
    'updatedAt',
    'createdAt',
  ];

  public columnsToDisplay: string[];

  public readonly selection = new RowSelection();

  public viewModel$ = combineLatest([this.companies$, this.selection.selectedIds$]).pipe(
    map(([companies, selectedIds]) => this.buildViewModel(companies || [], selectedIds)),
  );

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly deviceInfoService: DeviceInfoService,
    private readonly routerFacade: RouterFacade,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly snackService: SnackbarService,
    private readonly dialog: MatDialog,
    private readonly importExportFacade: ImportExportFacade,
  ) {}

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.commonFacade.deleteCompanySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto firmę');
      this.commonFacade.getCompanies();
    });

    this.commonFacade.bulkDeleteCompaniesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ deletedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Usunięto', deletedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getCompanies();
      });

    this.commonFacade.bulkDeleteCompaniesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się usunąć zaznaczonych firm');
    });

    this.commonFacade.bulkActivateCompaniesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Aktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getCompanies();
      });

    this.commonFacade.bulkActivateCompaniesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się aktywować zaznaczonych firm');
    });

    this.commonFacade.bulkDeactivateCompaniesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Dezaktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getCompanies();
      });

    this.commonFacade.bulkDeactivateCompaniesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się dezaktywować zaznaczonych firm');
    });

    this.importExportFacade.exportEntitiesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ entityType, blob, filename }) => {
        if (entityType !== 'company') {
          return;
        }

        triggerFileDownload(blob, filename);
      });

    this.importExportFacade.exportEntitiesError$.pipe(takeUntil(this.destroy$)).subscribe(({ entityType }) => {
      if (entityType !== 'company') {
        return;
      }

      this.snackService.showError('Nie udało się wyeksportować firm');
    });

    this.commonFacade.getCompanies();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addCompany(): void {
    const linkParams = ['/admin/companies/add/'];
    this.routerFacade.changeRoute({ linkParams });
  }

  public editCompany(company: Company): void {
    const linkParams = ['/admin/companies/edit/' + company.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public deleteCompany(company: Company): void {
    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz usunąć firmę: ' + company.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteCompany({ id: company.id });
      });
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['select', 'id', 'name', 'image', 'isActive', 'description', 'createdAt', 'expand'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['select', 'id', 'name', 'image', 'isActive', 'createdAt', 'expand'];
    }
    return [];
  }

  public bulkDeleteSelectedCompanies(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz trwale usunąć ${ids.length} zaznaczon${ids.length === 1 ? 'ą firmę' : 'e firmy'}? Tej operacji nie można cofnąć.`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeleteCompanies({ ids });
        });
    });
  }

  public openImport(): void {
    this.dialog
      .open(ImportModalComponent, {
        width: '600px',
        data: {
          entityType: 'company',
          entityLabelSingular: 'firma',
          entityLabelPlural: 'firmy',
          acceptExtension: '.zip',
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((refreshed) => {
        if (refreshed) {
          this.commonFacade.getCompanies();
        }
      });
  }

  public exportAllCompanies(): void {
    this.importExportFacade.exportEntities({ entityType: 'company' });
  }

  public exportSelectedCompanies(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      this.importExportFacade.exportEntities({ entityType: 'company', ids: Array.from(selectedIds) });
    });
  }

  public bulkActivateSelectedCompanies(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz aktywować ${ids.length} zaznaczon${ids.length === 1 ? 'ą firmę' : 'e firmy'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkActivateCompanies({ ids });
        });
    });
  }

  public bulkDeactivateSelectedCompanies(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz dezaktywować ${ids.length} zaznaczon${ids.length === 1 ? 'ą firmę' : 'e firmy'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeactivateCompanies({ ids });
        });
    });
  }

  private buildBulkResultMessage(action: string, successCount: number, failedCount: number): string {
    if (failedCount === 0) {
      return `${action} ${successCount} firm.`;
    }

    return `${action} ${successCount} firm, ${failedCount} nie udało się przetworzyć.`;
  }

  public toggleSelectAll(rows: CompanyRow[]): void {
    const ids = rows.map((row) => row.id);
    const allSelected = rows.length > 0 && rows.every((row) => row.selected);

    if (allSelected) {
      this.selection.deselectMany(ids);
      return;
    }

    this.selection.selectMany(ids);
  }

  private buildViewModel(companies: Company[], selectedIds: Set<string>): CompanyListViewModel {
    const rows = companies.map((company) => ({ ...company, selected: selectedIds.has(company.id) }));
    const allSelected = rows.length > 0 && rows.every((row) => row.selected);
    const someSelected = rows.some((row) => row.selected);

    return {
      rows,
      selectedCount: selectedIds.size,
      headerChecked: allSelected,
      headerIndeterminate: someSelected && !allSelected,
    };
  }
}
