import {initialState, ImageFileState} from './imageFile.state';
import {Action, createReducer, on} from '@ngrx/store';
import * as imageFileActions from '@state/imageFile/imageFile.actions';


const reducer = createReducer(
  initialState,

  on(imageFileActions.createImageFile, state => ({
    ...state,
    loading: true,
    errorMessage: null,
    imageFile: null,
  })),
  on(imageFileActions.createImageFileSuccess, (state, {imageFile}) => ({
    ...state,
    loading: false,
    errorMessage: null,
    imageFile
  })),
  on(imageFileActions.createImageFileError, (state, {errorMessage}) => ({
    ...state,
    loading: false,
    errorMessage,
    imageFile: null,
  })),
)

export function imageFileReducer(state: ImageFileState | undefined, action: Action): ImageFileState {
  return reducer(state, action);
}
