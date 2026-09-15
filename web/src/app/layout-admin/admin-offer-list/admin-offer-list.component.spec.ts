import { EMPTY, of } from 'rxjs';
import { AdminOfferListComponent } from './admin-offer-list.component';

describe('AdminOfferListComponent term sync', () => {
  it('synchronizes only the selected term', () => {
    const offerFacade = {
      loading$: of(false),
      pagination$: of(null),
      syncingOfferId$: of(null),
      bulkDeleting$: of(false),
      bulkSyncing$: of(false),
      bulkSyncingTerms$: of(false),
      offers$: of([]),
      syncTerms: jasmine.createSpy('syncTerms'),
      deleteOfferSuccess$: EMPTY,
      syncOfferSuccess$: EMPTY,
      syncOfferError$: EMPTY,
      deleteOffersSuccess$: EMPTY,
      deleteOffersError$: EMPTY,
      syncOffersSuccess$: EMPTY,
      syncOffersError$: EMPTY,
      syncTermsSuccess$: EMPTY,
      syncTermsError$: EMPTY,
    };
    const component = new AdminOfferListComponent(
      offerFacade as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    component.syncTerm('term-2');

    expect(offerFacade.syncTerms).toHaveBeenCalledOnceWith({ termIds: ['term-2'] });
  });
});
