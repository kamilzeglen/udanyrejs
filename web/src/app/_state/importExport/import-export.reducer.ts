import { Action, createReducer, on } from '@ngrx/store';
import * as importExportActions from './import-export.actions';
import { ImportExportState, initialState } from './import-export.state';

const reducer = createReducer(
  initialState,
  on(importExportActions.previewImport, (state) => ({
    ...state,
    loading: true,
    previewResult: null,
    errorMessage: null,
  })),
  on(importExportActions.previewImportSuccess, (state, { result }) => ({
    ...state,
    loading: false,
    previewResult: result,
    errorMessage: null,
  })),
  on(importExportActions.previewImportError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    previewResult: null,
    errorMessage,
  })),
  on(importExportActions.confirmImport, (state) => ({
    ...state,
    loading: true,
    confirmResult: null,
    errorMessage: null,
  })),
  on(importExportActions.confirmImportSuccess, (state, { result }) => ({
    ...state,
    loading: false,
    confirmResult: result,
    errorMessage: null,
  })),
  on(importExportActions.confirmImportError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    confirmResult: null,
    errorMessage,
  })),
  on(importExportActions.exportEntities, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
  })),
  on(importExportActions.exportEntitiesSuccess, (state) => ({
    ...state,
    loading: false,
    errorMessage: null,
  })),
  on(importExportActions.exportEntitiesError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
  })),
);

export function importExportReducer(state: ImportExportState | undefined, action: Action): ImportExportState {
  return reducer(state, action);
}
