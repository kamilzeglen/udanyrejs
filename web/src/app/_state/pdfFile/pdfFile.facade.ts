import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@state';
import * as pdfFileActions from './pdfFile.actions';
import * as pdfFileSelectors from './pdfFile.selectors';

@Injectable()
export class PdfFileFacade {
  public pdfFile$ = this.store.select(pdfFileSelectors.selectPdfFile);

  public createPdfFileSuccess$ = this.actions.pipe(ofType(pdfFileActions.createPdfFileSuccess));
  public createPdfFileError$ = this.actions.pipe(ofType(pdfFileActions.createPdfFileError));

  public updatePdfFileSuccess$ = this.actions.pipe(ofType(pdfFileActions.updatePdfFileSuccess));
  public updatePdfFileError$ = this.actions.pipe(ofType(pdfFileActions.updatePdfFileError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions,
  ) {}

  public createPdfFile(payload: { pdfFileType: string; targetId: string; pdfUrl?: string; file?: FormData }): void {
    this.store.dispatch(pdfFileActions.createPdfFile({ payload }));
  }

  public updatePdfFile(payload: { pdfFileType: string; targetId: string; pdfUrl?: string; file?: FormData }): void {
    this.store.dispatch(pdfFileActions.updatePdfFile({ payload }));
  }

  public downloadPdfFile(payload: { pdfFileId: string }): void {
    this.store.dispatch(pdfFileActions.downloadPdfFile({ payload }));
  }
}
