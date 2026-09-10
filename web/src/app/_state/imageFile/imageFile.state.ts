import { ImageFile } from '../../_interfaces/file';

export type ImageFileState = Readonly<{
  imageFile: ImageFile;
  loading: boolean;
  errorMessage: string;
}>;

export const initialState: ImageFileState = {
  imageFile: null,
  loading: false,
  errorMessage: null,
};
