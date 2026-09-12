import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  combineLatest,
  concatMap,
  from,
  map,
  merge,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  take,
  takeUntil,
  toArray,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonFacade } from '@state/common';
import { DiscoverFacade } from '@state/discover';
import { OfferFacade } from 'src/app/_state/offer';
import { ImageFileFacade } from '@state/imageFile';
import { PdfFileFacade } from '@state/pdfFile';
import { RouterFacade } from '@state/router';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { Category, City, Offer, ScrapedOfferDraft } from '@interfaces';
import { matchDestinationIdsForCities } from '@core/utils/import-missing-destinations.util';
import { matchCategoryIdsForRange } from '@core/utils/import-missing-categories.util';
import { isSameCalendarDate } from '@core/utils/date-range.util';

@Component({
  selector: 'app-admin-offer-draft-edit',
  templateUrl: './admin-offer-draft-edit.component.html',
  styleUrl: './admin-offer-draft-edit.component.scss',
})
export class AdminOfferDraftEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public draftId: string;
  public draft: ScrapedOfferDraft;

  public companies$ = this.commonFacade.companies$;
  public ships$ = this.commonFacade.ships$;
  public destinations$ = this.commonFacade.destinations$;
  public cities$ = this.commonFacade.cities$;
  public categories$ = this.commonFacade.categories$;
  public cabinTypes$ = this.commonFacade.cabinTypes$;

  public draftForm: FormGroup;
  public itineraryArray: FormArray;
  public termsArray: FormArray;

  public imageUrl: string;
  // PDF jest per termin - draft.terms niesie własny pdfUrl na termin, ten
  // indeks musi zostać w zgodzie z indeksem w termsArray (patrz applyDraft).
  public pdfUrlsByTermIndex: (string | null)[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly commonFacade: CommonFacade,
    private readonly discoverFacade: DiscoverFacade,
    private readonly offerFacade: OfferFacade,
    private readonly imageFileFacade: ImageFileFacade,
    private readonly pdfFileFacade: PdfFileFacade,
    private readonly router: RouterFacade,
    private readonly snackService: SnackbarService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.draftForm = this.fb.group({
      name: ['', Validators.required],
      offerUrl: [''],
      companyId: ['', Validators.required],
      destinations: [''],
      shipId: ['', Validators.required],
      terms: this.fb.array([]),
      itinerary: this.fb.array([]),
    });

    this.itineraryArray = this.draftForm.get('itinerary') as FormArray;
    this.termsArray = this.draftForm.get('terms') as FormArray;

    this.discoverFacade.getDraftSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ draft }) => {
      this.applyDraft(draft);
    });

    this.offerFacade.createOfferSuccess$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ offer }) => {
          const observables: Observable<boolean>[] = [];

          if (this.imageUrl) {
            this.imageFileFacade.createImageFile({
              imageFileType: 'offer',
              targetId: offer.id,
              imageUrl: this.imageUrl,
            });
            const createImageSuccess$ = this.imageFileFacade.createImageFileSuccess$.pipe(map(() => true));
            const createImageError$ = this.imageFileFacade.createImageFileError$.pipe(map(() => false));
            observables.push(merge(createImageSuccess$, createImageError$).pipe(take(1)));
          }

          if (this.hasPendingPdfForAnyTerm()) {
            observables.push(this.createPdfFilesForTerms$(offer));
          }

          if (observables.length === 0) {
            return of(true);
          }

          return combineLatest(observables).pipe(map((results) => results.every((result) => result)));
        }),
      )
      .subscribe((allFilesSaved) => {
        if (allFilesSaved) {
          this.snackService.showInfo('Oferta zaimportowana');
        } else {
          this.snackService.showError(
            'Oferta zaimportowana, ale nie udało się pobrać zdjęcia lub PDF-a dla części terminów ze strony źródłowej',
          );
        }

        this.discoverFacade.deleteDraft({ id: this.draftId });
        this.router.changeRoute({ linkParams: ['/admin/offers'] });
      });

    this.offerFacade.createOfferError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Nie udało się zaimportować oferty');
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      this.draftId = paramMap.get('draftId');
      if (this.draftId) {
        this.discoverFacade.getDraft({ id: this.draftId });
      }
    });

    this.draftForm
      .get('companyId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const companyId = this.draftForm.get('companyId').value;
        if (companyId) {
          this.commonFacade.getShips(companyId);
          this.commonFacade.getCabinTypes(companyId);
        }
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

  public applyDraft(draft: ScrapedOfferDraft): void {
    this.draft = draft;

    this.draftForm.patchValue({
      name: draft.name,
      offerUrl: draft.sourceUrl || '',
      companyId: draft.matchedCompanyId || '',
      shipId: draft.matchedShipId || '',
    });

    this.imageUrl = draft.imageUrl || '';

    this.itineraryArray.clear();
    draft.itinerary.forEach((day) => {
      this.itineraryArray.push(
        this.fb.group({
          day: [day.day],
          date: [day.date],
          city: [day.city],
          arrivalTime: [day.arrivalTime],
          departureTime: [day.departureTime],
        }),
      );
    });

    this.termsArray.clear();
    this.pdfUrlsByTermIndex = [];
    draft.terms.forEach((term, termIndex) => {
      this.termsArray.push(
        this.fb.group({
          startDate: [term.startDate],
          endDate: [term.endDate],
          sourceUrl: [term.sourceUrl],
          categories: [[]],
          prices: this.fb.array(
            term.cabinPrices.map((cabinPrice) =>
              this.fb.group({
                cabinTypeId: [cabinPrice.matchedCabinTypeId || ''],
                price: [cabinPrice.price, Validators.required],
                cabinTypeName: [cabinPrice.matchedCabinTypeId ? '' : cabinPrice.label],
              }),
            ),
          ),
        }),
      );
      this.pdfUrlsByTermIndex[termIndex] = term.pdfUrl || null;
    });
  }

  public submitForm(): void {
    if (this.draftForm.invalid) {
      return;
    }

    const payload = { ...this.draftForm.value };
    for (const key in payload) {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    }

    // Formularz operuje na cenie w euro, backend przechowuje ją w groszach -
    // ta sama konwersja co w admin-offer-add-edit.component.ts.
    if (payload.terms) {
      payload.terms = payload.terms.map((term: any) => {
        const mappedTerm = {
          ...term,
          prices: (term.prices || []).map((priceRow: any) => {
            const price = { ...priceRow, price: Math.round(Number(priceRow.price) * 100) };

            if (!price.cabinTypeId) {
              delete price.cabinTypeId;
            }

            if (!price.cabinTypeName) {
              delete price.cabinTypeName;
            }

            return price;
          }),
        };

        if (!mappedTerm.categories?.length) {
          delete mappedTerm.categories;
        }

        return mappedTerm;
      });
    }

    this.offerFacade.createOffer({ formData: payload });
  }

  public goBack(): void {
    this.router.changeRoute({ linkParams: ['/admin/offers/discover/drafts'] });
  }

  public hasPendingPdfForAnyTerm(): boolean {
    return this.pdfUrlsByTermIndex.some((pdfUrl) => !!pdfUrl);
  }

  // Wysyłka jeden po drugim (concatMap), nie równolegle - createPdfFileSuccess$/
  // Error$ to jeden globalny strumień akcji dzielony przez switchMap w efekcie,
  // więc N równoległych żądań anulowałoby wszystkie poza ostatnim (tak samo
  // rozwiązane w admin-offer-add-edit.component.ts).
  private createPdfFilesForTerms$(offer: Offer): Observable<boolean> {
    const pendingTermIndexes = this.termsArray.controls
      .map((_, termIndex) => termIndex)
      .filter((termIndex) => this.pdfUrlsByTermIndex[termIndex]);

    return from(pendingTermIndexes).pipe(
      concatMap((termIndex) => {
        const termId = this.findMatchingTermId(offer, termIndex);
        if (!termId) {
          return of(false);
        }

        const result$ = merge(
          this.pdfFileFacade.createPdfFileSuccess$.pipe(map(() => true)),
          this.pdfFileFacade.createPdfFileError$.pipe(map(() => false)),
        ).pipe(take(1));

        this.pdfFileFacade.createPdfFile({
          pdfFileType: 'term',
          targetId: termId,
          pdfUrl: this.pdfUrlsByTermIndex[termIndex],
        });

        return result$;
      }),
      toArray(),
      map((results) => results.every((result) => result)),
    );
  }

  // Terminy formularza dopasowujemy do świeżo zapisanych terminów po dacie
  // (tak samo jak backend w diffOfferTerms) - kolejność zwrócona przez API
  // nie jest gwarantowana, a admin mógł poprawić daty przed importem.
  private findMatchingTermId(offer: Offer, termIndex: number): string | null {
    const termGroup = this.termsArray.at(termIndex);
    const startDate = termGroup.get('startDate')?.value;
    const endDate = termGroup.get('endDate')?.value;

    const matchedTerm = offer.terms?.find(
      (term) => isSameCalendarDate(term.startDate, startDate) && isSameCalendarDate(term.endDate, endDate),
    );

    return matchedTerm?.id ?? null;
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

    const matchedDestinationIds = matchDestinationIdsForCities(cityNames, cities);
    this.draftForm.patchValue({ destinations: matchedDestinationIds });

    if (matchedDestinationIds.length === 0) {
      this.snackService.showInfo('Brak pasujących regionów dla portów w planie podróży');
      return;
    }

    this.snackService.showInfo('Zaimportowano ' + matchedDestinationIds.length + ' region(ów)');
  }

  public importCategoriesForTerm(termIndex: number): void {
    let categories: Category[] = [];
    this.categories$.pipe(take(1)).subscribe((value) => {
      categories = value ?? [];
    });

    const termGroup = this.termsArray.at(termIndex);
    const startDate = termGroup.get('startDate')?.value as string;
    const endDate = termGroup.get('endDate')?.value as string;

    if (!startDate || !endDate) {
      this.snackService.showInfo('Uzupełnij daty terminu przed importem kategorii');
      return;
    }

    const matchedCategoryIds = matchCategoryIdsForRange({ startDate, endDate }, categories);
    termGroup.patchValue({ categories: matchedCategoryIds });

    if (matchedCategoryIds.length === 0) {
      this.snackService.showInfo('Brak pasujących kategorii dla tego terminu');
      return;
    }

    this.snackService.showInfo('Zaimportowano ' + matchedCategoryIds.length + ' kategori(e/i)');
  }

  public importCategoriesForAllTerms(): void {
    let categories: Category[] = [];
    this.categories$.pipe(take(1)).subscribe((value) => {
      categories = value ?? [];
    });

    let updatedTermsCount = 0;

    this.termsArray.controls.forEach((termGroup) => {
      const startDate = termGroup.get('startDate')?.value as string;
      const endDate = termGroup.get('endDate')?.value as string;

      if (!startDate || !endDate) {
        return;
      }

      const matchedCategoryIds = matchCategoryIdsForRange({ startDate, endDate }, categories);
      termGroup.patchValue({ categories: matchedCategoryIds });
      updatedTermsCount++;
    });

    if (updatedTermsCount === 0) {
      this.snackService.showInfo('Brak terminów z uzupełnionymi datami do zaimportowania');
      return;
    }

    this.snackService.showInfo('Zaimportowano kategorie dla ' + updatedTermsCount + ' termin(ów)');
  }
}
