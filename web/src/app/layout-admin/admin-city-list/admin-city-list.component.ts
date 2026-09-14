import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, ReplaySubject, take, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { AllDeviceInfo, City } from '@interfaces';
import { CommonFacade } from '@state/common';
import { RouterFacade } from '@state/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RowSelection } from '@shared/row-selection/row-selection';
import { MatDialog } from '@angular/material/dialog';
import { ImportModalComponent } from '@shared/import-modal/import-modal.component';
import { ImportExportFacade } from '@state/importExport';
import { triggerFileDownload } from '@core/utils/trigger-file-download.util';

export interface CityRow extends City {
  destinationNames: string;
}

interface SelectableCityRow extends CityRow {
  selected: boolean;
}

interface CityListViewModel {
  rows: SelectableCityRow[];
  selectedCount: number;
  headerChecked: boolean;
  headerIndeterminate: boolean;
}

@Component({
  selector: 'app-admin-city-list',
  templateUrl: './admin-city-list.component.html',
  styleUrl: './admin-city-list.component.scss',
})
export class AdminCityListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public cityRows$: Observable<CityRow[]> = this.commonFacade.cities$.pipe(
    map((cities) =>
      (cities ?? []).map((city) => ({
        ...city,
        destinationNames: city.destinations?.length
          ? city.destinations.map((destination) => destination.name).join(', ')
          : '-',
      })),
    ),
  );
  public loading$ = this.commonFacade.loading$;

  public allColumns: string[] = [
    'select',
    'id',
    'name',
    'destinationNames',
    'isActive',
    'actions',
    'updatedAt',
    'createdAt',
  ];

  public columnsToDisplay: string[];

  public readonly selection = new RowSelection();

  public viewModel$ = combineLatest([this.cityRows$, this.selection.selectedIds$]).pipe(
    map(([cities, selectedIds]) => this.buildViewModel(cities, selectedIds)),
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

  public ngOnInit(): void {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.commonFacade.deleteCitySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto miasto');
      this.commonFacade.getCities();
    });

    this.commonFacade.bulkDeleteCitiesSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ deletedIds, failedIds }) => {
      this.snackService.showInfo(this.buildBulkResultMessage('Usunięto', deletedIds.length, failedIds.length));
      this.selection.clear();
      this.commonFacade.getCities();
    });

    this.commonFacade.bulkDeleteCitiesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się usunąć zaznaczonych miast');
    });

    this.commonFacade.bulkActivateCitiesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Aktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getCities();
      });

    this.commonFacade.bulkActivateCitiesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się aktywować zaznaczonych miast');
    });

    this.commonFacade.bulkDeactivateCitiesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Dezaktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getCities();
      });

    this.commonFacade.bulkDeactivateCitiesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się dezaktywować zaznaczonych miast');
    });

    this.importExportFacade.exportEntitiesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ entityType, blob, filename }) => {
        if (entityType !== 'city') {
          return;
        }

        triggerFileDownload(blob, filename);
      });

    this.importExportFacade.exportEntitiesError$.pipe(takeUntil(this.destroy$)).subscribe(({ entityType }) => {
      if (entityType !== 'city') {
        return;
      }

      this.snackService.showError('Nie udało się wyeksportować miast');
    });

    this.commonFacade.getCities();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addCity(): void {
    this.routerFacade.changeRoute({ linkParams: ['/admin/cities/add/'] });
  }

  public editCity(city: City): void {
    this.routerFacade.changeRoute({ linkParams: ['/admin/cities/edit/' + city.id] });
  }

  public deleteCity(city: City): void {
    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz usunąć miasto: ' + city.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteCity({ id: city.id });
      });
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['select', 'id', 'name', 'destinationNames', 'isActive', 'actions', 'createdAt'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['select', 'id', 'name', 'isActive', 'actions', 'createdAt'];
    }
    return [];
  }

  public toggleSelectAll(rows: SelectableCityRow[]): void {
    const ids = rows.map((row) => row.id);
    const allSelected = rows.length > 0 && rows.every((row) => row.selected);

    if (allSelected) {
      this.selection.deselectMany(ids);
      return;
    }

    this.selection.selectMany(ids);
  }

  public bulkDeleteSelectedCities(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz trwale usunąć ${ids.length} zaznaczon${ids.length === 1 ? 'e miasto' : 'e miasta'}? Tej operacji nie można cofnąć.`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeleteCities({ ids });
        });
    });
  }

  public openImport(): void {
    this.dialog
      .open(ImportModalComponent, {
        width: '600px',
        data: {
          entityType: 'city',
          entityLabelSingular: 'miasto',
          entityLabelPlural: 'miasta',
          acceptExtension: '.csv',
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((refreshed) => {
        if (refreshed) {
          this.commonFacade.getCities();
        }
      });
  }

  public exportAllCities(): void {
    this.importExportFacade.exportEntities({ entityType: 'city' });
  }

  public exportSelectedCities(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      this.importExportFacade.exportEntities({ entityType: 'city', ids: Array.from(selectedIds) });
    });
  }

  public bulkActivateSelectedCities(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz aktywować ${ids.length} zaznaczon${ids.length === 1 ? 'e miasto' : 'e miasta'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkActivateCities({ ids });
        });
    });
  }

  public bulkDeactivateSelectedCities(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz dezaktywować ${ids.length} zaznaczon${ids.length === 1 ? 'e miasto' : 'e miasta'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeactivateCities({ ids });
        });
    });
  }

  private buildBulkResultMessage(action: string, successCount: number, failedCount: number): string {
    if (failedCount === 0) {
      return `${action} ${successCount} miast.`;
    }

    return `${action} ${successCount} miast, ${failedCount} nie udało się przetworzyć.`;
  }

  private buildViewModel(cities: CityRow[], selectedIds: Set<string>): CityListViewModel {
    const rows = cities.map((city) => ({ ...city, selected: selectedIds.has(city.id) }));
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
