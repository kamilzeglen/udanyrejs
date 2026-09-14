import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { City } from '@interfaces';
import { CommonFacade } from '@state/common';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { RouterFacade } from '@state/router';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';

const coordinatesPairValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const latitude = control.get('latitude')?.value;
  const longitude = control.get('longitude')?.value;
  const hasLatitude = latitude !== null && latitude !== '';
  const hasLongitude = longitude !== null && longitude !== '';

  if (hasLatitude === hasLongitude) {
    return null;
  }

  return { coordinatesPair: true };
};

@Component({
  selector: 'app-admin-city-add-edit',
  templateUrl: './admin-city-add-edit.component.html',
  styleUrl: './admin-city-add-edit.component.scss',
})
export class AdminCityAddEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public mode: 'EDIT' | 'ADD' = 'ADD';
  public editingCity: City;

  public isInitializing: boolean = false;

  public destinations$ = this.commonFacade.destinations$;

  public cityForm: FormGroup;

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

    this.cityForm = this.fb.group(
      {
        name: ['', Validators.required],
        latitude: [null, [Validators.min(-90), Validators.max(90)]],
        longitude: [null, [Validators.min(-180), Validators.max(180)]],
        destinations: [''],
      },
      { validators: coordinatesPairValidator },
    );

    this.commonFacade.getCitySuccess$.pipe(take(1)).subscribe(({ city }) => {
      this.editingCity = city;

      if (!this.editingCity) {
        this.snackService.showError('Nie znaleziono miasta');
        this.router.changeRoute({ linkParams: ['/admin/cities'] });
      }

      if (this.editingCity) {
        this.cityForm.patchValue({
          name: this.editingCity.name,
          latitude: this.editingCity.latitude,
          longitude: this.editingCity.longitude,
          destinations: this.editingCity.destinations?.map((destination) => destination.id) ?? [],
        });
      }

      this.isInitializing = false;
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const cityId = paramMap.get('cityId');
      if (cityId) {
        this.mode = 'EDIT';
        this.commonFacade.getCity({ id: cityId });
      } else {
        this.isInitializing = false;
      }
    });

    this.commonFacade.createCitySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dodano miasto');
      this.router.changeRoute({ linkParams: ['/admin/cities'] });
    });

    this.commonFacade.createCityError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dodawania miasta');
    });

    this.commonFacade.updateCityError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktualizowania miasta');
    });

    this.commonFacade.updateCitySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano miasto');
      this.router.changeRoute({ linkParams: ['/admin/cities'] });
    });

    this.commonFacade.deleteCitySuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto miasto');
      this.router.changeRoute({ linkParams: ['/admin/cities'] });
    });

    this.commonFacade.getDestinations();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public submitForm(): void {
    if (this.cityForm.invalid) {
      return;
    }

    const payload = { ...this.cityForm.value };
    payload.latitude = payload.latitude === '' ? null : payload.latitude;
    payload.longitude = payload.longitude === '' ? null : payload.longitude;

    for (const key in payload) {
      const isCoordinate = key === 'latitude' || key === 'longitude';

      if (isCoordinate === false && (payload[key] === '' || payload[key] === null)) {
        delete payload[key];
      }
    }

    if (this.mode === 'ADD' && payload.latitude === null) {
      delete payload.latitude;
      delete payload.longitude;
    }

    if (this.mode === 'ADD') {
      this.commonFacade.createCity({ formData: payload });
    }

    if (this.mode === 'EDIT') {
      const id = this.editingCity.id;
      this.commonFacade.updateCity({ id, formData: payload });
    }
  }

  public deleteCity(): void {
    if (this.editingCity) {
      this.confirmationModalService
        .open({
          message: 'Jesteś pewny że chcesz usunąć miasto: ' + this.editingCity.name + '?',
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.commonFacade.deleteCity({ id: this.editingCity.id });
        });
    }
  }

  public goBack(): void {
    this.router.changeRoute({ linkParams: ['/admin/cities'] });
  }
}
