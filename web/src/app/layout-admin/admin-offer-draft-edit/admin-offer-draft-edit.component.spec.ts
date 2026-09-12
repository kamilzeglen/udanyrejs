import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of, Subject } from 'rxjs';
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
            cities$: of([]),
            categories$: of([]),
            cabinTypes$: of([{ id: 'cabin-1', name: 'wewnętrzna' }]),
            getCompanies: (): void => undefined,
            getCategories: (): void => undefined,
            getDestinations: (): void => undefined,
            getCities: (): void => undefined,
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
      itinerary: [],
      terms: [
        {
          startDate: '2027-01-01',
          endDate: '2027-01-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/1_x_1',
          pdfUrl: 'https://rejsy4you.pl/pdf',
          cabinPrices: [{ label: 'wewnętrzna', price: 100, matchedCabinTypeId: 'cabin-1' }],
        },
      ],
      sourceUrl: 'https://rejsy4you.pl/rejs/1_x_1',
      createdAt: '2026-09-11T00:00:00.000Z',
      updatedAt: '2026-09-11T00:00:00.000Z',
    });

    expect(component.draftForm.get('name')?.value).toBe('Rejs testowy');
    expect(component.draftForm.get('offerUrl')?.value).toBe('https://rejsy4you.pl/rejs/1_x_1');
    expect(component.draftForm.get('companyId')?.value).toBe('company-1');
    expect(component.draftForm.get('shipId')?.value).toBe('ship-1');
    expect(component.imageUrl).toBe('https://rejsy4you.pl/img.jpg');
    expect(component.pdfUrlsByTermIndex[0]).toBe('https://rejsy4you.pl/pdf');
    expect(component.termsArray.length).toBe(1);

    const pricesArray = component.termsArray.at(0).get('prices') as import('@angular/forms').FormArray;
    expect(pricesArray.at(0).get('cabinTypeId')?.value).toBe('cabin-1');
  });
});

describe('AdminOfferDraftEditComponent file import on approval', () => {
  let component: AdminOfferDraftEditComponent;
  let fixture: ComponentFixture<AdminOfferDraftEditComponent>;
  let createOfferSuccess$: Subject<{ offer: any }>;
  let createPdfFileSuccess$: Subject<{ pdfFile: unknown }>;
  let createPdfFileError$: Subject<{ errorMessage: string }>;
  let createImageFileSuccess$: Subject<{ imageFile: unknown }>;
  let createPdfFile: jasmine.Spy;
  let createImageFile: jasmine.Spy;
  let changeRoute: jasmine.Spy;
  let showError: jasmine.Spy;
  let showInfo: jasmine.Spy;

  beforeEach(async () => {
    createOfferSuccess$ = new Subject();
    createPdfFileSuccess$ = new Subject();
    createPdfFileError$ = new Subject();
    createImageFileSuccess$ = new Subject();
    createPdfFile = jasmine.createSpy('createPdfFile');
    createImageFile = jasmine.createSpy('createImageFile');
    changeRoute = jasmine.createSpy('changeRoute');
    showError = jasmine.createSpy('showError');
    showInfo = jasmine.createSpy('showInfo');

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
            cities$: of([]),
            categories$: of([]),
            cabinTypes$: of([{ id: 'cabin-1', name: 'wewnętrzna' }]),
            getCompanies: (): void => undefined,
            getCategories: (): void => undefined,
            getDestinations: (): void => undefined,
            getCities: (): void => undefined,
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
          useValue: { createOfferSuccess$, createOfferError$: EMPTY, createOffer: (): void => undefined },
        },
        {
          provide: ImageFileFacade,
          useValue: {
            createImageFileSuccess$,
            createImageFileError$: EMPTY,
            createImageFile,
          },
        },
        {
          provide: PdfFileFacade,
          useValue: { createPdfFileSuccess$, createPdfFileError$, createPdfFile },
        },
        { provide: RouterFacade, useValue: { changeRoute } },
        { provide: SnackbarService, useValue: { showError, showInfo } },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'draft-1' }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOfferDraftEditComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('creates each term PDF one at a time, waiting for the previous one to finish, instead of cancelling earlier requests', () => {
    component.applyDraft({
      id: 'draft-1',
      name: 'Rejs testowy',
      shipName: 'MSC Meraviglia',
      companyNameRaw: 'MSC Cruises',
      matchedCompanyId: 'company-1',
      matchedShipId: 'ship-1',
      imageUrl: '',
      itinerary: [],
      terms: [
        {
          startDate: '2027-01-01',
          endDate: '2027-01-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/1',
          pdfUrl: 'https://rejsy4you.pl/pdf-1',
          cabinPrices: [],
        },
        {
          startDate: '2027-02-01',
          endDate: '2027-02-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/2',
          pdfUrl: 'https://rejsy4you.pl/pdf-2',
          cabinPrices: [],
        },
      ],
      sourceUrl: 'https://rejsy4you.pl/rejs/1',
      createdAt: '2026-09-11T00:00:00.000Z',
      updatedAt: '2026-09-11T00:00:00.000Z',
    });

    const offer = {
      id: 'offer-1',
      terms: [
        { id: 'term-1', startDate: '2027-01-01', endDate: '2027-01-08' },
        { id: 'term-2', startDate: '2027-02-01', endDate: '2027-02-08' },
      ],
    };

    createOfferSuccess$.next({ offer });

    expect(createPdfFile).toHaveBeenCalledTimes(1);
    expect(createPdfFile).toHaveBeenCalledWith({
      pdfFileType: 'term',
      targetId: 'term-1',
      pdfUrl: 'https://rejsy4you.pl/pdf-1',
    });

    createPdfFileSuccess$.next({ pdfFile: {} });

    expect(createPdfFile).toHaveBeenCalledTimes(2);
    expect(createPdfFile).toHaveBeenCalledWith({
      pdfFileType: 'term',
      targetId: 'term-2',
      pdfUrl: 'https://rejsy4you.pl/pdf-2',
    });
    expect(changeRoute).not.toHaveBeenCalled();

    createPdfFileSuccess$.next({ pdfFile: {} });

    expect(changeRoute).toHaveBeenCalledWith({ linkParams: ['/admin/offers'] });
  });

  it('matches a term to the offer returned by the API even when its date comes back as a UTC-shifted ISO datetime', () => {
    component.applyDraft({
      id: 'draft-1',
      name: 'Rejs testowy',
      shipName: 'MSC Meraviglia',
      companyNameRaw: 'MSC Cruises',
      matchedCompanyId: 'company-1',
      matchedShipId: 'ship-1',
      imageUrl: '',
      itinerary: [],
      terms: [
        {
          startDate: '2027-01-01',
          endDate: '2027-01-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/1',
          pdfUrl: 'https://rejsy4you.pl/pdf-1',
          cabinPrices: [],
        },
      ],
      sourceUrl: 'https://rejsy4you.pl/rejs/1',
      createdAt: '2026-09-11T00:00:00.000Z',
      updatedAt: '2026-09-11T00:00:00.000Z',
    });

    // Tak realnie wygląda term.startDate zwrócone przez API: lokalna północ
    // z Postgresa zserializowana jako ISO string w UTC, przesunięta o strefę
    // serwera - inna dokładna chwila niż goły string '2027-01-01' z draftu,
    // ale ten sam dzień kalendarzowy.
    const offer = {
      id: 'offer-1',
      terms: [
        { id: 'term-1', startDate: new Date(2027, 0, 1).toISOString(), endDate: new Date(2027, 0, 8).toISOString() },
      ],
    };

    createOfferSuccess$.next({ offer });

    expect(createPdfFile).toHaveBeenCalledWith({
      pdfFileType: 'term',
      targetId: 'term-1',
      pdfUrl: 'https://rejsy4you.pl/pdf-1',
    });
  });

  it('waits for the offer image to finish saving before navigating away and refreshing the list', () => {
    component.applyDraft({
      id: 'draft-1',
      name: 'Rejs testowy',
      shipName: 'MSC Meraviglia',
      companyNameRaw: 'MSC Cruises',
      matchedCompanyId: 'company-1',
      matchedShipId: 'ship-1',
      imageUrl: 'https://rejsy4you.pl/img.jpg',
      itinerary: [],
      terms: [],
      sourceUrl: 'https://rejsy4you.pl/rejs/1',
      createdAt: '2026-09-11T00:00:00.000Z',
      updatedAt: '2026-09-11T00:00:00.000Z',
    });

    createOfferSuccess$.next({ offer: { id: 'offer-1', terms: [] } });

    expect(createImageFile).toHaveBeenCalledWith({
      imageFileType: 'offer',
      targetId: 'offer-1',
      imageUrl: 'https://rejsy4you.pl/img.jpg',
    });
    // Nawigacja na listę odpalałaby jej ngOnInit -> getOffers() ZANIM zdjęcie
    // zdążyłoby się zapisać na backendzie, więc panel pokazywałby brak
    // zdjęcia aż do ręcznego przeładowania strony - dokładnie zgłoszony bug.
    expect(changeRoute).not.toHaveBeenCalled();

    createImageFileSuccess$.next({ imageFile: {} });

    expect(changeRoute).toHaveBeenCalledWith({ linkParams: ['/admin/offers'] });
  });

  it('warns the admin instead of silently succeeding when a term PDF fails to download from the source page', () => {
    component.applyDraft({
      id: 'draft-1',
      name: 'Rejs testowy',
      shipName: 'MSC Meraviglia',
      companyNameRaw: 'MSC Cruises',
      matchedCompanyId: 'company-1',
      matchedShipId: 'ship-1',
      imageUrl: '',
      itinerary: [],
      terms: [
        {
          startDate: '2027-01-01',
          endDate: '2027-01-08',
          sourceUrl: 'https://rejsy4you.pl/rejs/1',
          pdfUrl: 'https://rejsy4you.pl/pdf-1',
          cabinPrices: [],
        },
      ],
      sourceUrl: 'https://rejsy4you.pl/rejs/1',
      createdAt: '2026-09-11T00:00:00.000Z',
      updatedAt: '2026-09-11T00:00:00.000Z',
    });

    createOfferSuccess$.next({
      offer: { id: 'offer-1', terms: [{ id: 'term-1', startDate: '2027-01-01', endDate: '2027-01-08' }] },
    });

    createPdfFileError$.next({ errorMessage: 'Failed to download PDF' });

    expect(showError).toHaveBeenCalled();
    expect(showInfo).not.toHaveBeenCalled();
    expect(changeRoute).toHaveBeenCalledWith({ linkParams: ['/admin/offers'] });
  });
});
