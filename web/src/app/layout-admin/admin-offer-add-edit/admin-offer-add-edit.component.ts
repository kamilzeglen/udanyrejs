import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {CommonFacade} from '@state/common';
import {OfferFacade} from 'src/app/_state/offer';
import {RouterFacade} from '@state/router';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {ActivatedRoute} from '@angular/router';
import {Offer} from '@interfaces';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {City} from '../../_interfaces/city';
import {ImageFileFacade} from '@state/imageFile';

@Component({
  selector: 'app-admin-panel-add-edit',
  templateUrl: './admin-offer-add-edit.component.html',
  styleUrl: './admin-offer-add-edit.component.scss'
})
export class AdminOfferAddEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public mode: "EDIT" | "ADD" = 'ADD';
  public editingOffer: Offer;

  public isInitializing: boolean = false;

  public companies$ = this.commonFacade.companies$
  public ships$ = this.commonFacade.ships$
  public cities$ = this.commonFacade.cities$
  public destinations$ = this.commonFacade.destinations$
  public categories$ = this.commonFacade.categories$

  public offerForm: FormGroup;
  public imageFile: File
  public pdfFile: File

  constructor(
    private readonly fb: FormBuilder,
    private readonly commonFacade: CommonFacade,
    private readonly offerFacade: OfferFacade,
    private readonly router: RouterFacade,
    private readonly snackService: SnackbarService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly imageFileFacade: ImageFileFacade,
  ) {
  }

  ngOnInit(): void {
    this.isInitializing = true;

    this.offerForm = this.fb.group({
      offerUrl: ['', [Validators.pattern('https?://.+')]],
      syncData: [true],
      name: ['', Validators.required],
      price: [null, Validators.required],
      companyId: ['', Validators.required],
      destinations: ['', Validators.required],
      categories: [''],
      shipId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      itinerary: this.fb.array([]),
    });

    this.offerFacade.getOfferSuccess$.pipe(take(1)).subscribe((offer) => {
      this.editingOffer = offer.offer;

      if (!this.editingOffer) {
        this.snackService.showError('Nie znaleziono oferty')
        this.router.changeRoute({linkParams: ['/admin/offers']});
      }

      if (this.editingOffer) {
        this.offerForm.patchValue({
          offerUrl: this.editingOffer?.offerUrl,
          syncData: this.editingOffer?.syncData,
          name: this.editingOffer?.name,
          price: Number(this.editingOffer?.price),
          companyId: this.editingOffer?.companyId,
          destinations: this.editingOffer?.destinations?.map((destinations: any) => destinations.id),
          categories: this.editingOffer?.categories?.map((categories: any) => categories.id),
          shipId: this.editingOffer?.ship.id,
          startDate: this.editingOffer?.startDate,
          endDate: this.editingOffer?.endDate,
        });

        if (this.editingOffer?.itinerary) {
          const itineraryData = typeof this.editingOffer.itinerary === 'string'
            ? JSON.parse(this.editingOffer.itinerary)
            : this.editingOffer.itinerary;

          if (Array.isArray(itineraryData)) {
            itineraryData.forEach((day, index) => {
              const dayGroup = this.fb.group({
                day: [day.day || index + 1],
                date: [day.date || null],
                port: [day.cityId || null],
                arrivalTime: [day.arrivalTime || null],
                departureTime: [day.departureTime || null],
              });
              this.itineraryArray.push(dayGroup);
            });
          }
        }
      }

      this.isInitializing = false;
    })

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const offerId = paramMap.get('offerId');
      if (offerId) {
        this.mode = 'EDIT';
        this.offerFacade.getOffer({id: offerId});
      } else {
        this.isInitializing = false;
      }
    });

    this.offerForm.get('companyId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {

      const companyId = this.offerForm.get('companyId').value
      if (companyId) {
        this.commonFacade.getShips(companyId)
      }
    });

    this.offerForm.get('startDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.isInitializing) {
        this.updateItineraryDays();
      }
    });

    this.offerForm.get('endDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.isInitializing) {
        this.updateItineraryDays();
      }
    });

    this.offerFacade.createOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (this.imageFile || this.pdfFile) {
        const formData = new FormData();

        if (this.imageFile) {
          formData.append('imageFile', this.imageFile);
          this.imageFileFacade.createImageFile({imageFileType: "offer", targetId: result.offer.id, formData});
        }
        if (this.pdfFile) {

        }
      } else {
        this.snackService.showInfo('Pomyślnie dodano ofertę')
        this.router.changeRoute({linkParams: ['/admin/offers']});
      }


    })

    this.offerFacade.updateOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie zaktualizowano ofertę')
      this.router.changeRoute({linkParams: ['/admin/offers']});
    })

    this.offerFacade.deleteOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto ofertę")
      this.router.changeRoute({linkParams: ['/admin/offers']});
    })

    this.commonFacade.getCompanies();
    this.commonFacade.getCities();
    this.commonFacade.getCategories();
    this.commonFacade.getDestinations();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get itineraryArray(): FormArray {
    return this.offerForm.get('itinerary') as FormArray;
  }

  public updateItineraryDays(): void {
    const startDate = new Date(this.offerForm.get('startDate')?.value);
    const endDate = new Date(this.offerForm.get('endDate')?.value);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const timeDifference = endDate.getTime() - startDate.getTime();
      const nights = Math.max(Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1, 0);
      this.adjustItineraryDays(nights, startDate);
    }
  }

  public adjustItineraryDays(nights: number, startDate: Date): void {
    const currentDays = this.itineraryArray.length;

    if (nights > currentDays) {
      for (let i = currentDays; i < nights; i++) {
        this.addItineraryDay(i + 1, startDate);
      }
    } else if (nights < currentDays) {
      for (let i = currentDays - 1; i >= nights; i--) {
        this.itineraryArray.removeAt(i);
      }
    }
  }

  public addItineraryDay(dayNumber: number, startDate: Date): void {
    const dayGroup = this.fb.group({
      day: [dayNumber],
      date: [this.getDateForItinerary(startDate, dayNumber)],
      port: [null],
      arrivalTime: [null],
      departureTime: [null]
    });
    this.itineraryArray.push(dayGroup);
  }

  public getDateForItinerary(startDate: Date, dayNumber: number): string {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + dayNumber - 1); // Dodajemy odpowiednią liczbę dni
    return newDate.toISOString().split('T')[0]; // Zwracamy datę w formacie YYYY-MM-DD
  }

  public onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      this.imageFile = file;
      this.snackService.showInfo('Pomyślnie dodano plik');
    }
  }

  public onPDFFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      this.pdfFile = file;
      this.snackService.showInfo('Pomyślnie dodano plik');
    }
  }


  public importOffer(): void {
    console.log('Import')
  }

  public submitForm(): void {
    if (this.offerForm.invalid) {
      return;
    }

    const payload = {...this.offerForm.value};
    for (const key in payload) {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    }

    if (this.mode === "ADD") {
      this.offerFacade.createOffer({formData: payload});
    }

    if (this.mode === "EDIT") {
      const id = this.editingOffer.id
      this.offerFacade.updateOffer({id, formData: payload});
    }
  }

  public deleteOffer(): void {
    if (this.editingOffer) {
      this.confirmationModalService
        .open({
          message: "Jesteś pewny że chcesz usunąć ofertę: " + this.editingOffer.name + "?"
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe(res => {
          if (!res) {
            return;
          }

          this.offerFacade.deleteOffer({id: this.editingOffer.id})
        });
    }
  }

  public createCity(city: City, index: number) {
    if (!city.id) {
      this.commonFacade.createCitySuccess$.pipe(take(1), takeUntil(this.destroy$)).subscribe((result) => {
        this.snackService.showInfo('Pomyślnie dodano miasto: ' + result.city.name);
        this.commonFacade.getCities();

        this.updateCityValue(result.city, index);
      })

      this.commonFacade.createCity({formData: city});
    }
  }

  public updateCityValue(city: City, index: number): void {
    const itinerary = this.offerForm.get('itinerary') as FormArray;

    if (itinerary.controls[index]) {
      const dayControl = itinerary.controls[index];
      const portControl = dayControl.get('port');

      if (portControl) {
        portControl.setValue(city.id);
      }
    }
  }
  public goBack(): void {
    this.router.changeRoute({linkParams: ['/admin/offers']});
  }
}
