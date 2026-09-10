import { initialState, PdfFileState } from './pdfFile.state';
import { Action, createReducer, on } from '@ngrx/store';
import * as pdfFileActions from '@state/pdfFile/pdfFile.actions';

const reducer = createReducer(
  initialState,

  on(pdfFileActions.createPdfFile, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
    pdfFile: null,
  })),
  on(pdfFileActions.createPdfFileSuccess, (state, { pdfFile }) => ({
    ...state,
    loading: false,
    errorMessage: null,
    pdfFile,
  })),
  on(pdfFileActions.createPdfFileError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
    pdfFile: null,
  })),
);

export function pdfFileReducer(state: PdfFileState | undefined, action: Action): PdfFileState {
  return reducer(state, action);
}
