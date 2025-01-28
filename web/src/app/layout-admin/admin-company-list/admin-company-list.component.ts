import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {DeviceInfoService} from '@shared/device-info/device-info.service';
import {AllDeviceInfo, Company} from '@interfaces';
import {CommonFacade} from '@state/common';
import {RouterFacade} from '@state/router';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-admin-company-list',
  templateUrl: './admin-company-list.component.html',
  styleUrl: './admin-company-list.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AdminCompanyListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public companies$ = this.commonFacade.companies$
  public ships$ = this.commonFacade.ships$
  public loading$ = this.commonFacade.loading$

  public allColumns: string[] = [
    'id',
    'name',
    'key',
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
  ) {
  }

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe(info => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.commonFacade.deleteCompanySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto firmę")
      this.commonFacade.getCompanies()
    })

    this.commonFacade.getCompanies()
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addCompany(): void {
    const linkParams = ["/admin/companies/add/"]
    this.routerFacade.changeRoute({linkParams})
  }

  public editCompany(company: Company): void {
    const linkParams = ["/admin/companies/edit/" + company.id]
    this.routerFacade.changeRoute({linkParams})
  }

  public deleteCompany(company: Company): void {
    this.confirmationModalService
      .open({
        message: "Jesteś pewny że chcesz usunąć firmę: " + company.name + "?"
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteCompany({id: company.id})
      });
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
