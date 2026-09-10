import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, takeUntil } from 'rxjs';
import { CabinType } from '@interfaces';
import { CommonFacade } from '@state/common';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RouterFacade } from '@state/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-cabin-type-add-edit',
  templateUrl: './admin-cabin-type-add-edit.component.html',
  styleUrl: './admin-cabin-type-add-edit.component.scss',
})
export class AdminCabinTypeAddEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public mode: 'EDIT' | 'ADD' = 'ADD';
  public editingCabinType: CabinType;

  public isInitializing: boolean = false;

  public companies$ = this.commonFacade.companies$;

  public cabinTypeForm: FormGroup;

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly router: RouterFacade,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.isInitializing = true;

    this.cabinTypeForm = this.fb.group({
      name: ['', Validators.required],
      companyId: ['', Validators.required],
      isActive: [true],
    });

    this.commonFacade.getCompanies();

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const cabinTypeId = paramMap.get('cabinTypeId');
      if (cabinTypeId) {
        this.mode = 'EDIT';
      }
    });

    this.commonFacade.cabinTypes$.pipe(takeUntil(this.destroy$)).subscribe((cabinTypes) => {
      const cabinTypeId = this.activatedRoute.snapshot.paramMap.get('cabinTypeId');
      const found = cabinTypes?.find((c) => c.id === cabinTypeId);
      if (found) {
        this.editingCabinType = found;
        this.cabinTypeForm.patchValue(found);
      }
    });

    this.activatedRoute.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((queryParamMap) => {
      const companyId = queryParamMap.get('companyId');
      if (companyId && this.mode === 'ADD') {
        this.cabinTypeForm.patchValue({ companyId });
      }
    });

    this.commonFacade.createCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dodano rodzaj kabiny');
      this.router.changeRoute({ linkParams: ['/admin/cabin-types'] });
    });

    this.commonFacade.createCabinTypeError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dodawania rodzaju kabiny');
    });

    this.commonFacade.updateCabinTypeError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktualizowania rodzaju kabiny');
    });

    this.commonFacade.updateCabinTypeSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano rodzaj kabiny');
      this.router.changeRoute({ linkParams: ['/admin/cabin-types'] });
    });

    this.isInitializing = false;
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public submitForm(): void {
    if (this.cabinTypeForm.invalid) {
      return;
    }

    const payload = { ...this.cabinTypeForm.value };

    if (this.mode === 'ADD') {
      this.commonFacade.createCabinType({ formData: payload });
    }

    if (this.mode === 'EDIT') {
      const id = this.editingCabinType.id;
      this.commonFacade.updateCabinType({ id, formData: payload });
    }
  }

  public goBack(): void {
    this.router.changeRoute({ linkParams: ['/admin/cabin-types'] });
  }
}
