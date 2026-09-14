import { ImportConfirmResult, ImportPreviewResult } from '@interfaces';
import * as importExportActions from './import-export.actions';
import { importExportReducer } from './import-export.reducer';
import { initialState } from './import-export.state';

describe('importExportReducer', () => {
  const previewResult: ImportPreviewResult = { toCreate: 1, toUpdate: 0, errors: 0, rows: [] };

  it('starts preview loading and clears the previous result', () => {
    const state = importExportReducer(
      { ...initialState, previewResult },
      importExportActions.previewImport({
        payload: { entityType: 'ship', file: new File([], 'ships.zip'), requestId: 'preview-1' },
      }),
    );

    expect(state.loading).toBe(true);
    expect(state.previewResult).toBeNull();
  });

  it('stores a successful preview', () => {
    const state = importExportReducer(
      initialState,
      importExportActions.previewImportSuccess({ entityType: 'ship', requestId: 'preview-1', result: previewResult }),
    );

    expect(state.loading).toBe(false);
    expect(state.previewResult).toEqual(previewResult);
  });

  it('stores a preview error and finishes loading', () => {
    const state = importExportReducer(
      initialState,
      importExportActions.previewImportError({ entityType: 'ship', requestId: 'preview-1', errorMessage: 'boom' }),
    );

    expect(state.loading).toBe(false);
    expect(state.errorMessage).toBe('boom');
  });

  it('stores a successful confirmation', () => {
    const result: ImportConfirmResult = { created: ['row-1'], updated: [], failed: [] };
    const state = importExportReducer(
      initialState,
      importExportActions.confirmImportSuccess({ entityType: 'ship', requestId: 'confirm-1', result }),
    );

    expect(state.confirmResult).toEqual(result);
  });
});
