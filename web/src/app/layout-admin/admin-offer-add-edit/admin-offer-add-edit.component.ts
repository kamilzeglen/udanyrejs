import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {combineLatest, filter, merge, Observable, of, ReplaySubject, take, takeUntil} from 'rxjs';
import {CommonFacade} from '@state/common';
import {OfferFacade} from 'src/app/_state/offer';
import {RouterFacade} from '@state/router';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {ActivatedRoute} from '@angular/router';
import {Offer} from '@interfaces';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {ImageFileFacade} from '@state/imageFile';
import {PdfFileFacade} from '@state/pdfFile';
import {map, switchMap} from 'rxjs/operators';
import {ScrapperFacade} from '@state/scrapper';

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
  public destinations$ = this.commonFacade.destinations$
  public categories$ = this.commonFacade.categories$

  public scrapping$ = this.scrapperFacade.loading$

  public offerForm: FormGroup;

  public scrappedData: boolean;

  public imageFile: File | string
  public scrappedImageFile: boolean

  public pdfFile: File | string
  public scrappedPdfFile: boolean

  constructor(
    private readonly fb: FormBuilder,
    private readonly commonFacade: CommonFacade,
    private readonly offerFacade: OfferFacade,
    private readonly scrapperFacade: ScrapperFacade,
    private readonly imageFileFacade: ImageFileFacade,
    private readonly pdfFileFacade: PdfFileFacade,
    private readonly router: RouterFacade,
    private readonly snackService: SnackbarService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
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
      destinations: [''],
      categories: [''],
      shipId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      itinerary: this.fb.array([]),
    });

    this.offerFacade.getOfferSuccess$.pipe(take(1)).subscribe(({offer}) => {
      this.editingOffer = offer;

      if (!this.editingOffer) {
        this.snackService.showError('Nie znaleziono oferty')
        this.router.changeRoute({linkParams: ['/admin/offers']});
      }

      if (this.editingOffer) {
        this.patchValues(this.editingOffer)
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

    this.offerFacade.createOfferError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dodawania oferty');
    })

    this.offerFacade.updateOfferError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktualizowania oferty');
    })

    this.offerFacade.createOfferSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({offer}) => {
          const observables: Observable<boolean>[] = [];

          if (this.imageFile) {
            this.createImageFile(offer.id);
            const createImageSuccess$ = this.imageFileFacade.createImageFileSuccess$.pipe(map(() => true));
            const createImageError$ = this.imageFileFacade.createImageFileError$.pipe(map(() => false));
            observables.push(merge(createImageSuccess$, createImageError$));
          }

          if (this.pdfFile) {
            this.createPdfFile(offer.id);
            const createPdfSuccess$ = this.pdfFileFacade.createPdfFileSuccess$.pipe(map(() => true));
            const createPdfError$ = this.pdfFileFacade.createPdfFileError$.pipe(map(() => false));
            observables.push(merge(createPdfSuccess$, createPdfError$));
          }

          if (observables.length === 0) {
            return of([true]);
          }

          return combineLatest(observables);
        }),
        filter((results) => results.every((result) => result !== undefined))
      )
      .subscribe((results) => {
        if (results.every((result) => result)) {
          this.snackService.showInfo('Pomyślnie dodano ofertę');
        } else {
          this.snackService.showError('Oferta została dodana, ale wystąpił problem podczas przesyłania pliku obrazu');
        }

        this.router.changeRoute({linkParams: ['/admin/offers']});
      });


    this.offerFacade.updateOfferSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({offer}) => {
          const observables: Observable<boolean>[] = [];

          if (this.imageFile) {
            this.updateImageFile(offer.id);
            const updateImageSuccess$ = this.imageFileFacade.updateImageFileSuccess$.pipe(map(() => true));
            const updateImageError$ = this.imageFileFacade.updateImageFileError$.pipe(map(() => false));
            observables.push(merge(updateImageSuccess$, updateImageError$));
          }

          if (this.pdfFile) {
            this.updatePdfFile(offer.id);
            const updatePdfSuccess$ = this.pdfFileFacade.updatePdfFileSuccess$.pipe(map(() => true));
            const updatePdfError$ = this.pdfFileFacade.updatePdfFileError$.pipe(map(() => false));
            observables.push(merge(updatePdfSuccess$, updatePdfError$));
          }

          if (observables.length === 0) {
            return of([true]);
          }

          return combineLatest(observables);
        }),
        filter((results) => results.every((result) => result !== undefined))
      )
      .subscribe((results) => {
        if (results.every((result) => result)) {
          this.snackService.showInfo('Pomyślnie zaktualizowano ofertę');
        } else {
          this.snackService.showError('Oferta została zaktualizowana, ale wystąpił problem podczas przesyłania pliku obrazu');
        }

        this.router.changeRoute({linkParams: ['/admin/offers']});
      });

    this.offerFacade.deleteOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto ofertę")
      this.router.changeRoute({linkParams: ['/admin/offers']});
    })

    this.scrapperFacade.scrapOfferFileSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({offer}) => {

      if (!offer) {
        return
      }

      this.scrappedData = true

      if (offer.scrappedShipName) {
        this.commonFacade.getShipByNameSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ship}) => {
          this.offerForm.patchValue({
            companyId: ship.company.id,
            shipId: ship.id
          })
        })

        this.commonFacade.getShipByName({name: offer.scrappedShipName})
      }

      if (offer.scrappedImageFileURL) {
        this.scrappedImageFile = true
        this.imageFile = offer.scrappedImageFileURL
      }

      if (offer.scrappedPdfFileURL) {
        this.scrappedPdfFile = true
        this.pdfFile = offer.scrappedPdfFileURL
      }

      this.patchValues(offer)
    })

    this.commonFacade.getCompanies();
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

  // Obliczanie liczby dni i aktualizacja itinerary
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
      port: [''],
      arrivalTime: [''],
      departureTime: ['']
    });
    this.itineraryArray.push(dayGroup);
  }

  public getDateForItinerary(startDate: Date, dayNumber: number): string {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + dayNumber - 1);
    return newDate.toISOString().split('T')[0];
  }

  public onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      this.imageFile = file;
    }
  }

  public onPDFFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      this.pdfFile = file;
    }
  }


  public importOffer(): void {
    this.scrapperFacade.scrapOffer({url: this.offerForm.get('offerUrl').value});
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

  public createImageFile(offerId: string): void {
    const formData = new FormData()
    formData.append('imageFile', this.imageFile);
    this.imageFileFacade.createImageFile({imageFileType: 'offer', targetId: offerId, formData})
  }

  public createPdfFile(offerId: string): void {
    const formData = new FormData()
    formData.append('pdfFile', this.pdfFile);
    this.pdfFileFacade.createPdfFile({pdfFileType: 'offer', targetId: offerId, formData})
  }

  public updateImageFile(offerId: string): void {
    const formData = new FormData()
    formData.append('imageFile', this.imageFile);
    this.imageFileFacade.updateImageFile({imageFileType: 'offer', targetId: offerId, formData})
  }

  public updatePdfFile(offerId: string): void {
    const formData = new FormData()
    formData.append('pdfFile', this.pdfFile);
    this.pdfFileFacade.updateImageFile({pdfFileType: 'offer', targetId: offerId, formData})
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

  public patchValues(data: Partial<Offer>): void {
    this.offerForm.patchValue({
      ...data,
      price: Number(data.price),
      destinations: data?.destinations?.map((destinations: any) => destinations.id),
      categories: data?.categories?.map((categories: any) => categories.id),
    });

    // Dodanie itinerary, jeśli istnieje
    if (data?.itinerary) {
      this.itineraryArray.clear()

      const itineraryData = typeof data.itinerary === 'string'
        ? JSON.parse(data.itinerary)
        : data.itinerary;

      if (Array.isArray(itineraryData)) {
        itineraryData.forEach((day, index) => {
          const dayGroup = this.fb.group({
            day: [day.day || index + 1],
            date: [day.date || null],
            port: [day.port || null],
            arrivalTime: [day.arrivalTime || null],
            departureTime: [day.departureTime || null],
          });
          this.itineraryArray.push(dayGroup);
        });
      }
    }

  }


  public goBack(): void {
    this.router.changeRoute({linkParams: ['/admin/offers']});
  }
}
