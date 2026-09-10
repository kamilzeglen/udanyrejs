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

  public allColumns: string[] = ['id', 'name', 'isActive', 'actions'];

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

    this.commonFacade.deactivateCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dezaktywowano rodzaj kabiny');
      this.commonFacade.getAllCabinTypes();
    });

    this.commonFacade.deactivateCabinTypeError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dezaktywowania rodzaju kabiny');
    });

    this.commonFacade.activateCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie aktywowano rodzaj kabiny');
      this.commonFacade.getAllCabinTypes();
    });

    this.commonFacade.activateCabinTypeError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktywowania rodzaju kabiny');
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

  public deactivateCabinType(cabinType: CabinType): void {
    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz dezaktywować rodzaj kabiny: ' + cabinType.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.commonFacade.deactivateCabinType({ id: cabinType.id });
      });
  }

  public activateCabinType(cabinType: CabinType): void {
    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz aktywować rodzaj kabiny: ' + cabinType.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.commonFacade.activateCabinType({ id: cabinType.id });
      });
  }
}
