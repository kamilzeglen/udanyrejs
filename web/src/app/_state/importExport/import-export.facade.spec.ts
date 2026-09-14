import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import * as importExportActions from './import-export.actions';
import { ImportExportFacade } from './import-export.facade';
import { importExportReducer } from './import-export.reducer';

describe('ImportExportFacade', () => {
  let facade: ImportExportFacade;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ importExport: importExportReducer })],
      providers: [ImportExportFacade, provideMockActions(() => of())],
    });
    facade = TestBed.inject(ImportExportFacade);
    store = TestBed.inject(Store);
  });

  it('dispatches a correlated preview request', () => {
    spyOn(store, 'dispatch');
    const file = new File([], 'ships.zip');

    facade.previewImport({ entityType: 'ship', file, requestId: 'preview-1' });

    expect(store.dispatch).toHaveBeenCalledOnceWith(
      importExportActions.previewImport({ payload: { entityType: 'ship', file, requestId: 'preview-1' } }),
    );
  });

  it('dispatches selected ids for export', () => {
    spyOn(store, 'dispatch');

    facade.exportEntities({ entityType: 'company', ids: ['company-1'] });

    expect(store.dispatch).toHaveBeenCalledOnceWith(
      importExportActions.exportEntities({ payload: { entityType: 'company', ids: ['company-1'] } }),
    );
  });
});
