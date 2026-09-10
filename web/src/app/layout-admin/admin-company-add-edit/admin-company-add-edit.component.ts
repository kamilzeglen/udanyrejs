import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {combineLatest, filter, merge, of, ReplaySubject, take, takeUntil} from 'rxjs';
import {Company} from '@interfaces';
import {CommonFacade} from '@state/common';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {RouterFacade} from '@state/router';
import {ActivatedRoute} from '@angular/router';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {ImageFileFacade} from '@state/imageFile';
import {map, switchMap} from 'rxjs/operators';

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

  public imageFile: File
  public companyForm: FormGroup;
  public priceIncludesArray: FormArray;
  public priceExcludesArray: FormArray;

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly router: RouterFacade,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly imageFileFacade: ImageFileFacade,
  ) {
  }

  public ngOnInit(): void {
    this.isInitializing = true;

    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      key: ['', Validators.required],
      description: ['', Validators.required],
      priceIncludes: this.fb.array([], Validators.required),
      priceExcludes: this.fb.array([], Validators.required),
    });

    this.priceIncludesArray = this.companyForm.get('priceIncludes') as FormArray;
    this.priceExcludesArray = this.companyForm.get('priceExcludes') as FormArray;

    this.commonFacade.getCompanySuccess$.pipe(take(1)).subscribe((company) => {
      this.editingCompany = company.company;

      if (!this.editingCompany) {
        this.snackService.showError('Nie znaleziono firmy')
        this.router.changeRoute({linkParams: ['/admin/companies']});
      }

      if (this.editingCompany) {
        this.companyForm.patchValue(this.editingCompany);

        if (this.editingCompany.priceIncludes) {
          this.editingCompany.priceIncludes.forEach(include => {
          this.priceIncludesArray.push(this.fb.control(include, Validators.required));
        });
        }

        if (this.editingCompany.priceExcludes) {
          this.editingCompany.priceExcludes.forEach(exclude => {
            this.priceExcludesArray.push(this.fb.control(exclude, Validators.required));
          });
        }
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

    this.commonFacade.createCompanyError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dodawania oferty');
    })

    this.commonFacade.updateCompanyError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktualizowania oferty');
    })

    this.commonFacade.createCompanySuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({company}) => {
          if (!this.imageFile) {
            return of([true]);
          }

          this.createImageFile(company.id);

          const createImageSuccess$ = this.imageFileFacade.createImageFileSuccess$.pipe(map(() => true));
          const createImageError$ = this.imageFileFacade.createImageFileError$.pipe(map(() => false));

          return combineLatest([merge(createImageSuccess$, createImageError$)]);
        }),
        filter(([imageResult]) => imageResult !== undefined)
      )
      .subscribe(([imageResult]) => {
        if (imageResult) {
          this.snackService.showInfo('Pomyślnie dodano firmę');
        } else {
          this.snackService.showError('Oferta została dodana, ale wystąpił problem podczas przesyłania pliku obrazu');
        }

        this.router.changeRoute({linkParams: ['/admin/companies']});
      });

    this.commonFacade.updateCompanySuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({company}) => {
          if (!this.imageFile) {
            return of([true]);
          }

          this.updateImageFile(company.id);

          const updateImageSuccess$ = this.imageFileFacade.updateImageFileSuccess$.pipe(map(() => true));
          const updateImageError$ = this.imageFileFacade.updateImageFileError$.pipe(map(() => false));

          return combineLatest([merge(updateImageSuccess$, updateImageError$)]);
        }),
        filter(([imageResult]) => imageResult !== undefined)
      )
      .subscribe(([imageResult]) => {
        if (imageResult) {
          this.snackService.showInfo('Pomyślnie zaktualizowano firmę');
        } else {
          this.snackService.showError('Firma została zaktualizowana, ale wystąpił problem podczas przesyłania pliku obrazu');
        }

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

    if (file) {
      this.imageFile = file;
    }
  }

  public submitForm(): void {
    if (this.companyForm.invalid) {
      return;
    }

    const payload = {...this.companyForm.value};
    for (const key in payload) {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    }

    if (this.mode === "ADD") {
      this.commonFacade.createCompany({formData: payload});
    }

    if (this.mode === "EDIT") {
      const id = this.editingCompany.id
      this.commonFacade.updateCompany({id, formData: payload});
    }
  }

  public createImageFile(companyId: string): void {
    const formData = new FormData()
    formData.append('imageFile', this.imageFile);
    this.imageFileFacade.createImageFile({imageFileType: 'company', targetId: companyId, file: formData})
  }

  public updateImageFile(companyId: string): void {
    const formData = new FormData()
    formData.append('imageFile', this.imageFile);
    this.imageFileFacade.updateImageFile({imageFileType: 'company', targetId: companyId, file: formData})
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


  addPriceInclude(): void {
    this.priceIncludesArray.push(this.fb.control(''));
  }

  removePriceInclude(index: number): void {
    this.priceIncludesArray.removeAt(index);
  }

  addPriceExclude(): void {
    this.priceExcludesArray.push(this.fb.control(''));
  }

  removePriceExclude(index: number): void {
    this.priceExcludesArray.removeAt(index);
  }


  public goBack(): void {
    this.router.changeRoute({linkParams: ['/admin/companies']});
  }
}
