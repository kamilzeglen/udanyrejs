import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ImportExportHttpService } from '@core/_http/import-export.http.service';
import { ImportPreviewResult } from '@interfaces';
import { Observable, of, throwError } from 'rxjs';
import * as importExportActions from './import-export.actions';
import { ImportExportEffects } from './import-export.effects';

describe('ImportExportEffects', () => {
  let actions$: Observable<unknown>;
  let effects: ImportExportEffects;
  let httpService: jasmine.SpyObj<ImportExportHttpService>;

  beforeEach(() => {
    httpService = jasmine.createSpyObj('ImportExportHttpService', ['previewImport', 'confirmImport', 'exportEntities']);
    TestBed.configureTestingModule({
      providers: [
        ImportExportEffects,
        provideMockActions(() => actions$),
        { provide: ImportExportHttpService, useValue: httpService },
      ],
    });
    effects = TestBed.inject(ImportExportEffects);
  });

  it('preserves request correlation on preview success', (done) => {
    const result: ImportPreviewResult = { toCreate: 1, toUpdate: 0, errors: 0, rows: [] };
    const file = new File([], 'ships.zip');
    httpService.previewImport.and.returnValue(of(result));
    actions$ = of(importExportActions.previewImport({ payload: { entityType: 'ship', file, requestId: 'preview-7' } }));

    effects.previewImport$.subscribe((action) => {
      expect(action).toEqual(
        importExportActions.previewImportSuccess({ entityType: 'ship', requestId: 'preview-7', result }),
      );
      done();
    });
  });

  it('normalizes an API error message and continues with the correlated request', (done) => {
    const file = new File([], 'ships.zip');
    httpService.previewImport.and.returnValue(throwError(() => ({ error: { message: 'Nieprawidłowy plik' } })));
    actions$ = of(importExportActions.previewImport({ payload: { entityType: 'ship', file, requestId: 'preview-8' } }));

    effects.previewImport$.subscribe((action) => {
      expect(action).toEqual(
        importExportActions.previewImportError({
          entityType: 'ship',
          requestId: 'preview-8',
          errorMessage: 'Nieprawidłowy plik',
        }),
      );
      done();
    });
  });

  it('returns the blob and filename for export', (done) => {
    const blob = new Blob(['zip']);
    httpService.exportEntities.and.returnValue(of({ blob, filename: 'companies.zip' }));
    actions$ = of(importExportActions.exportEntities({ payload: { entityType: 'company' } }));

    effects.exportEntities$.subscribe((action) => {
      expect(action).toEqual(
        importExportActions.exportEntitiesSuccess({ entityType: 'company', blob, filename: 'companies.zip' }),
      );
      done();
    });
  });
});
