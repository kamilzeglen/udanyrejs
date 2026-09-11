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
