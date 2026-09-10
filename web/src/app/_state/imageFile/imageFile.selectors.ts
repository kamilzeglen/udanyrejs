import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ImageFileState } from './imageFile.state';

export const selectImageFileState = createFeatureSelector<ImageFileState>('imageFile');

export const selectImageFile = createSelector(selectImageFileState, (state) => state.imageFile);
