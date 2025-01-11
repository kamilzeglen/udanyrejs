import {createAction, props} from '@ngrx/store';
import {ImageFile} from '../../_interfaces/file';

export const createImageFile = createAction('[ImageFile] Create Image File' ,props<{ payload: { imageFileType: string, targetId: string, formData: FormData } }>());
export const createImageFileSuccess = createAction('[ImageFile] Create Image File Success', props<{ imageFile: ImageFile }>());
export const createImageFileError = createAction('[ImageFile] Create Image File Error', props<{ errorMessage: string }>());
