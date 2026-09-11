import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterFacade } from '@state/router';
import { CommonFacade } from '@state/common';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { AllDeviceInfo, CabinType } from '@interfaces';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-admin-cabin-type-list',
  templateUrl: './admin-cabin-type-list.component.html',
  styleUrl: './admin-cabin-type-list.component.scss',
})
export class AdminCabinTypeListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public cabinTypesGroups$ = this.commonFacade.cabinTypesGroupedByCompany$;
  public loading$ = this.commonFacade.loading$;

  public deviceInfo: AllDeviceInfo;

  public allColumns: string[] = ['id', 'name', 'offersCount', 'actions'];

  public columnsToDisplay: string[];

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly deviceInfoService: DeviceInfoService,
    private readonly routerFacade: RouterFacade,
    private readonly snackService: SnackbarService,
    private readonly confirmationModalService: ConfirmationModalService,
  ) {}

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.allColumns;

    this.commonFacade.createCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dodano rodzaj kabiny');
      this.commonFacade.getAllCabinTypes();
    });

    this.commonFacade.updateCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano rodzaj kabiny');
      this.commonFacade.getAllCabinTypes();
    });

    this.commonFacade.deleteCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto rodzaj kabiny');
      this.commonFacade.getAllCabinTypes();
    });

    this.commonFacade.deleteCabinTypeError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError(
        'Nie udało się usunąć rodzaju kabiny — sprawdź, czy żadna oferta z niej nie korzysta',
      );
    });

    this.commonFacade.getAllCabinTypes();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addCabinType(): void {
    const linkParams = ['/admin/cabin-types/add/'];
    this.routerFacade.changeRoute({ linkParams });
  }

  public editCabinType(cabinType: CabinType): void {
    const linkParams = ['/admin/cabin-types/edit/' + cabinType.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public deleteCabinType(cabinType: CabinType): void {
    if (cabinType.offersCount > 0) {
      this.snackService.showError(
        'Nie można usunąć rodzaju kabiny "' +
          cabinType.name +
          '" — korzysta z niej ' +
          cabinType.offersCount +
          ' ofert(a/y).',
      );
      return;
    }

    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz całkowicie usunąć rodzaj kabiny: ' + cabinType.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.commonFacade.deleteCabinType({ id: cabinType.id });
      });
  }
}
