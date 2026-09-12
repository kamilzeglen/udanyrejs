import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EMPTY, of } from 'rxjs';
import { AdminOfferAddEditComponent } from './admin-offer-add-edit.component';
import { CommonFacade } from '@state/common';
import { OfferFacade } from 'src/app/_state/offer';
import { RouterFacade } from '@state/router';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationModalService } from '@shared/confirmation-modal/confirmation-modal.service';
import { ImageFileFacade } from '@state/imageFile';
import { PdfFileFacade } from '@state/pdfFile';

describe('AdminOfferAddEditComponent.applyScrapedData', () => {
  let component: AdminOfferAddEditComponent;
  let fixture: ComponentFixture<AdminOfferAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AdminOfferAddEditComponent],
      providers: [
        {
          provide: CommonFacade,
          useValue: {
            companies$: of([{ id: 'company-1', name: 'Norwegian Cruise Line' }]),
            ships$: of([{ id: 'ship-1', name: 'Norwegian Epic' }]),
            destinations$: of([]),
            cities$: of([]),
            categories$: of([]),
            cabinTypes$: of([{ id: 'cabin-1', name: 'wewnętrzna' }]),
            getShipsSuccess$: of({ ships: [{ id: 'ship-1', name: 'Norwegian Epic' }] }),
            getCabinTypesSuccess$: of({ cabinTypes: [{ id: 'cabin-1', name: 'wewnętrzna' }] }),
            getCompanies: (): void => undefined,
            getCategories: (): void => undefined,
            getDestinations: (): void => undefined,
            getCities: (): void => undefined,
            getShips: (): void => undefined,
            getCabinTypes: (): void => undefined,
          },
        },
        {
          provide: OfferFacade,
          useValue: {
            getOfferSuccess$: EMPTY,
            createOfferError$: EMPTY,
            updateOfferError$: EMPTY,
            createOfferSuccess$: EMPTY,
            updateOfferSuccess$: EMPTY,
            deleteOfferSuccess$: EMPTY,
            activateOfferSuccess$: EMPTY,
            deactivateOfferSuccess$: EMPTY,
            scrapeOfferSuccess$: EMPTY,
            scrapeOfferError$: EMPTY,
            scraping$: of(false),
            scrapeOffer: (): void => undefined,
          },
        },
        { provide: RouterFacade, useValue: { changeRoute: (): void => undefined } },
        {
          provide: SnackbarService,
          useValue: { showError: (): void => undefined, showInfo: (): void => undefined },
        },
        { provide: ActivatedRoute, useValue: { paramMap: EMPTY } },
        { provide: ConfirmationModalService, useValue: {} },
        {
          provide: ImageFileFacade,
          useValue: {
            createImageFileSuccess$: EMPTY,
            createImageFileError$: EMPTY,
            updateImageFileSuccess$: EMPTY,
            updateImageFileError$: EMPTY,
          },
        },
        {
          provide: PdfFileFacade,
          useValue: {
            createPdfFileSuccess$: EMPTY,
            createPdfFileError$: EMPTY,
            updatePdfFileSuccess$: EMPTY,
            updatePdfFileError$: EMPTY,
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOfferAddEditComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('fills name, matched company/ship, terms with matched cabin prices, and file URLs', () => {
    component.applyScrapedData({
      name: 'Rejs testowy',
      shipName: 'Norwegian Epic',
      companyName: 'Norwegian Cruise Line',
      imageUrl: 'https://rejsy4you.pl/img.jpg',
      pdfUrl: 'https://rejsy4you.pl/pdf',
      itinerary: [{ day: 1, date: '2027-01-01', city: 'Gdynia', arrivalTime: '', departureTime: '10:00' }],
      terms: [
        {
          startDate: '2027-01-01',
          endDate: '2027-01-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/1',
          cabinPrices: [{ label: 'wewnętrzna', price: 100 }],
        },
      ],
    });

    expect(component.offerForm.get('name')?.value).toBe('Rejs testowy');
    expect(component.offerForm.get('companyId')?.value).toBe('company-1');
    expect(component.scrappedData).toBe(true);
    expect(component.imageUrl).toBe('https://rejsy4you.pl/img.jpg');
    expect(component.scrappedImageFile).toBe(true);
    expect(component.pdfUrl).toBe('https://rejsy4you.pl/pdf');
    expect(component.scrappedPdfFile).toBe(true);
    expect(component.itineraryArray.length).toBe(1);
    expect(component.termsArray.length).toBe(1);

    const pricesArray = component.termsArray.at(0).get('prices') as import('@angular/forms').FormArray;
    expect(pricesArray.at(0).get('cabinTypeId')?.value).toBe('cabin-1');
  });

  it('leaves cabinTypeId empty and keeps the scraped label when nothing matches', () => {
    component.applyScrapedData({
      name: 'Rejs testowy',
      shipName: 'Unknown Ship',
      companyName: 'Norwegian Cruise Line',
      imageUrl: '',
      pdfUrl: '',
      itinerary: [],
      terms: [
        {
          startDate: '2027-01-01',
          endDate: '2027-01-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/1',
          cabinPrices: [{ label: 'kabina bez odpowiednika', price: 50 }],
        },
      ],
    });

    const pricesArray = component.termsArray.at(0).get('prices') as import('@angular/forms').FormArray;
    const priceGroup = pricesArray.at(0);
    expect(priceGroup.get('cabinTypeId')?.value).toBe('');
    expect(priceGroup.get('cabinTypeName')?.value).toBe('kabina bez odpowiednika');
  });
});

describe('AdminOfferAddEditComponent.submitForm', () => {
  let component: AdminOfferAddEditComponent;
  let fixture: ComponentFixture<AdminOfferAddEditComponent>;
  let offerFacade: { createOffer: jasmine.Spy };

  beforeEach(async () => {
    offerFacade = { createOffer: jasmine.createSpy('createOffer') };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AdminOfferAddEditComponent],
      providers: [
        {
          provide: CommonFacade,
          useValue: {
            companies$: of([{ id: 'company-1', name: 'Norwegian Cruise Line' }]),
            ships$: of([{ id: 'ship-1', name: 'Norwegian Epic' }]),
            destinations$: of([]),
            cities$: of([]),
            categories$: of([]),
            cabinTypes$: of([{ id: 'cabin-1', name: 'wewnętrzna' }]),
            getShipsSuccess$: of({ ships: [{ id: 'ship-1', name: 'Norwegian Epic' }] }),
            getCabinTypesSuccess$: of({ cabinTypes: [{ id: 'cabin-1', name: 'wewnętrzna' }] }),
            getCompanies: (): void => undefined,
            getCategories: (): void => undefined,
            getDestinations: (): void => undefined,
            getCities: (): void => undefined,
            getShips: (): void => undefined,
            getCabinTypes: (): void => undefined,
          },
        },
        {
          provide: OfferFacade,
          useValue: {
            getOfferSuccess$: EMPTY,
            createOfferError$: EMPTY,
            updateOfferError$: EMPTY,
            createOfferSuccess$: EMPTY,
            updateOfferSuccess$: EMPTY,
            deleteOfferSuccess$: EMPTY,
            activateOfferSuccess$: EMPTY,
            deactivateOfferSuccess$: EMPTY,
            scrapeOfferSuccess$: EMPTY,
            scrapeOfferError$: EMPTY,
            scraping$: of(false),
            scrapeOffer: (): void => undefined,
            createOffer: offerFacade.createOffer,
          },
        },
        { provide: RouterFacade, useValue: { changeRoute: (): void => undefined } },
        {
          provide: SnackbarService,
          useValue: { showError: (): void => undefined, showInfo: (): void => undefined },
        },
        { provide: ActivatedRoute, useValue: { paramMap: EMPTY } },
        { provide: ConfirmationModalService, useValue: {} },
        {
          provide: ImageFileFacade,
          useValue: {
            createImageFileSuccess$: EMPTY,
            createImageFileError$: EMPTY,
            updateImageFileSuccess$: EMPTY,
            updateImageFileError$: EMPTY,
          },
        },
        {
          provide: PdfFileFacade,
          useValue: {
            createPdfFileSuccess$: EMPTY,
            createPdfFileError$: EMPTY,
            updatePdfFileSuccess$: EMPTY,
            updatePdfFileError$: EMPTY,
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOfferAddEditComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('strips empty cabinTypeId/cabinTypeName so the backend DTO does not reject them', () => {
    component.applyScrapedData({
      name: 'Rejs testowy',
      shipName: 'Norwegian Epic',
      companyName: 'Norwegian Cruise Line',
      imageUrl: '',
      pdfUrl: '',
      itinerary: [],
      terms: [
        {
          startDate: '2027-01-01',
          endDate: '2027-01-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/1',
          cabinPrices: [
            { label: 'wewnętrzna', price: 100 },
            { label: 'kabina bez odpowiednika', price: 50 },
          ],
        },
      ],
    });

    component.submitForm();

    expect(offerFacade.createOffer).toHaveBeenCalled();
    const payload = offerFacade.createOffer.calls.mostRecent().args[0].formData;
    const prices = payload.terms[0].prices;

    expect(prices[0].cabinTypeId).toBe('cabin-1');
    expect(prices[0].cabinTypeName).toBeUndefined();

    expect(prices[1].cabinTypeId).toBeUndefined();
    expect(prices[1].cabinTypeName).toBe('kabina bez odpowiednika');
  });
});

describe('AdminOfferAddEditComponent.categoryImport', () => {
  let component: AdminOfferAddEditComponent;
  let fixture: ComponentFixture<AdminOfferAddEditComponent>;
  let offerFacadeMock: { createOffer: jasmine.Spy };

  beforeEach(async () => {
    offerFacadeMock = { createOffer: jasmine.createSpy('createOffer') };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AdminOfferAddEditComponent],
      providers: [
        {
          provide: CommonFacade,
          useValue: {
            companies$: of([]),
            ships$: of([]),
            destinations$: of([]),
            cities$: of([]),
            categories$: of([{ id: 'cat-zima', name: 'Zima', startDate: '2026-12-01', endDate: '2027-02-28' }]),
            cabinTypes$: of([]),
            getShipsSuccess$: EMPTY,
            getCabinTypesSuccess$: EMPTY,
            getCompanies: (): void => undefined,
            getCategories: (): void => undefined,
            getDestinations: (): void => undefined,
            getCities: (): void => undefined,
            getShips: (): void => undefined,
            getCabinTypes: (): void => undefined,
          },
        },
        {
          provide: OfferFacade,
          useValue: {
            getOfferSuccess$: EMPTY,
            createOfferError$: EMPTY,
            updateOfferError$: EMPTY,
            createOfferSuccess$: EMPTY,
            updateOfferSuccess$: EMPTY,
            deleteOfferSuccess$: EMPTY,
            activateOfferSuccess$: EMPTY,
            deactivateOfferSuccess$: EMPTY,
            scrapeOfferSuccess$: EMPTY,
            scrapeOfferError$: EMPTY,
            scraping$: of(false),
            scrapeOffer: (): void => undefined,
            createOffer: offerFacadeMock.createOffer,
          },
        },
        { provide: RouterFacade, useValue: { changeRoute: (): void => undefined } },
        {
          provide: SnackbarService,
          useValue: { showError: (): void => undefined, showInfo: (): void => undefined },
        },
        { provide: ActivatedRoute, useValue: { paramMap: EMPTY } },
        { provide: ConfirmationModalService, useValue: {} },
        {
          provide: ImageFileFacade,
          useValue: {
            createImageFileSuccess$: EMPTY,
            createImageFileError$: EMPTY,
            updateImageFileSuccess$: EMPTY,
            updateImageFileError$: EMPTY,
          },
        },
        {
          provide: PdfFileFacade,
          useValue: {
            createPdfFileSuccess$: EMPTY,
            createPdfFileError$: EMPTY,
            updatePdfFileSuccess$: EMPTY,
            updatePdfFileError$: EMPTY,
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOfferAddEditComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('initializes an empty categories control for each new term', () => {
    component.addTerm();

    expect(component.termsArray.at(0).get('categories')?.value).toBeFalsy();
  });

  it('overwrites only the targeted term with categories matching its own date range', () => {
    component.addTerm();
    component.addTerm();
    component.termsArray.at(0).patchValue({ startDate: '2026-12-10', endDate: '2026-12-20' });
    component.termsArray.at(1).patchValue({ startDate: '2026-06-01', endDate: '2026-06-08' });

    component.importCategoriesForTerm(0);

    expect(component.termsArray.at(0).get('categories')?.value).toEqual(['cat-zima']);
    expect(component.termsArray.at(1).get('categories')?.value).toBeFalsy();
  });

  it('overwrites a previously hand-picked category when it no longer matches the term range', () => {
    component.addTerm();
    component.termsArray.at(0).patchValue({
      startDate: '2026-06-01',
      endDate: '2026-06-08',
      categories: ['cat-zima'],
    });

    component.importCategoriesForTerm(0);

    expect(component.termsArray.at(0).get('categories')?.value).toEqual([]);
  });

  it('imports categories for every term that has filled-in dates in one action', () => {
    component.addTerm();
    component.addTerm();
    component.addTerm();
    component.termsArray.at(0).patchValue({ startDate: '2026-12-10', endDate: '2026-12-20' });
    component.termsArray.at(1).patchValue({ startDate: '2026-06-01', endDate: '2026-06-08' });
    component.termsArray.at(2).patchValue({ startDate: '', endDate: '' });

    component.importCategoriesForAllTerms();

    expect(component.termsArray.at(0).get('categories')?.value).toEqual(['cat-zima']);
    expect(component.termsArray.at(1).get('categories')?.value).toEqual([]);
    expect(component.termsArray.at(2).get('categories')?.value).toBeFalsy();
  });

  it('strips an untouched (empty-string) categories control from the payload instead of sending it as-is', () => {
    component.addTerm();
    component.termsArray.at(0).patchValue({
      startDate: '2026-12-10',
      endDate: '2026-12-20',
    });
    component.addTermPrice(0);
    const pricesArray = component.termsArray.at(0).get('prices') as import('@angular/forms').FormArray;
    pricesArray.at(0).patchValue({ cabinTypeId: 'cabin-1', price: 100 });

    component.offerForm.patchValue({ name: 'Rejs testowy', companyId: 'company-1', shipId: 'ship-1' });

    component.submitForm();

    const payload = offerFacadeMock.createOffer.calls.mostRecent().args[0].formData;
    expect(payload.terms[0].categories).toBeUndefined();
  });
});
