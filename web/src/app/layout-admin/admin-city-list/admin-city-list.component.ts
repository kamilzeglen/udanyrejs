import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, ReplaySubject, take, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { AllDeviceInfo, City } from '@interfaces';
import { CommonFacade } from '@state/common';
import { RouterFacade } from '@state/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';

export interface CityRow extends City {
  destinationNames: string;
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

  public allColumns: string[] = ['id', 'name', 'destinationNames', 'actions', 'updatedAt', 'createdAt'];

  public columnsToDisplay: string[];

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
      return ['id', 'name', 'destinationNames', 'actions', 'createdAt'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['id', 'name', 'actions', 'createdAt'];
    }
    return [];
  }
}
