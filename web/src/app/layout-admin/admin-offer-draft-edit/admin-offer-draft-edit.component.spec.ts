import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { AdminOfferDraftEditComponent } from './admin-offer-draft-edit.component';
import { CommonFacade } from '@state/common';
import { DiscoverFacade } from '@state/discover';
import { OfferFacade } from 'src/app/_state/offer';
import { ImageFileFacade } from '@state/imageFile';
import { PdfFileFacade } from '@state/pdfFile';
import { RouterFacade } from '@state/router';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';

describe('AdminOfferDraftEditComponent.applyDraft', () => {
  let component: AdminOfferDraftEditComponent;
  let fixture: ComponentFixture<AdminOfferDraftEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AdminOfferDraftEditComponent],
      providers: [
        {
          provide: CommonFacade,
          useValue: {
            companies$: of([{ id: 'company-1', name: 'MSC Cruises' }]),
            ships$: of([{ id: 'ship-1', name: 'MSC Meraviglia' }]),
            destinations$: of([]),
            categories$: of([]),
            cabinTypes$: of([{ id: 'cabin-1', name: 'wewnętrzna' }]),
            getCompanies: (): void => undefined,
            getCategories: (): void => undefined,
            getDestinations: (): void => undefined,
            getShips: (): void => undefined,
            getCabinTypes: (): void => undefined,
          },
        },
        {
          provide: DiscoverFacade,
          useValue: {
            getDraftSuccess$: EMPTY,
            deleteDraftSuccess$: EMPTY,
            getDraft: (): void => undefined,
            deleteDraft: (): void => undefined,
          },
        },
        {
          provide: OfferFacade,
          useValue: {
            createOfferSuccess$: EMPTY,
            createOfferError$: EMPTY,
            createOffer: (): void => undefined,
          },
        },
        {
          provide: ImageFileFacade,
          useValue: {
            createImageFileSuccess$: EMPTY,
            createImageFileError$: EMPTY,
            createImageFile: (): void => undefined,
          },
        },
        {
          provide: PdfFileFacade,
          useValue: { createPdfFileSuccess$: EMPTY, createPdfFileError$: EMPTY, createPdfFile: (): void => undefined },
        },
        { provide: RouterFacade, useValue: { changeRoute: (): void => undefined } },
        { provide: SnackbarService, useValue: { showError: (): void => undefined, showInfo: (): void => undefined } },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'draft-1' }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOfferDraftEditComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('prefills the form with the matched company, ship and cabin type suggestions from the draft', () => {
    component.applyDraft({
      id: 'draft-1',
      name: 'Rejs testowy',
      shipName: 'MSC Meraviglia',
      companyNameRaw: 'MSC Cruises',
      matchedCompanyId: 'company-1',
      matchedShipId: 'ship-1',
      imageUrl: 'https://rejsy4you.pl/img.jpg',
      pdfUrl: '',
      itinerary: [],
      terms: [
        {
          startDate: '2027-01-01',
          endDate: '2027-01-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/1_x_1',
          cabinPrices: [{ label: 'wewnętrzna', price: 100, matchedCabinTypeId: 'cabin-1' }],
        },
      ],
      sourceUrl: 'https://rejsy4you.pl/rejs/1_x_1',
      createdAt: '2026-09-11T00:00:00.000Z',
      updatedAt: '2026-09-11T00:00:00.000Z',
    });

    expect(component.draftForm.get('name')?.value).toBe('Rejs testowy');
    expect(component.draftForm.get('companyId')?.value).toBe('company-1');
    expect(component.draftForm.get('shipId')?.value).toBe('ship-1');
    expect(component.imageUrl).toBe('https://rejsy4you.pl/img.jpg');
    expect(component.termsArray.length).toBe(1);

    const pricesArray = component.termsArray.at(0).get('prices') as import('@angular/forms').FormArray;
    expect(pricesArray.at(0).get('cabinTypeId')?.value).toBe('cabin-1');
  });
});
