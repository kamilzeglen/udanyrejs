import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, filter, merge, Observable, of, ReplaySubject, take, takeUntil } from 'rxjs';
import { CommonFacade } from '@state/common';
import { OfferFacade } from 'src/app/_state/offer';
import { RouterFacade } from '@state/router';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { ActivatedRoute } from '@angular/router';
import { City, Offer, OfferScrapper } from '@interfaces';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { ImageFileFacade } from '@state/imageFile';
import { PdfFileFacade } from '@state/pdfFile';
import { map, switchMap } from 'rxjs/operators';
import { findBestMatch } from '@core/utils/fuzzy-match.util';
import { resolveMissingDestinationIds } from '@core/utils/import-missing-destinations.util';

@Component({
  selector: 'app-admin-panel-add-edit',
  templateUrl: './admin-offer-add-edit.component.html',
  styleUrl: './admin-offer-add-edit.component.scss',
})
export class AdminOfferAddEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public mode: 'EDIT' | 'ADD' = 'ADD';
  public editingOffer: Offer;

  public isInitializing: boolean = false;

  public companies$ = this.commonFacade.companies$;
  public ships$ = this.commonFacade.ships$;
  public destinations$ = this.commonFacade.destinations$;
  public cities$ = this.commonFacade.cities$;
  public categories$ = this.commonFacade.categories$;

  public offerForm: FormGroup;
  public itineraryArray: FormArray;
  public termsArray: FormArray;
  public cabinTypes$ = this.commonFacade.cabinTypes$;
  public termsDisabledCabinTypeIds: Record<string, boolean>[][] = [];

  public scrappedData: boolean;

  public imageFile: File;
  public imageUrl: string;
  public scrappedImageFile: boolean;

  public pdfFile: File;
  public pdfUrl: string;
  public scrappedPdfFile: boolean;

  public scraping$ = this.offerFacade.scraping$;

  constructor(
    private readonly fb: FormBuilder,
    private readonly commonFacade: CommonFacade,
    private readonly offerFacade: OfferFacade,
    private readonly imageFileFacade: ImageFileFacade,
    private readonly pdfFileFacade: PdfFileFacade,
    private readonly router: RouterFacade,
    private readonly snackService: SnackbarService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly confirmationModalService: ConfirmationModalService,
  ) {}

  ngOnInit(): void {
    this.isInitializing = true;

    this.offerForm = this.fb.group({
      offerUrl: ['', [Validators.pattern('https?://.+')]],
      syncData: [true],
      isRecommended: [false],
      name: ['', Validators.required],
      companyId: ['', Validators.required],
      destinations: [''],
      categories: [''],
      shipId: ['', Validators.required],
      terms: this.fb.array([]),
      itinerary: this.fb.array([]),
    });

    this.itineraryArray = this.offerForm.get('itinerary') as FormArray;
    this.termsArray = this.offerForm.get('terms') as FormArray;

    this.termsArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.recomputeDisabledCabinTypes();
    });

    this.offerFacade.getOfferSuccess$.pipe(take(1)).subscribe(({ offer }) => {
      this.editingOffer = offer;

      if (!this.editingOffer) {
        this.snackService.showError('Nie znaleziono oferty');
        this.router.changeRoute({ linkParams: ['/admin/offers'] });
      }

      if (this.editingOffer) {
        this.patchValues(this.editingOffer);
      }

      this.isInitializing = false;
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const offerId = paramMap.get('offerId');
      if (offerId) {
        this.mode = 'EDIT';
        this.offerFacade.getOffer({ id: offerId });
      } else {
        this.isInitializing = false;
      }
    });

    this.offerForm
      .get('companyId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const companyId = this.offerForm.get('companyId').value;
        if (companyId) {
          this.commonFacade.getShips(companyId);
          this.commonFacade.getCabinTypes(companyId);
        }
      });

    this.offerFacade.createOfferError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas dodawania oferty');
    });

    this.offerFacade.updateOfferError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Wystąpił błąd podczas aktualizowania oferty');
    });

    this.offerFacade.createOfferSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ offer }) => {
          const observables: Observable<boolean>[] = [];

          if (this.imageFile || this.imageUrl) {
            this.createImageFile(offer.id);
            const createImageSuccess$ = this.imageFileFacade.createImageFileSuccess$.pipe(map(() => true));
            const createImageError$ = this.imageFileFacade.createImageFileError$.pipe(map(() => false));
            observables.push(merge(createImageSuccess$, createImageError$));
          }

          if (this.pdfFile || this.pdfUrl) {
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
        filter((results) => results.every((result) => result !== undefined)),
      )
      .subscribe((results) => {
        if (results.every((result) => result)) {
          this.snackService.showInfo('Pomyślnie dodano ofertę');
        } else {
          this.snackService.showError('Oferta została dodana, ale wystąpił problem podczas przesyłania pliku obrazu');
        }

        this.router.changeRoute({ linkParams: ['/admin/offers'] });
      });

    this.offerFacade.updateOfferSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ offer }) => {
          const observables: Observable<boolean>[] = [];

          if (this.imageFile || this.imageUrl) {
            this.updateImageFile(offer.id);
            const updateImageSuccess$ = this.imageFileFacade.updateImageFileSuccess$.pipe(map(() => true));
            const updateImageError$ = this.imageFileFacade.updateImageFileError$.pipe(map(() => false));
            observables.push(merge(updateImageSuccess$, updateImageError$));
          }

          if (this.pdfFile || this.pdfUrl) {
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
        filter((results) => results.every((result) => result !== undefined)),
      )
      .subscribe((results) => {
        if (results.every((result) => result)) {
          this.snackService.showInfo('Pomyślnie zaktualizowano ofertę');
        } else {
          this.snackService.showError(
            'Oferta została zaktualizowana, ale wystąpił problem podczas przesyłania pliku obrazu',
          );
        }

        this.router.changeRoute({ linkParams: ['/admin/offers'] });
      });

    this.offerFacade.deleteOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie usunięto ofertę');
      this.router.changeRoute({ linkParams: ['/admin/offers'] });
    });

    this.offerFacade.activateOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie aktywowano ofertę');
      this.router.changeRoute({ linkParams: ['/admin/offers'] });
    });

    this.offerFacade.deactivateOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie dezaktywowano ofertę');
      this.router.changeRoute({ linkParams: ['/admin/offers'] });
    });

    this.offerFacade.scrapeOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ scrapedOffer }) => {
      this.applyScrapedData(scrapedOffer);
    });

    this.offerFacade.scrapeOfferError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się zaimportować danych z podanego adresu URL');
    });

    this.commonFacade.getCompanies();
    this.commonFacade.getCategories();
    this.commonFacade.getDestinations();
    this.commonFacade.getCities();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public updateItineraryDays(): void {
    if (!this.termsArray.length) {
      return;
    }

    const firstTerm = this.termsArray.at(0);
    const startDate = new Date(firstTerm.get('startDate')?.value);
    const endDate = new Date(firstTerm.get('endDate')?.value);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const timeDifference = endDate.getTime() - startDate.getTime();
      const nights = Math.max(Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1, 0);
      this.adjustItineraryDays(nights, startDate);
    }
  }

  public addTerm(): void {
    const termGroup = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      prices: this.fb.array([]),
    });

    this.termsArray.push(termGroup);

    if (this.termsArray.length === 1) {
      this.subscribeToFirstTermDates(termGroup);
    }
  }

  public removeTerm(termIndex: number): void {
    this.termsArray.removeAt(termIndex);
  }

  public addTermPrice(termIndex: number): void {
    const pricesArray = this.termsArray.at(termIndex).get('prices') as FormArray;
    pricesArray.push(
      this.fb.group({
        cabinTypeId: ['', Validators.required],
        price: [null, Validators.required],
        cabinTypeName: [''],
      }),
    );
  }

  public removeTermPrice(termIndex: number, priceIndex: number): void {
    const pricesArray = this.termsArray.at(termIndex).get('prices') as FormArray;
    pricesArray.removeAt(priceIndex);
  }

  private recomputeDisabledCabinTypes(): void {
    this.termsDisabledCabinTypeIds = this.termsArray.controls.map((termGroup) => {
      const pricesArray = termGroup.get('prices') as FormArray;
      const selectedCabinTypeIds = pricesArray.controls.map((priceGroup) => priceGroup.get('cabinTypeId')?.value);

      return pricesArray.controls.map((priceGroup, rowIndex) => {
        const disabledCabinTypeIds: Record<string, boolean> = {};

        selectedCabinTypeIds.forEach((cabinTypeId, otherRowIndex) => {
          const isOwnRow = otherRowIndex === rowIndex;
          if (!cabinTypeId || isOwnRow) {
            return;
          }
          disabledCabinTypeIds[cabinTypeId] = true;
        });

        return disabledCabinTypeIds;
      });
    });
  }

  private subscribeToFirstTermDates(termGroup: FormGroup): void {
    termGroup
      .get('startDate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isInitializing) {
          this.updateItineraryDays();
        }
      });

    termGroup
      .get('endDate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isInitializing) {
          this.updateItineraryDays();
        }
      });
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
      city: [''],
      arrivalTime: [''],
      departureTime: [''],
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

  public submitForm(): void {
    if (this.offerForm.invalid) {
      return;
    }

    const payload = { ...this.offerForm.value };
    for (const key in payload) {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    }

    // Formularz operuje na cenie w złotych, backend przechowuje ją w groszach.
    if (payload.terms) {
      payload.terms = payload.terms.map((term: any) => ({
        ...term,
        prices: (term.prices || []).map((priceRow: any) => {
          const price = {
            ...priceRow,
            price: Math.round(Number(priceRow.price) * 100),
          };

          if (!price.cabinTypeId) {
            delete price.cabinTypeId;
          }

          if (!price.cabinTypeName) {
            delete price.cabinTypeName;
          }

          return price;
        }),
      }));
    }

    if (this.mode === 'ADD') {
      this.offerFacade.createOffer({ formData: payload });
    }

    if (this.mode === 'EDIT') {
      const id = this.editingOffer.id;
      this.offerFacade.updateOffer({ id, formData: payload });
    }
  }

  public createImageFile(offerId: string): void {
    if (this.imageUrl) {
      this.imageFileFacade.createImageFile({
        imageFileType: 'offer',
        targetId: offerId,
        imageUrl: this.imageUrl,
      });
    }
    if (this.imageFile) {
      const formData = new FormData();
      formData.append('imageFile', this.imageFile);

      this.imageFileFacade.createImageFile({
        imageFileType: 'offer',
        targetId: offerId,
        file: formData,
      });
    }
  }

  public createPdfFile(offerId: string): void {
    if (this.pdfUrl) {
      this.pdfFileFacade.createPdfFile({
        pdfFileType: 'offer',
        targetId: offerId,
        pdfUrl: this.pdfUrl,
      });
    }
    if (this.pdfFile) {
      const formData = new FormData();
      formData.append('pdfFile', this.pdfFile);

      this.pdfFileFacade.createPdfFile({
        pdfFileType: 'offer',
        targetId: offerId,
        file: formData,
      });
    }
  }

  public updateImageFile(offerId: string): void {
    if (this.imageUrl) {
      this.imageFileFacade.updateImageFile({
        imageFileType: 'offer',
        targetId: offerId,
        imageUrl: this.imageUrl,
      });
    }
    if (this.imageFile) {
      const formData = new FormData();
      formData.append('imageFile', this.imageFile);

      this.imageFileFacade.updateImageFile({
        imageFileType: 'offer',
        targetId: offerId,
        file: formData,
      });
    }
  }

  public updatePdfFile(offerId: string): void {
    if (this.pdfUrl) {
      this.pdfFileFacade.updatePdfFile({
        pdfFileType: 'offer',
        targetId: offerId,
        pdfUrl: this.pdfUrl,
      });
    }
    if (this.pdfFile) {
      const formData = new FormData();
      formData.append('pdfFile', this.pdfFile);

      this.pdfFileFacade.updatePdfFile({
        pdfFileType: 'offer',
        targetId: offerId,
        file: formData,
      });
    }
  }

  public deleteOffer(): void {
    if (this.editingOffer) {
      this.confirmationModalService
        .open({
          message: 'Jesteś pewny że chcesz usunąć ofertę: ' + this.editingOffer.name + '?',
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.offerFacade.deleteOffer({ id: this.editingOffer.id });
        });
    }
  }

  public deactivateOffer(): void {
    if (this.editingOffer) {
      this.confirmationModalService
        .open({
          message: 'Jesteś pewny że chcesz dezaktywować ofertę: ' + this.editingOffer.name + '?',
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.offerFacade.deactivateOffer({ id: this.editingOffer.id });
        });
    }
  }

  public activateOffer(): void {
    if (this.editingOffer) {
      this.confirmationModalService
        .open({
          message: 'Jesteś pewny że chcesz aktywować ofertę: ' + this.editingOffer.name + '?',
        })
        .afterClosed()
        .pipe(take(1))
        .subscribe((res) => {
          if (!res) {
            return;
          }

          this.offerFacade.activateOffer({ id: this.editingOffer.id });
        });
    }
  }

  public patchValues(data: Partial<Offer>): void {
    this.offerForm.patchValue({
      ...data,
      destinations: data?.destinations?.map((destinations: any) => destinations.id),
      categories: data?.categories?.map((categories: any) => categories.id),
    });

    if (data?.terms) {
      this.termsArray.clear();

      data.terms.forEach((term) => {
        const termGroup = this.fb.group({
          startDate: [term.startDate],
          endDate: [term.endDate],
          prices: this.fb.array(
            (term.prices || []).map((priceRow) =>
              this.fb.group({
                cabinTypeId: [priceRow.cabinType?.id ?? priceRow.cabinTypeId, Validators.required],
                price: [Number(priceRow.price) / 100, Validators.required],
              }),
            ),
          ),
        });
        this.termsArray.push(termGroup);
      });

      if (this.termsArray.length) {
        this.subscribeToFirstTermDates(this.termsArray.at(0) as FormGroup);
      }
    }

    // Dodanie itinerary, jeśli istnieje
    if (data?.itinerary) {
      this.itineraryArray.clear();

      const itineraryData = typeof data.itinerary === 'string' ? JSON.parse(data.itinerary) : data.itinerary;

      if (Array.isArray(itineraryData)) {
        itineraryData.forEach((day, index) => {
          const dayGroup = this.fb.group({
            day: [day.day || index + 1],
            date: [day.date || null],
            city: [day.city || null],
            arrivalTime: [day.arrivalTime || null],
            departureTime: [day.departureTime || null],
          });
          this.itineraryArray.push(dayGroup);
        });
      }
    }
  }

  public goBack(): void {
    this.router.changeRoute({ linkParams: ['/admin/offers'] });
  }

  public scrapeOfferUrl(): void {
    const url = this.offerForm.get('offerUrl')?.value;
    if (!url) {
      return;
    }

    this.offerFacade.scrapeOffer({ url });
  }

  public applyScrapedData(scrapedOffer: OfferScrapper): void {
    this.offerForm.patchValue({ name: scrapedOffer.name });
    this.applyScrapedItinerary(scrapedOffer.itinerary);
    this.applyScrapedFiles(scrapedOffer);
    this.scrappedData = true;

    const companyId = this.matchCompany(scrapedOffer.companyName);

    if (!companyId) {
      this.applyScrapedTerms(scrapedOffer, []);
      return;
    }

    // getShips/getCabinTypes dla nowego companyId są już wywoływane przez
    // subskrypcję companyId.valueChanges poniżej (ustawioną w ngOnInit) —
    // tutaj tylko czekamy na świeże dane zamiast czytać nieaktualny stan
    // sprzed przełączenia firmy.
    this.commonFacade.getShipsSuccess$.pipe(takeUntil(this.destroy$), take(1)).subscribe(({ ships }) => {
      const shipId = findBestMatch(scrapedOffer.shipName, ships ?? []);
      if (shipId) {
        this.offerForm.patchValue({ shipId });
      }
    });

    this.commonFacade.getCabinTypesSuccess$.pipe(takeUntil(this.destroy$), take(1)).subscribe(({ cabinTypes }) => {
      this.applyScrapedTerms(scrapedOffer, cabinTypes ?? []);
    });

    this.offerForm.patchValue({ companyId });
  }

  private applyScrapedFiles(scrapedOffer: OfferScrapper): void {
    if (scrapedOffer.imageUrl) {
      this.imageUrl = scrapedOffer.imageUrl;
      this.scrappedImageFile = true;
    }

    if (scrapedOffer.pdfUrl) {
      this.pdfUrl = scrapedOffer.pdfUrl;
      this.scrappedPdfFile = true;
    }
  }

  private matchCompany(companyName: string): string {
    let matchedCompanyId: string = null;
    this.companies$.pipe(take(1)).subscribe((companies) => {
      matchedCompanyId = findBestMatch(companyName, companies ?? []);
    });
    return matchedCompanyId;
  }

  private applyScrapedTerms(scrapedOffer: OfferScrapper, cabinTypes: { id: string; name: string }[]): void {
    this.termsArray.clear();

    scrapedOffer.terms.forEach((term) => {
      const termGroup = this.fb.group({
        startDate: [term.startDate],
        endDate: [term.endDate],
        sourceUrl: [term.sourceUrl],
        prices: this.fb.array(
          term.cabinPrices.map((cabinPrice) => {
            const cabinTypeId = findBestMatch(cabinPrice.label, cabinTypes) ?? '';
            return this.fb.group({
              cabinTypeId: [cabinTypeId],
              price: [cabinPrice.price, Validators.required],
              cabinTypeName: [cabinTypeId ? '' : cabinPrice.label],
            });
          }),
        ),
      });
      this.termsArray.push(termGroup);
    });
  }

  private applyScrapedItinerary(itinerary: OfferScrapper['itinerary']): void {
    this.itineraryArray.clear();
    itinerary.forEach((day) => {
      const dayGroup = this.fb.group({
        day: [day.day],
        date: [day.date],
        city: [day.city],
        arrivalTime: [day.arrivalTime],
        departureTime: [day.departureTime],
      });
      this.itineraryArray.push(dayGroup);
    });
  }

  public importMissingDestinations(): void {
    let cities: City[] = [];
    this.cities$.pipe(take(1)).subscribe((value) => {
      cities = value ?? [];
    });

    const cityNames = Array.from(
      new Set(
        this.itineraryArray.controls
          .map((dayGroup) => ((dayGroup.get('city')?.value as string) ?? '').trim())
          .filter((name) => name.length > 0),
      ),
    );

    const currentDestinationIds: string[] = this.offerForm.get('destinations')?.value ?? [];
    const missingDestinationIds = resolveMissingDestinationIds(cityNames, cities, currentDestinationIds);

    if (missingDestinationIds.length === 0) {
      this.snackService.showInfo('Brak nowych regionów do zaimportowania');
      return;
    }

    this.offerForm.patchValue({
      destinations: [...currentDestinationIds, ...missingDestinationIds],
    });

    this.snackService.showInfo('Zaimportowano ' + missingDestinationIds.length + ' region(ów)');
  }
}
