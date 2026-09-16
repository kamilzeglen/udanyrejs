import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { OfferFacade } from '@state/offer';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { PdfFileFacade } from '@state/pdfFile';
import { RouterFacade } from '@state/router';
import { ShareStatsFacade } from '@state/shareStats';
import { SeoService } from '@core/seo/seo.service';
import { OfferDetailsComponent } from './offer-details.component';

describe('OfferDetailsComponent loading failures', () => {
  let fixture: ComponentFixture<OfferDetailsComponent>;
  let errors: Subject<unknown>;
  let success: Subject<unknown>;

  beforeEach(() => {
    errors = new Subject();
    success = new Subject();
    TestBed.configureTestingModule({
      declarations: [OfferDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: new BehaviorSubject(convertToParamMap({ offerId: 'offer-1' })),
            queryParamMap: of(convertToParamMap({})),
          },
        },
        {
          provide: OfferFacade,
          useValue: { getOfferSuccess$: success, getOfferError$: errors, getOffer: jasmine.createSpy('getOffer') },
        },
        { provide: Location, useValue: {} },
        { provide: DeviceInfoService, useValue: { getInfo: () => ({}), infoEmitter: new Subject() } },
        { provide: PdfFileFacade, useValue: {} },
        { provide: RouterFacade, useValue: { getPreviousUrl: () => of(null) } },
        { provide: Router, useValue: { url: '/offers/details/offer-1' } },
        {
          provide: SeoService,
          useValue: {
            setPageMeta: (): void => undefined,
            clearStructuredData: (): void => undefined,
            createCanonicalUrl: (): string => '',
            setStructuredData: (): void => undefined,
          },
        },
        { provide: ShareStatsFacade, useValue: {} },
      ],
    });
    TestBed.overrideComponent(OfferDetailsComponent, { set: { template: '' } });
    fixture = TestBed.createComponent(OfferDetailsComponent);
    fixture.detectChanges();
  });

  it('ends the skeleton state after an API failure', () => {
    errors.next({ errorMessage: 'network error' });

    expect(fixture.componentInstance.loading).toBeFalse();
    expect(fixture.componentInstance['loadingFailed']).toBeTrue();
  });

  it('ends the skeleton state when the API returns a missing offer', () => {
    success.next({ offer: null });

    expect(fixture.componentInstance.loading).toBeFalse();
    expect(fixture.componentInstance['loadingFailed']).toBeTrue();
  });

  it('keeps only itinerary stops with known coordinates for the route map', () => {
    success.next({
      offer: {
        id: 'offer-1',
        name: 'Rejs testowy',
        terms: [],
        itinerary: [
          {
            day: 1,
            city: 'Gdynia',
            latitude: 54.5189,
            longitude: 18.5305,
            arrivalTime: '08:00',
            departureTime: '18:00',
          },
          { day: 2, city: 'Nieznane', arrivalTime: '08:00', departureTime: '18:00' },
        ],
      },
    });

    expect(fixture.componentInstance.mappableItineraryStops.length).toBe(1);
    expect(fixture.componentInstance.mappableItineraryStops[0].city).toBe('Gdynia');
  });
});
