import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {AppState} from '@state';
import * as imageFileActions from './imageFile.actions';
import * as imageFileSelectors from './imageFile.selectors';


@Injectable()
export class ImageFileFacade {
  public imageFile$ = this.store.select(imageFileSelectors.selectImageFile);

  public createImageFileSuccess$ = this.actions.pipe(ofType(imageFileActions.createImageFileSuccess));
  public createImageFileError$ = this.actions.pipe(ofType(imageFileActions.createImageFileError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions
  ) {
  }

  public createImageFile(payload: { imageFileType: string, targetId: string, formData: FormData }): void {
    this.store.dispatch(imageFileActions.createImageFile({payload}));
  }
}
