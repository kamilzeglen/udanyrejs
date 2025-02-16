import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {DeviceInfoService} from '@shared/device-info/device-info.service';
import {AllDeviceInfo, Destination} from '@interfaces';
import {CommonFacade} from '@state/common';
import {RouterFacade} from '@state/router';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';

@Component({
  selector: 'app-admin-destination-list',
  templateUrl: './admin-destination-list.component.html',
  styleUrl: './admin-destination-list.component.scss',
})
export class AdminDestinationListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public destinations$ = this.commonFacade.destinations$
  public loading$ = this.commonFacade.loading$

  public allColumns: string[] = [
    'id',
    'name',
    'offerCount',
    'actions',
    'updatedAt',
    'createdAt',
  ];

  public columnsToDisplay: string[];

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly deviceInfoService: DeviceInfoService,
    private readonly routerFacade: RouterFacade,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly snackService: SnackbarService,
  ) {
  }

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe(info => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.commonFacade.deleteDestinationSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto kategorie")
      this.commonFacade.getDestinations()
    })

    this.commonFacade.getDestinations()
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addDestination(): void {
    const linkParams = ["/admin/destinations/add/"]
    this.routerFacade.changeRoute({linkParams})
  }

  public editDestination(destination: Destination): void {
    const linkParams = ["/admin/destinations/edit/" + destination.id]
    this.routerFacade.changeRoute({linkParams})
  }

  public deleteDestination(destination: Destination): void {
    this.confirmationModalService
      .open({
        message: "Jesteś pewny że chcesz usunąć region: " + destination.name + "?"
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteDestination({id: destination.id})
      });
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['id', 'name', 'actions', 'createdAt'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['id', 'name', 'actions', 'createdAt'];
    }
    return [];
  }
}
