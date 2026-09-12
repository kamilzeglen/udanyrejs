import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonFacade } from '@state/common';
import { DiscoverFacade } from '@state/discover';
import { OfferFacade } from 'src/app/_state/offer';
import { ImageFileFacade } from '@state/imageFile';
import { PdfFileFacade } from '@state/pdfFile';
import { RouterFacade } from '@state/router';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { Category, City, ScrapedOfferDraft } from '@interfaces';
import { resolveMissingDestinationIds } from '@core/utils/import-missing-destinations.util';
import { resolveMissingCategoryIds } from '@core/utils/import-missing-categories.util';

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
  public pdfUrl: string;

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

    this.offerFacade.createOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ offer }) => {
      if (this.imageUrl) {
        this.imageFileFacade.createImageFile({ imageFileType: 'offer', targetId: offer.id, imageUrl: this.imageUrl });
      }

      if (this.pdfUrl) {
        this.pdfFileFacade.createPdfFile({ pdfFileType: 'offer', targetId: offer.id, pdfUrl: this.pdfUrl });
      }

      this.snackService.showInfo('Oferta zaimportowana');
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
      companyId: draft.matchedCompanyId || '',
      shipId: draft.matchedShipId || '',
    });

    this.imageUrl = draft.imageUrl || '';
    this.pdfUrl = draft.pdfUrl || '';

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
    draft.terms.forEach((term) => {
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

    const currentDestinationIds: string[] = this.draftForm.get('destinations')?.value ?? [];
    const missingDestinationIds = resolveMissingDestinationIds(cityNames, cities, currentDestinationIds);

    if (missingDestinationIds.length === 0) {
      this.snackService.showInfo('Brak nowych regionów do zaimportowania');
      return;
    }

    this.draftForm.patchValue({
      destinations: [...currentDestinationIds, ...missingDestinationIds],
    });

    this.snackService.showInfo('Zaimportowano ' + missingDestinationIds.length + ' region(ów)');
  }

  public importMissingCategories(termIndex: number): void {
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

    const currentCategoryIds: string[] = termGroup.get('categories')?.value ?? [];
    const missingCategoryIds = resolveMissingCategoryIds({ startDate, endDate }, categories, currentCategoryIds);

    if (missingCategoryIds.length === 0) {
      this.snackService.showInfo('Brak nowych kategorii do zaimportowania');
      return;
    }

    termGroup.patchValue({
      categories: [...currentCategoryIds, ...missingCategoryIds],
    });

    this.snackService.showInfo('Zaimportowano ' + missingCategoryIds.length + ' kategori(e/i)');
  }
}
