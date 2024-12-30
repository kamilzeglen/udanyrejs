import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {CommonFacade} from '@state/common';
import {OfferFacade} from 'src/app/_state/offer';
import {RouterFacade} from '@state/router';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {ActivatedRoute} from '@angular/router';
import {Offer} from '@interfaces';
import {Location} from '@angular/common';

@Component({
  selector: 'app-admin-panel-add-edit',
  templateUrl: './admin-offer-add-edit.component.html',
  styleUrl: './admin-offer-add-edit.component.scss'
})
export class AdminOfferAddEditComponent implements OnInit, OnDestroy {
  public mode: "EDIT" | "ADD" = 'ADD';
  public editingOffer: Offer;

  public isInitializing: boolean = false;

  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public companies$ = this.commonFacade.companies$
  public ships$ = this.commonFacade.ships$

  public offerForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly commonFacade: CommonFacade,
    private readonly offerFacade: OfferFacade,
    private readonly router: RouterFacade,
    private readonly snackService: SnackbarService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location
  ) {
  }

  ngOnInit(): void {
    this.isInitializing = true;

    this.offerForm = this.fb.group({
      offerUrl: ['', [Validators.pattern('https?://.+')]],
      syncData: [true],
      name: ['', Validators.required],
      price: ['', Validators.required],
      companyId: ['', Validators.required],
      shipId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      image: [null],
      pdf: [null],
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
          price: this.editingOffer?.price,
          companyId: this.editingOffer?.companyId,
          shipId: this.editingOffer?.ship.id,
          startDate: this.editingOffer?.startDate,
          endDate: this.editingOffer?.endDate,
        });

        // Dodanie itinerary, jeśli istnieje
        if (this.editingOffer?.itinerary) {
          const itineraryData = typeof this.editingOffer.itinerary === 'string'
            ? JSON.parse(this.editingOffer.itinerary)
            : this.editingOffer.itinerary;

          if (Array.isArray(itineraryData)) {
            itineraryData.forEach((day, index) => {
              const dayGroup = this.fb.group({
                day: [day.day || index + 1],
                date: [day.date || ''],
                port: [day.port || ''],
                arrivalTime: [day.arrivalTime || ''],
                departureTime: [day.departureTime || '']
              });
              this.itineraryArray.push(dayGroup);
            });
          }
        }
      }

      this.isInitializing = false; // Inicjalizacja zakończona
    })

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const offerId = paramMap.get('offerId');
      if (offerId) {
        this.mode = 'EDIT';
        this.offerFacade.getOffer({id: offerId});
      } else {
        this.isInitializing = false; // W przypadku braku edycji
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

    this.offerFacade.createOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dodano oferte')
      this.router.changeRoute({linkParams: ['/admin/offers']});
    })

    this.commonFacade.getCompanies();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get itineraryArray(): FormArray {
    return this.offerForm.get('itinerary') as FormArray;
  }

  // Obliczanie liczby dni i aktualizacja itinerary
  updateItineraryDays(): void {
    const startDate = new Date(this.offerForm.get('startDate')?.value);
    const endDate = new Date(this.offerForm.get('endDate')?.value);

    console.log(startDate, endDate);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const timeDifference = endDate.getTime() - startDate.getTime();
      const nights = Math.max(Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1, 0); // Liczba dni (z 1 jako minimum)
      this.adjustItineraryDays(nights, startDate);
    }
  }

  adjustItineraryDays(nights: number, startDate: Date): void {
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

  addItineraryDay(dayNumber: number, startDate: Date): void {
    const dayGroup = this.fb.group({
      day: [dayNumber],
      date: [this.getDateForItinerary(startDate, dayNumber)], // Ustalamy datę na podstawie startDate
      port: [''],
      arrivalTime: [''],
      departureTime: ['']
    });
    this.itineraryArray.push(dayGroup);
  }

  getDateForItinerary(startDate: Date, dayNumber: number): string {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + dayNumber - 1); // Dodajemy odpowiednią liczbę dni
    return newDate.toISOString().split('T')[0]; // Zwracamy datę w formacie YYYY-MM-DD
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

  public onPDFFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    this.snackService.showInfo('Pomyślnie dodano plik')

    if (file) {
      this.offerForm.patchValue({
        pdf: file
      });
    }
  }


  public importOffer(): void {
    console.log('Import')
  }

  public submitForm(): void {
    const formValue = this.offerForm.value;
    const formData = new FormData();

    // Dodaj dane formularza do FormData
    formData.append('name', formValue.name);
    formData.append('offerUrl', formValue.offerUrl);
    formData.append('syncData', formValue.syncData);
    formData.append('price', formValue.price.toString());
    formData.append('companyId', formValue.companyId);
    formData.append('shipId', formValue.shipId);
    formData.append('startDate', formValue.startDate);
    formData.append('endDate', formValue.endDate);

    if (formValue.image instanceof File) {
      formData.append('image', formValue.image); // Dodajemy plik do FormData
    }

    if (formValue.pdf instanceof File) {
      formData.append('pdf', formValue.pdf); // Dodajemy plik do FormData
    }

    if (formValue.itinerary && Array.isArray(formValue.itinerary)) {
      formData.append('itinerary', JSON.stringify(formValue.itinerary));
    }

    // Teraz wywołujemy metodę do wysyłania danych
    if (this.mode === "ADD") {
      this.offerFacade.createOffer({formData});
    }

    if (this.mode === "EDIT") {
      const id = this.editingOffer.id
      this.offerFacade.updateOffer({id, formData});
    }
  }

  goBack(): void {
    this.location.back();  // Używa Angular Location do powrotu
  }
}
