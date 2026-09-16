import { of } from 'rxjs';
import { SeoLandingPageComponent } from './seo-landing-page.component';

describe('SeoLandingPageComponent', () => {
  function createComponent(response: object = { data: [], pagination: { all: 0 } }): {
    component: SeoLandingPageComponent;
    offersHttpService: jasmine.SpyObj<any>;
    router: jasmine.SpyObj<any>;
  } {
    const offersHttpService = jasmine.createSpyObj('OffersHttpService', ['getOffers']);
    offersHttpService.getOffers.and.returnValue(of(response));
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const component = new SeoLandingPageComponent(
      { snapshot: { data: {}, url: [] }, paramMap: of(), queryParamMap: of() } as any,
      {} as any,
      offersHttpService,
      {
        setPageMeta: jasmine.createSpy(),
        setStructuredData: jasmine.createSpy(),
        createCanonicalUrl: jasmine.createSpy(),
      } as any,
      router,
    );

    return { component, offersHttpService, router };
  }

  it('loads the nearest destination offers first', () => {
    const { component, offersHttpService } = createComponent();
    component.entityType = 'destination';

    (component as any).loadEntity({ id: 'destination-1', name: 'Karaiby', slug: 'caribbean' });

    expect(offersHttpService.getOffers).toHaveBeenCalledWith({
      destinationIdList: ['destination-1'],
      limit: 10,
      offset: 0,
      orderBy: 'startDate',
      orderDir: 'asc',
    });
  });

  it('loads the selected page and exposes the total offer count', () => {
    const { component, offersHttpService } = createComponent({
      data: [{ id: 'offer-21' }],
      pagination: { all: 24 },
    });
    component.entityType = 'company';

    (component as any).loadEntity({ id: 'company-1', name: 'Armator', slug: 'armator' }, 2);

    expect(offersHttpService.getOffers).toHaveBeenCalledWith({
      companyIdList: ['company-1'],
      limit: 10,
      offset: 20,
      orderBy: 'startDate',
      orderDir: 'asc',
    });
    expect((component as any).totalOffers).toBe(24);
  });

  it('stores the selected page in the URL', () => {
    const { component, router } = createComponent();

    component.pageChanged({ pageIndex: 2, pageSize: 10, length: 24, previousPageIndex: 1 });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: jasmine.anything(),
      queryParams: { page: 3 },
      queryParamsHandling: 'merge',
    });
  });
});
