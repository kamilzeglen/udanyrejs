import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ImportExportState } from './import-export.state';

export const selectImportExportState = createFeatureSelector<ImportExportState>('importExport');
export const selectLoading = createSelector(selectImportExportState, (state) => state.loading);
