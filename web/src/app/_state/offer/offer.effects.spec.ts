import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { OfferEffects } from './offer.effects';
import { OffersHttpService } from '@core/_http/offers.http.service';
import * as offerActions from './offer.actions';

describe('OfferEffects.scrapeOffer$', () => {
  let actions$: Observable<unknown>;
  let effects: OfferEffects;
  let httpService: jasmine.SpyObj<OffersHttpService>;

  beforeEach(() => {
    httpService = jasmine.createSpyObj('OffersHttpService', ['scrapeOffer']);

    TestBed.configureTestingModule({
      providers: [
        OfferEffects,
        provideMockActions(() => actions$),
        { provide: OffersHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(OfferEffects);
  });

  it('dispatches scrapeOfferSuccess when the HTTP call succeeds', (done) => {
    const scrapedOffer = { name: 'Rejs testowy' } as never;
    httpService.scrapeOffer.and.returnValue(of(scrapedOffer));
    actions$ = of(offerActions.scrapeOffer({ payload: { url: 'https://rejsy4you.pl/rejs/1' } }));

    effects.scrapeOffer$.subscribe((action) => {
      expect(action).toEqual(offerActions.scrapeOfferSuccess({ scrapedOffer }));
      done();
    });
  });

  it('dispatches scrapeOfferError when the HTTP call fails', (done) => {
    httpService.scrapeOffer.and.returnValue(throwError(() => 'network error'));
    actions$ = of(offerActions.scrapeOffer({ payload: { url: 'https://rejsy4you.pl/rejs/1' } }));

    effects.scrapeOffer$.subscribe((action) => {
      expect(action).toEqual(offerActions.scrapeOfferError({ errorMessage: 'network error' }));
      done();
    });
  });
});

describe('OfferEffects.deleteOffers$', () => {
  let actions$: Observable<unknown>;
  let effects: OfferEffects;
  let httpService: jasmine.SpyObj<OffersHttpService>;

  beforeEach(() => {
    httpService = jasmine.createSpyObj('OffersHttpService', ['deleteOffers']);

    TestBed.configureTestingModule({
      providers: [
        OfferEffects,
        provideMockActions(() => actions$),
        { provide: OffersHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(OfferEffects);
  });

  it('dispatches deleteOffersSuccess with the deleted and failed ids when the HTTP call succeeds', (done) => {
    httpService.deleteOffers.and.returnValue(of({ deletedIds: ['offer-1'], failedIds: ['offer-2'] }));
    actions$ = of(offerActions.deleteOffers({ payload: { ids: ['offer-1', 'offer-2'] } }));

    effects.deleteOffers$.subscribe((action) => {
      expect(action).toEqual(offerActions.deleteOffersSuccess({ deletedIds: ['offer-1'], failedIds: ['offer-2'] }));
      done();
    });
  });

  it('dispatches deleteOffersError when the HTTP call fails', (done) => {
    httpService.deleteOffers.and.returnValue(throwError(() => 'network error'));
    actions$ = of(offerActions.deleteOffers({ payload: { ids: ['offer-1'] } }));

    effects.deleteOffers$.subscribe((action) => {
      expect(action).toEqual(offerActions.deleteOffersError({ errorMessage: 'network error' }));
      done();
    });
  });
});

describe('OfferEffects.syncOffers$', () => {
  let actions$: Observable<unknown>;
  let effects: OfferEffects;
  let httpService: jasmine.SpyObj<OffersHttpService>;

  beforeEach(() => {
    httpService = jasmine.createSpyObj('OffersHttpService', ['syncOffers']);

    TestBed.configureTestingModule({
      providers: [
        OfferEffects,
        provideMockActions(() => actions$),
        { provide: OffersHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(OfferEffects);
  });

  it('dispatches syncOffersSuccess with the aggregated result when the HTTP call succeeds', (done) => {
    const result = {
      syncedIds: ['offer-1'],
      failedIds: [],
      termsAdded: 1,
      termsDeactivated: 0,
      termsReactivated: 0,
      termsSkipped: 0,
      pdfsUpdated: 0,
    } as never;
    httpService.syncOffers.and.returnValue(of(result));
    actions$ = of(offerActions.syncOffers({ payload: { ids: ['offer-1'] } }));

    effects.syncOffers$.subscribe((action) => {
      expect(action).toEqual(offerActions.syncOffersSuccess({ result }));
      done();
    });
  });

  it('dispatches syncOffersError when the HTTP call fails', (done) => {
    httpService.syncOffers.and.returnValue(throwError(() => 'network error'));
    actions$ = of(offerActions.syncOffers({ payload: { ids: ['offer-1'] } }));

    effects.syncOffers$.subscribe((action) => {
      expect(action).toEqual(offerActions.syncOffersError({ errorMessage: 'network error' }));
      done();
    });
  });
});

describe('OfferEffects.syncTerms$', () => {
  let actions$: Observable<unknown>;
  let effects: OfferEffects;
  let httpService: jasmine.SpyObj<OffersHttpService>;

  beforeEach(() => {
    httpService = jasmine.createSpyObj('OffersHttpService', ['syncTerms']);

    TestBed.configureTestingModule({
      providers: [
        OfferEffects,
        provideMockActions(() => actions$),
        { provide: OffersHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(OfferEffects);
  });

  it('dispatches syncTermsSuccess with the aggregated result when the HTTP call succeeds', (done) => {
    const result = {
      syncedIds: ['term-1'],
      failedIds: [],
      reactivatedIds: ['term-1'],
      deactivatedIds: [],
      pdfsUpdated: 0,
    } as never;
    httpService.syncTerms.and.returnValue(of(result));
    actions$ = of(offerActions.syncTerms({ payload: { termIds: ['term-1'] } }));

    effects.syncTerms$.subscribe((action) => {
      expect(action).toEqual(offerActions.syncTermsSuccess({ result }));
      done();
    });
  });

  it('dispatches syncTermsError when the HTTP call fails', (done) => {
    httpService.syncTerms.and.returnValue(throwError(() => 'network error'));
    actions$ = of(offerActions.syncTerms({ payload: { termIds: ['term-1'] } }));

    effects.syncTerms$.subscribe((action) => {
      expect(action).toEqual(offerActions.syncTermsError({ errorMessage: 'network error' }));
      done();
    });
  });
});
