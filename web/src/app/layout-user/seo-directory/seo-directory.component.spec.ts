import { of } from 'rxjs';
import { SeoDirectoryComponent } from './seo-directory.component';

describe('SeoDirectoryComponent', () => {
  it('shows active destinations with slugs in alphabetical order', () => {
    const component = new SeoDirectoryComponent(
      { snapshot: { data: { entityType: 'destination' } } } as any,
      {
        destinations$: of([
          { name: 'Karaiby', slug: 'caribbean', isActive: true },
          { name: 'Alaska', slug: 'alaska', isActive: true },
          { name: 'Afryka', isActive: true },
          { name: 'Azja', slug: 'asia', isActive: false },
        ]),
        companies$: of([]),
        getDestinations: jasmine.createSpy(),
        getCompanies: jasmine.createSpy(),
      } as any,
      {
        setPageMeta: jasmine.createSpy(),
        setStructuredData: jasmine.createSpy(),
        createCanonicalUrl: jasmine.createSpy(),
      } as any,
    );

    component.ngOnInit();

    component.entities$.subscribe((entities) => {
      expect(entities.map((entity) => entity.name)).toEqual(['Alaska', 'Karaiby']);
    });
  });
});
