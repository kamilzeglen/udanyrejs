import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, ReplaySubject, take, takeUntil } from 'rxjs';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { AllDeviceInfo, Category } from '@interfaces';
import { CommonFacade } from '@state/common';
import { RouterFacade } from '@state/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RowSelection } from '@shared/row-selection/row-selection';

interface CategoryRow extends Category {
  selected: boolean;
}

interface CategoryListViewModel {
  rows: CategoryRow[];
  selectedCount: number;
  headerChecked: boolean;
  headerIndeterminate: boolean;
}

@Component({
  selector: 'app-admin-category-list',
  templateUrl: './admin-category-list.component.html',
  styleUrl: './admin-category-list.component.scss',
})
export class AdminCategoryListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public categories$ = this.commonFacade.categories$;
  public loading$ = this.commonFacade.loading$;

  public allColumns: string[] = [
    'select',
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

  public readonly selection = new RowSelection();

  public viewModel$ = combineLatest([this.categories$, this.selection.selectedIds$]).pipe(
    map(([categories, selectedIds]) => this.buildViewModel(categories || [], selectedIds)),
  );

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly deviceInfoService: DeviceInfoService,
    private readonly routerFacade: RouterFacade,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly snackService: SnackbarService,
  ) {}

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.commonFacade.deleteCategorySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto kategorie');
      this.commonFacade.getCategories();
    });

    this.commonFacade.bulkDeleteCategoriesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ deletedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Usunięto', deletedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getCategories();
      });

    this.commonFacade.bulkDeleteCategoriesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się usunąć zaznaczonych kategorii');
    });

    this.commonFacade.bulkActivateCategoriesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Aktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getCategories();
      });

    this.commonFacade.bulkActivateCategoriesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się aktywować zaznaczonych kategorii');
    });

    this.commonFacade.bulkDeactivateCategoriesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ updatedIds, failedIds }) => {
        this.snackService.showInfo(this.buildBulkResultMessage('Dezaktywowano', updatedIds.length, failedIds.length));
        this.selection.clear();
        this.commonFacade.getCategories();
      });

    this.commonFacade.bulkDeactivateCategoriesError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się dezaktywować zaznaczonych kategorii');
    });

    this.commonFacade.getCategories();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addCategory(): void {
    const linkParams = ['/admin/categories/add/'];
    this.routerFacade.changeRoute({ linkParams });
  }

  public editCategory(category: Category): void {
    const linkParams = ['/admin/categories/edit/' + category.id];
    this.routerFacade.changeRoute({ linkParams });
  }

  public deleteCategory(category: Category): void {
    this.confirmationModalService
      .open({
        message: 'Jesteś pewny że chcesz usunąć kategorie: ' + category.name + '?',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (!res) {
          return;
        }

        this.commonFacade.deleteCategory({ id: category.id });
      });
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['select', 'id', 'name', 'url', 'position', 'createdAt'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['select', 'id', 'name', 'url', 'position'];
    }
    return [];
  }

  public toggleSelectAll(rows: CategoryRow[]): void {
    const ids = rows.map((row) => row.id);
    const allSelected = rows.length > 0 && rows.every((row) => row.selected);

    if (allSelected) {
      this.selection.deselectMany(ids);
      return;
    }

    this.selection.selectMany(ids);
  }

  public bulkDeleteSelectedCategories(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz trwale usunąć ${ids.length} zaznaczon${ids.length === 1 ? 'ą kategorię' : 'e kategorie'}? Tej operacji nie można cofnąć.`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeleteCategories({ ids });
        });
    });
  }

  public bulkActivateSelectedCategories(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz aktywować ${ids.length} zaznaczon${ids.length === 1 ? 'ą kategorię' : 'e kategorie'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkActivateCategories({ ids });
        });
    });
  }

  public bulkDeactivateSelectedCategories(): void {
    this.selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      const ids = Array.from(selectedIds);

      this.confirmationModalService
        .open({
          message: `Jesteś pewny że chcesz dezaktywować ${ids.length} zaznaczon${ids.length === 1 ? 'ą kategorię' : 'e kategorie'}?`,
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.bulkDeactivateCategories({ ids });
        });
    });
  }

  private buildBulkResultMessage(action: string, successCount: number, failedCount: number): string {
    if (failedCount === 0) {
      return `${action} ${successCount} kategorii.`;
    }

    return `${action} ${successCount} kategorii, ${failedCount} nie udało się przetworzyć.`;
  }

  private buildViewModel(categories: Category[], selectedIds: Set<string>): CategoryListViewModel {
    const rows = categories.map((category) => ({ ...category, selected: selectedIds.has(category.id) }));
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
