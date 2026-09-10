import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PdfFileState } from './pdfFile.state';

export const selectPdfFileState = createFeatureSelector<PdfFileState>('pdfFile');

export const selectPdfFile = createSelector(selectPdfFileState, (state) => state.pdfFile);
