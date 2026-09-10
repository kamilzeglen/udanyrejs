import { ImageFile } from '../../_interfaces/file';

export type PdfFileState = Readonly<{
  pdfFile: ImageFile;
  loading: boolean;
  errorMessage: string;
}>;

export const initialState: PdfFileState = {
  pdfFile: null,
  loading: false,
  errorMessage: null,
};
