import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterFacade } from '@state/router';
import { CommonFacade } from '@state/common';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { combineLatest, map, ReplaySubject, take, takeUntil } from 'rxjs';
import { AllDeviceInfo, Ship } from '@interfaces';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { ActivatedRoute } from '@angular/router';
import { RowSelection } from '@shared/row-selection/row-selection';

interface ShipRow extends Ship {
  selected: boolean;
}

interface ShipListViewModel {
  rows: ShipRow[];
  selectedCount: number;
  headerChecked: boolean;
  headerIndeterminate: boolean;
}

@Component({
  selector: 'app-admin-ship-list',
  templateUrl: './admin-ship-list.component.html',
  styleUrl: './admin-ship-list.component.scss',
})
export class AdminShipListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public companies$ = this.commonFacade.companies$;
  public ships$ = this.commonFacade.ships$;
  public loading$ = this.commonFacade.loading$;

  public selectedCompany: string;

  public deviceInfo: AllDeviceInfo;

  public allColumns: string[] = [
    'select',
    'id',
    'name',
    'image',
    'isActive',
    'description',
    'actions',
    'updatedAt',
    'createdAt',
  ];

  public columnsToDisplay: string[];

  public readonly selection = new RowSelection();

  public viewModel$ = combineLatest([this.ships$, this.selection.selectedIds$]).pipe(
    map(([ships, selectedIds]) => this.buildViewModel(ships || [], selectedIds)),
  );

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly deviceInfoService: DeviceInfoService,
    private readonly routerFacade: RouterFacade,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly snackService: SnackbarService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.commonFacade.deleteShipSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto statek');
      this.changedCompany(this.selectedCompany);
    });

    this.commonFacade.bulkDeleteShipsSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ deletedIds, failedIds }) => {
      this.snackService.showInfo(this.buildBulkResultMessage('Usunięto', deletedIds.length, failedIds.length));
      this.selection.clear();
      this.changedCompany(this.selectedCompany);
    });

    this.commonFacade.bulkDeleteShipsError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się usunąć zaznaczonych statków');
    });

    this.commonFacade.bulkActivateShipsSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Aktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.changedCompany(this.selectedCompany);
      });

    this.commonFacade.bulkActivateShipsError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się aktywować zaznaczonych statków');
    });

    this.commonFacade.bulkDeactivateShipsSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Dezaktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.changedCompany(this.selectedCompany);
      });

    this.commonFacade.bulkDeactivateShipsError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się dezaktywować zaznaczonych statków');
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const companyId = paramMap.get('companyId');
      if (companyId) {
        this.selectedCompany = companyId;
        this.changedCompany(companyId);
      }
    });

    this.commonFacade.getCompanies();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addShip(): void {
    const linkParams = ['/admin/ships/add/'];
    this.routerFacade.changeRoute({ linkParams });
  }

  public editCompany(ship: Ship): void {
    const linkParams = ['/admin/ships/edit/' + ship.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public deleteCompany(ship: Ship): void {
    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz usunąć statek: ' + ship.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteShip({ id: ship.id });
      });
  }

  public changedCompany(companyId: string) {
    this.selection.clear();
    this.commonFacade.getShips(companyId);
  }

  public bulkDeleteSelectedShips(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz trwale usunąć ${ids.length} zaznaczon${ids.length === 1 ? 'y statek' : 'e statki'}? Tej operacji nie można cofnąć.`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeleteShips({ ids });
        });
    });
  }

  public bulkActivateSelectedShips(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz aktywować ${ids.length} zaznaczon${ids.length === 1 ? 'y statek' : 'e statki'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkActivateShips({ ids });
        });
    });
  }

  public bulkDeactivateSelectedShips(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz dezaktywować ${ids.length} zaznaczon${ids.length === 1 ? 'y statek' : 'e statki'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeactivateShips({ ids });
        });
    });
  }

  private buildBulkResultMessage(action: string, successCount: number, failedCount: number): string {
    if (failedCount === 0) {
      return `${action} ${successCount} statek(ów).`;
    }

    return `${action} ${successCount} statek(ów), ${failedCount} nie udało się przetworzyć.`;
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

  public toggleSelectAll(rows: ShipRow[]): void {
    const ids = rows.map((row) => row.id);
    const allSelected = rows.length > 0 && rows.every((row) => row.selected);

    if (allSelected) {
      this.selection.deselectMany(ids);
      return;
    }

    this.selection.selectMany(ids);
  }

  private buildViewModel(ships: Ship[], selectedIds: Set<string>): ShipListViewModel {
    const rows = ships.map((ship) => ({ ...ship, selected: selectedIds.has(ship.id) }));
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
