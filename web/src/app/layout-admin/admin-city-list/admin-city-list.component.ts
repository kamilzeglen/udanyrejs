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

  public allColumns: string[] = ['select', 'id', 'name', 'destinationNames', 'actions', 'updatedAt', 'createdAt'];

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
      return ['select', 'id', 'name', 'destinationNames', 'actions', 'createdAt'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['select', 'id', 'name', 'actions', 'createdAt'];
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
