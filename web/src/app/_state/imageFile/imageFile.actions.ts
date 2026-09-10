import { createAction, props } from '@ngrx/store';
import { ImageFile } from '../../_interfaces/file';

export const createImageFile = createAction(
  '[ImageFile] Create Image File',
  props<{ payload: { imageFileType: string; targetId: string; imageUrl?: string; file?: FormData } }>(),
);
export const createImageFileSuccess = createAction(
  '[ImageFile] Create Image File Success',
  props<{ imageFile: ImageFile }>(),
);
export const createImageFileError = createAction(
  '[ImageFile] Create Image File Error',
  props<{ errorMessage: string }>(),
);

export const updateImageFile = createAction(
  '[ImageFile] Update Image File',
  props<{ payload: { imageFileType: string; targetId: string; pdfUrl?: string; file?: FormData } }>(),
);
export const updateImageFileSuccess = createAction(
  '[ImageFile] Update Image File Success',
  props<{ imageFile: ImageFile }>(),
);
export const updateImageFileError = createAction(
  '[ImageFile] Update Image File Error',
  props<{ errorMessage: string }>(),
);
