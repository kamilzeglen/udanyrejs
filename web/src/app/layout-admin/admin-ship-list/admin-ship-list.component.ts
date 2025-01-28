import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterFacade} from '@state/router';
import {CommonFacade} from '@state/common';
import {DeviceInfoService} from '@shared/device-info/device-info.service';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {AllDeviceInfo, Ship} from '@interfaces';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-admin-ship-list',
  templateUrl: './admin-ship-list.component.html',
  styleUrl: './admin-ship-list.component.scss'
})
export class AdminShipListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public companies$ = this.commonFacade.companies$
  public ships$ = this.commonFacade.ships$
  public loading$ = this.commonFacade.loading$

  public selectedCompany: string

  public deviceInfo: AllDeviceInfo;

  public allColumns: string[] = [
    'id',
    'name',
    'image',
    'description',
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
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe(info => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.commonFacade.deleteShipSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto statek")
      this.changedCompany(this.selectedCompany)
    })

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const companyId = paramMap.get('companyId');
      if (companyId) {
        this.selectedCompany = companyId
        this.changedCompany(companyId)
      }
    });

    this.commonFacade.getCompanies()
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addShip(): void {
    const linkParams = ["/admin/ships/add/"]
    this.routerFacade.changeRoute({linkParams})
  }

  public editCompany(ship: Ship): void {
    const linkParams = ["/admin/ships/edit/" + ship.id]
    this.routerFacade.changeRoute({linkParams})
  }

  public deleteCompany(ship: Ship): void {
    this.confirmationModalService
      .open({
        message: "Jesteś pewny że chcesz usunąć statek: " + ship.name + "?"
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteShip({id: ship.id})
      });
  }

  public changedCompany(companyId: string) {
    this.commonFacade.getShips(companyId)
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['id', 'name', 'image', 'description', 'createdAt', 'expand'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['id', 'name', 'image', 'createdAt', 'expand'];
    }
    return [];
  }

}
