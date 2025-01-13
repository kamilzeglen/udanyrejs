import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import * as pdfFileActions from '@state/pdfFile/pdfFile.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {PdfFileHttpService} from '@core/_http/pdfFile.http.service';

@Injectable()
export class PdfFileEffects {
  constructor(
    private actions$: Actions,
    private http: PdfFileHttpService,
  ) {
  }

  createImageFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(pdfFileActions.createPdfFile),
      switchMap(({payload}) => {
        return this.http.createPdfFile(payload).pipe(
          map((pdfFile) => {
            return pdfFileActions.createPdfFileSuccess({pdfFile});
          }),
          catchError(errorMessage => {
            return of(pdfFileActions.createPdfFileError({errorMessage}));
          })
        );
      })
    )
  )

  updateImageFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(pdfFileActions.updatePdfFile),
      switchMap(({payload}) => {
        return this.http.updatePdfFile(payload).pipe(
          map((pdfFile) => {
            return pdfFileActions.updatePdfFileSuccess({pdfFile});
          }),
          catchError(errorMessage => {
            return of(pdfFileActions.updatePdfFileError({errorMessage}));
          })
        );
      })
    )
  )

}
