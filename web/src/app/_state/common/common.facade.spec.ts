import { TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { of } from 'rxjs';
import { CommonFacade } from './common.facade';
import { commonReducer } from './common.reducer';
import * as commonActions from './common.actions';

describe('CommonFacade.getCategories$', () => {
  let facade: CommonFacade;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ common: commonReducer })],
      providers: [CommonFacade, provideMockActions(() => of())],
    });

    facade = TestBed.inject(CommonFacade);
    store = TestBed.inject(Store);
  });

  it('dispatches getCategories once for the initial (never fetched) state', () => {
    spyOn(store, 'dispatch').and.callThrough();

    facade.getCategories$().subscribe();

    expect(store.dispatch).toHaveBeenCalledOnceWith(commonActions.getCategories());
  });

  it('does not retry when the server responds with an error', () => {
    facade.getCategories$().subscribe();

    spyOn(store, 'dispatch').and.callThrough();

    store.dispatch(commonActions.getCategoriesError({ errorMessage: 'Błąd serwera' }));

    expect(store.dispatch).not.toHaveBeenCalledWith(commonActions.getCategories());
  });

  it('emits categories once they are loaded', (done) => {
    const categories = [{ id: 'cat-1', name: 'Rejsy rodzinne' }] as never;

    facade.getCategories$().subscribe((result) => {
      expect(result).toEqual(categories);
      done();
    });

    store.dispatch(commonActions.getCategoriesSuccess({ categories }));
  });
});
