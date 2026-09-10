import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { Category } from '@interfaces';
import { CommonFacade } from '@state/common';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RouterFacade } from '@state/router';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-admin-category-add-edit',
  templateUrl: './admin-category-add-edit.component.html',
  styleUrl: './admin-category-add-edit.component.scss',
})
export class AdminCategoryAddEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public mode: 'EDIT' | 'ADD' = 'ADD';
  public editingCategory: Category;

  public isInitializing: boolean = false;

  public categoryForm: FormGroup;

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly router: RouterFacade,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
  ) {}

  public ngOnInit(): void {
    this.isInitializing = true;

    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      url: ['', Validators.required],
      position: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      isActive: [false],
      isVisible: [false],
    });

    this.commonFacade.getCategorySuccess$.pipe(take(1)).subscribe(({ category }) => {
      this.editingCategory = category;

      if (!this.editingCategory) {
        this.snackService.showError('Nie znaleziono kategorii');
        this.router.changeRoute({ linkParams: ['/admin/categories'] });
      }

      if (this.editingCategory) {
        this.categoryForm.patchValue(this.editingCategory);
      }

      this.isInitializing = false;
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const categoryId = paramMap.get('categoryId');
      if (categoryId) {
        this.mode = 'EDIT';
        this.commonFacade.getCategory({ id: categoryId });
      } else {
        this.isInitializing = false;
      }
    });

    this.commonFacade.createCategorySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dodano kategorie');
      this.router.changeRoute({ linkParams: ['/admin/categories'] });
    });

    this.commonFacade.createCategoryError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dodawania kategorii');
    });

    this.commonFacade.updateCategoryError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktualizowania kategorii');
    });

    this.commonFacade.updateCategorySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano kategorie');
      this.router.changeRoute({ linkParams: ['/admin/categories'] });
    });

    this.commonFacade.deleteCategorySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto kategorie');
      this.router.changeRoute({ linkParams: ['/admin/categories'] });
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public submitForm(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    const payload = { ...this.categoryForm.value };
    for (const key in payload) {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    }

    if (this.mode === 'ADD') {
      this.commonFacade.createCategory({ formData: payload });
    }

    if (this.mode === 'EDIT') {
      const id = this.editingCategory.id;
      this.commonFacade.updateCategory({ id, formData: payload });
    }
  }

  public deleteCompany(): void {
    if (this.editingCategory) {
      this.confirmationModalService
        .open({
          message: 'Jesteś pewny że chcesz usunąć ofertę: ' + this.editingCategory.name + '?',
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.deleteCategory({ id: this.editingCategory.id });
        });
    }
  }

  public goBack(): void {
    this.router.changeRoute({ linkParams: ['/admin/categories'] });
  }
}
