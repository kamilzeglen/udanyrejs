import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterFacade } from '@state/router';
import { CommonFacade } from '@state/common';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { AllDeviceInfo, CabinType } from '@interfaces';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';

@Component({
  selector: 'app-admin-cabin-type-list',
  templateUrl: './admin-cabin-type-list.component.html',
  styleUrl: './admin-cabin-type-list.component.scss',
})
export class AdminCabinTypeListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public companies$ = this.commonFacade.companies$;
  public cabinTypes$ = this.commonFacade.cabinTypes$;
  public loading$ = this.commonFacade.loading$;

  public selectedCompany: string;

  public deviceInfo: AllDeviceInfo;

  public allColumns: string[] = ['id', 'name', 'isActive', 'actions'];

  public columnsToDisplay: string[];

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly deviceInfoService: DeviceInfoService,
    private readonly routerFacade: RouterFacade,
    private readonly snackService: SnackbarService,
  ) {}

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.allColumns;

    this.commonFacade.createCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dodano rodzaj kabiny');
      this.changedCompany(this.selectedCompany);
    });

    this.commonFacade.updateCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano rodzaj kabiny');
      this.changedCompany(this.selectedCompany);
    });

    this.commonFacade.getCompanies();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addCabinType(): void {
    if (!this.selectedCompany) {
      return;
    }
    const linkParams = ['/admin/cabin-types/add/'];
    this.routerFacade.changeRoute({ linkParams, extras: { queryParams: { companyId: this.selectedCompany } } });
  }

  public editCabinType(cabinType: CabinType): void {
    const linkParams = ['/admin/cabin-types/edit/' + cabinType.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public changedCompany(companyId: string): void {
    this.commonFacade.getCabinTypes(companyId);
  }
}
