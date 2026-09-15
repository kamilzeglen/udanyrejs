import { BehaviorSubject, of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { CommonFacade } from '@state/common';
import { defaultPagination, OfferFacade } from '@state/offer';
import { SeoService } from '@core/seo/seo.service';
import { OfferListComponent } from './offer-list.component';

describe('OfferListComponent navigation', () => {
  let component: OfferListComponent;
  let queryParams: BehaviorSubject<Record<string, string>>;
  let queryParamMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let getOffers: jasmine.Spy;
  let setPageMeta: jasmine.Spy;

  beforeEach(() => {
    queryParams = new BehaviorSubject({});
    queryParamMap = new BehaviorSubject(convertToParamMap({}));
    const route = {
      queryParams,
      queryParamMap,
      paramMap: new BehaviorSubject(convertToParamMap({})),
    } as unknown as ActivatedRoute;
    getOffers = jasmine.createSpy('getOffers');
    setPageMeta = jasmine.createSpy('setPageMeta');
    const facade = {
      offers$: of([]),
      loading$: of(false),
      pagination$: of({ ...defaultPagination, all: 0 }),
      getOffers,
    } as unknown as OfferFacade;
    component = new OfferListComponent(
      facade,
      { getCategories: jasmine.createSpy('getCategories') } as unknown as CommonFacade,
      route,
      { setPageMeta } as unknown as SeoService,
      { url: '/offers' } as Router,
      route,
    );
    component.ngOnInit();
  });

  afterEach(() => component.ngOnDestroy());

  function navigateToPage(page: string): void {
    queryParams.next({ page });
    queryParamMap.next(convertToParamMap({ page }));
  }

  it('reloads results and updates metadata when browser navigation changes the page', () => {
    navigateToPage('3');

    expect(getOffers.calls.mostRecent().args[0].offset).toBe(2 * defaultPagination.limit);
    expect(setPageMeta.calls.mostRecent().args[0].path).toBe('/offers?page=3');
  });

  it('returns to the first page and handles invalid page numbers', () => {
    navigateToPage('3');
    navigateToPage('invalid');

    expect(component.page).toBe(0);
    expect(getOffers.calls.mostRecent().args[0].offset).toBe(0);
    expect(setPageMeta.calls.mostRecent().args[0].path).toBe('/offers');
  });

  it('applies the selected direction from the URL to the offer search', () => {
    queryParamMap.next(convertToParamMap({ destination: 'destination-1' }));

    expect(getOffers.calls.mostRecent().args[0].destinationIdList).toEqual(['destination-1']);
  });

  it('applies the selected carrier from the URL to the offer search', () => {
    queryParamMap.next(convertToParamMap({ company: 'company-1' }));

    expect(getOffers.calls.mostRecent().args[0].companyIdList).toEqual(['company-1']);
  });

  it('does not reload the same page or keep subscriptions after destruction', () => {
    const calls = getOffers.calls.count();
    navigateToPage('1');
    expect(getOffers.calls.count()).toBe(calls);
    component.ngOnDestroy();
    navigateToPage('2');
    expect(getOffers.calls.count()).toBe(calls);
    expect(component.page).toBe(0);
  });
});
