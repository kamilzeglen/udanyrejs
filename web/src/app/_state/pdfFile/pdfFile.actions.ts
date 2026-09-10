import { createAction, props } from '@ngrx/store';
import { PdfFile } from '../../_interfaces/file';

export const createPdfFile = createAction(
  '[PdfFile] Create Pdf File',
  props<{ payload: { pdfFileType: string; targetId: string; pdfUrl?: string; file?: FormData } }>(),
);
export const createPdfFileSuccess = createAction('[PdfFile] Create Image Pdf Success', props<{ pdfFile: PdfFile }>());
export const createPdfFileError = createAction('[PdfFile] Create Pdf File Error', props<{ errorMessage: string }>());

export const updatePdfFile = createAction(
  '[PdfFile] Update Pdf File',
  props<{ payload: { pdfFileType: string; targetId: string; pdfUrl?: string; file?: FormData } }>(),
);
export const updatePdfFileSuccess = createAction('[PdfFile] Update Image Pdf Success', props<{ pdfFile: PdfFile }>());
export const updatePdfFileError = createAction('[PdfFile] Update Pdf File Error', props<{ errorMessage: string }>());

export const downloadPdfFile = createAction('[PdfFile] Download Pdf File', props<{ payload: { pdfFileId: string } }>());
export const downloadPdfFileSuccess = createAction('[PdfFile] Download Image Pdf Success');
export const downloadPdfFileError = createAction(
  '[PdfFile] Download Pdf File Error',
  props<{ errorMessage: string }>(),
);
