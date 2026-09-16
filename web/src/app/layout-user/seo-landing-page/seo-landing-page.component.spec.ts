import { of } from 'rxjs';
import { SeoLandingPageComponent } from './seo-landing-page.component';

describe('SeoLandingPageComponent', () => {
  it('loads destination offers with the required pagination', () => {
    const offersHttpService = jasmine.createSpyObj('OffersHttpService', ['getOffers']);
    offersHttpService.getOffers.and.returnValue(of({ data: [] }));
    const component = new SeoLandingPageComponent(
      { snapshot: { data: {}, url: [] }, paramMap: of() } as any,
      {} as any,
      offersHttpService,
      {
        setPageMeta: jasmine.createSpy(),
        setStructuredData: jasmine.createSpy(),
        createCanonicalUrl: jasmine.createSpy(),
      } as any,
    );
    component.entityType = 'destination';

    (component as any).loadEntity({ id: 'destination-1', name: 'Karaiby', slug: 'caribbean' });

    expect(offersHttpService.getOffers).toHaveBeenCalledWith({
      destinationIdList: ['destination-1'],
      limit: 10,
      offset: 0,
      orderBy: 'name',
      orderDir: 'asc',
    });
  });
});
