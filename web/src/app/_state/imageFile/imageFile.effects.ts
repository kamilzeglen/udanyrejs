import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import * as imageFileActions from '@state/imageFile/imageFile.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ImageFileHttpService } from '@core/_http/imageFile.http.service';

@Injectable()
export class ImageFileEffects {
  constructor(
    private actions$: Actions,
    private http: ImageFileHttpService,
  ) {}

  createImageFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(imageFileActions.createImageFile),
      switchMap(({ payload }) => {
        return this.http.createImageFile(payload).pipe(
          map((imageFile) => {
            return imageFileActions.createImageFileSuccess({ imageFile });
          }),
          catchError((errorMessage) => {
            return of(imageFileActions.createImageFileError({ errorMessage }));
          }),
        );
      }),
    ),
  );

  updateImageFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(imageFileActions.updateImageFile),
      switchMap(({ payload }) => {
        return this.http.updateImageFile(payload).pipe(
          map((imageFile) => {
            return imageFileActions.updateImageFileSuccess({ imageFile });
          }),
          catchError((errorMessage) => {
            return of(imageFileActions.updateImageFileError({ errorMessage }));
          }),
        );
      }),
    ),
  );
}
