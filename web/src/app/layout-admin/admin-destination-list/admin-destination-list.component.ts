import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, ReplaySubject, take, takeUntil } from 'rxjs';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { AllDeviceInfo, Destination } from '@interfaces';
import { CommonFacade } from '@state/common';
import { RouterFacade } from '@state/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RowSelection } from '@shared/row-selection/row-selection';
import { MatDialog } from '@angular/material/dialog';
import { ImportModalComponent } from '@shared/import-modal/import-modal.component';
import { ImportExportFacade } from '@state/importExport';
import { triggerFileDownload } from '@core/utils/trigger-file-download.util';

interface DestinationRow extends Destination {
  selected: boolean;
}

interface DestinationListViewModel {
  rows: DestinationRow[];
  selectedCount: number;
  headerChecked: boolean;
  headerIndeterminate: boolean;
}

@Component({
  selector: 'app-admin-destination-list',
  templateUrl: './admin-destination-list.component.html',
  styleUrl: './admin-destination-list.component.scss',
})
export class AdminDestinationListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public destinations$ = this.commonFacade.destinations$;
  public loading$ = this.commonFacade.loading$;

  public allColumns: string[] = [
    'select',
    'id',
    'name',
    'offerCount',
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

  public viewModel$ = combineLatest([this.destinations$, this.selection.selectedIds$]).pipe(
    map(([destinations, selectedIds]) => this.buildViewModel(destinations || [], selectedIds)),
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

    this.commonFacade.deleteDestinationSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto kategorie');
      this.commonFacade.getDestinations();
    });

    this.commonFacade.bulkDeleteDestinationsSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ deletedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Usunięto', deletedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getDestinations();
      });

    this.commonFacade.bulkDeleteDestinationsError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się usunąć zaznaczonych kierunków');
    });

    this.commonFacade.bulkActivateDestinationsSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Aktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getDestinations();
      });

    this.commonFacade.bulkActivateDestinationsError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się aktywować zaznaczonych kierunków');
    });

    this.commonFacade.bulkDeactivateDestinationsSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Dezaktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getDestinations();
      });

    this.commonFacade.bulkDeactivateDestinationsError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się dezaktywować zaznaczonych kierunków');
    });

    this.importExportFacade.exportEntitiesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ entityType, blob, filename }) => {
        if (entityType !== 'destination') {
          return;
        }

        triggerFileDownload(blob, filename);
      });

    this.importExportFacade.exportEntitiesError$.pipe(takeUntil(this.destroy$)).subscribe(({ entityType }) => {
      if (entityType !== 'destination') {
        return;
      }

      this.snackService.showError('Nie udało się wyeksportować kierunków');
    });

    this.commonFacade.getDestinations();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addDestination(): void {
    const linkParams = ['/admin/destinations/add/'];
    this.routerFacade.changeRoute({ linkParams });
  }

  public editDestination(destination: Destination): void {
    const linkParams = ['/admin/destinations/edit/' + destination.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public deleteDestination(destination: Destination): void {
    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz usunąć region: ' + destination.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteDestination({ id: destination.id });
      });
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['select', 'id', 'name', 'isActive', 'actions', 'createdAt'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['select', 'id', 'name', 'isActive', 'actions', 'createdAt'];
    }
    return [];
  }

  public toggleSelectAll(rows: DestinationRow[]): void {
    const ids = rows.map((row) => row.id);
    const allSelected = rows.length > 0 && rows.every((row) => row.selected);

    if (allSelected) {
      this.selection.deselectMany(ids);
      return;
    }

    this.selection.selectMany(ids);
  }

  public bulkDeleteSelectedDestinations(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz trwale usunąć ${ids.length} zaznaczon${ids.length === 1 ? 'y kierunek' : 'e kierunki'}? Tej operacji nie można cofnąć.`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeleteDestinations({ ids });
        });
    });
  }

  public openImport(): void {
    this.dialog
      .open(ImportModalComponent, {
        width: '600px',
        data: {
          entityType: 'destination',
          entityLabelSingular: 'kierunek',
          entityLabelPlural: 'kierunki',
          acceptExtension: '.csv',
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((refreshed) => {
        if (refreshed) {
          this.commonFacade.getDestinations();
        }
      });
  }

  public exportAllDestinations(): void {
    this.importExportFacade.exportEntities({ entityType: 'destination' });
  }

  public exportSelectedDestinations(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      this.importExportFacade.exportEntities({ entityType: 'destination', ids: Array.from(selectedIds) });
    });
  }

  public bulkActivateSelectedDestinations(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz aktywować ${ids.length} zaznaczon${ids.length === 1 ? 'y kierunek' : 'e kierunki'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkActivateDestinations({ ids });
        });
    });
  }

  public bulkDeactivateSelectedDestinations(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz dezaktywować ${ids.length} zaznaczon${ids.length === 1 ? 'y kierunek' : 'e kierunki'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeactivateDestinations({ ids });
        });
    });
  }

  private buildBulkResultMessage(action: string, successCount: number, failedCount: number): string {
    if (failedCount === 0) {
      return `${action} ${successCount} kierunek(ów).`;
    }

    return `${action} ${successCount} kierunek(ów), ${failedCount} nie udało się przetworzyć.`;
  }

  private buildViewModel(destinations: Destination[], selectedIds: Set<string>): DestinationListViewModel {
    const rows = destinations.map((destination) => ({ ...destination, selected: selectedIds.has(destination.id) }));
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
