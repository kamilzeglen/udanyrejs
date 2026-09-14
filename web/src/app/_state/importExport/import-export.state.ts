import { ImportConfirmResult, ImportPreviewResult } from '@interfaces';

export type ImportExportState = Readonly<{
  loading: boolean;
  previewResult: ImportPreviewResult;
  confirmResult: ImportConfirmResult;
  errorMessage: string;
}>;

export const initialState: ImportExportState = {
  loading: false,
  previewResult: null,
  confirmResult: null,
  errorMessage: null,
};
