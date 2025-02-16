import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {DeviceInfoService} from '@shared/device-info/device-info.service';
import {AllDeviceInfo, Category} from '@interfaces';
import {CommonFacade} from '@state/common';
import {RouterFacade} from '@state/router';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';

@Component({
  selector: 'app-admin-category-list',
  templateUrl: './admin-category-list.component.html',
  styleUrl: './admin-category-list.component.scss',
})
export class AdminCategoryListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public categories$ = this.commonFacade.categories$
  public loading$ = this.commonFacade.loading$

  public allColumns: string[] = [
    'id',
    'name',
    'url',
    'position',
    'startDate',
    'endDate',
    'isActive',
    'isVisible',
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

    this.commonFacade.deleteCategorySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto kategorie")
      this.commonFacade.getCategories()
    })

    this.commonFacade.getCategories()
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addCategory(): void {
    const linkParams = ["/admin/categories/add/"]
    this.routerFacade.changeRoute({linkParams})
  }

  public editCategory(category: Category): void {
    const linkParams = ["/admin/categories/edit/" + category.id]
    this.routerFacade.changeRoute({linkParams})
  }

  public deleteCategory(category: Category): void {
    this.confirmationModalService
      .open({
        message: "Jesteś pewny że chcesz usunąć kategorie: " + category.name + "?"
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteCategory({id: category.id})
      });
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['id', 'name', 'url', 'position', 'createdAt'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['id', 'name', 'url', 'position'];
    }
    return [];
  }
}
