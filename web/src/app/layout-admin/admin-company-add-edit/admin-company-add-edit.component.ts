import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {Company} from '@interfaces';
import {CommonFacade} from '@state/common';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {RouterFacade} from '@state/router';
import {ActivatedRoute} from '@angular/router';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-admin-company-add-edit',
  templateUrl: './admin-company-add-edit.component.html',
  styleUrl: './admin-company-add-edit.component.scss'
})
export class AdminCompanyAddEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public mode: "EDIT" | "ADD" = 'ADD';
  public editingCompany: Company;

  public isInitializing: boolean = false;

  public offerForm: FormGroup;

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly router: RouterFacade,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
  ) {
  }

  public ngOnInit(): void {
    this.isInitializing = true;

    this.offerForm = this.fb.group({
      name: ['', Validators.required],
      key: ['', Validators.required],
      description: ['', Validators.required],
      image: [null],
    });

    this.commonFacade.getCompanySuccess$.pipe(take(1)).subscribe((company) => {
      this.editingCompany = company.company;

      if (!this.editingCompany) {
        this.snackService.showError('Nie znaleziono firmy')
        this.router.changeRoute({linkParams: ['/admin/companies']});
      }

      if (this.editingCompany) {
        this.offerForm.patchValue({
          name: this.editingCompany?.name,
          key: this.editingCompany?.key,
          description: this.editingCompany?.description,
        });
      }

      this.isInitializing = false;
    })


    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const companyId = paramMap.get('companyId');
      if (companyId) {
        this.mode = 'EDIT';
        this.commonFacade.getCompany({id: companyId});
      } else {
        this.isInitializing = false;
      }
    });

    this.commonFacade.createCompanySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano firme')
      this.router.changeRoute({linkParams: ['/admin/companies']});
    })

    this.commonFacade.updateCompanySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano firmę')
      this.router.changeRoute({linkParams: ['/admin/companies']});
    })

    this.commonFacade.deleteCompanySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto firmę")
      this.router.changeRoute({linkParams: ['/admin/companies']});
    })
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    this.snackService.showInfo('Pomyślnie dodano plik')

    if (file) {
      this.offerForm.patchValue({
        image: file
      });
    }
  }

  public submitForm(): void {
    const formValue = this.offerForm.value;
    const formData = new FormData();

    // Dodaj dane formularza do FormData
    formData.append('name', formValue.name);
    formData.append('key', formValue.key);
    formData.append('description', formValue.description);

    if (formValue.image instanceof File) {
      formData.append('image', formValue.image);
    }


    if (this.mode === "ADD") {
      this.commonFacade.createCompany({formData});
    }

    if (this.mode === "EDIT") {
      const id = this.editingCompany.id
      this.commonFacade.updateCompany({id, formData});
    }
  }

  public deleteCompany(): void {
    if (this.editingCompany) {
      this.confirmationModalService
        .open({
          message: "Jesteś pewny że chcesz usunąć ofertę: " + this.editingCompany.name + "?"
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe(res => {
          if (!res) {
            return;
          }

          this.commonFacade.deleteCompany({id: this.editingCompany.id})
        });
    }
  }


  public goBack(): void {
    this.router.changeRoute({linkParams: ['/admin/companies']});
  }
}
