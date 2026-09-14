import { inject, Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ImportEntityType } from '@interfaces';
import { AppState } from '@state';
import * as importExportActions from './import-export.actions';
import * as importExportSelectors from './import-export.selectors';

@Injectable()
export class ImportExportFacade {
  private readonly store = inject(Store<AppState>);
  private readonly actions = inject(Actions);

  public readonly loading$ = this.store.select(importExportSelectors.selectLoading);

  public readonly previewImport$ = this.actions.pipe(ofType(importExportActions.previewImport));
  public readonly previewImportSuccess$ = this.actions.pipe(ofType(importExportActions.previewImportSuccess));
  public readonly previewImportError$ = this.actions.pipe(ofType(importExportActions.previewImportError));
  public readonly confirmImport$ = this.actions.pipe(ofType(importExportActions.confirmImport));
  public readonly confirmImportSuccess$ = this.actions.pipe(ofType(importExportActions.confirmImportSuccess));
  public readonly confirmImportError$ = this.actions.pipe(ofType(importExportActions.confirmImportError));
  public readonly exportEntities$ = this.actions.pipe(ofType(importExportActions.exportEntities));
  public readonly exportEntitiesSuccess$ = this.actions.pipe(ofType(importExportActions.exportEntitiesSuccess));
  public readonly exportEntitiesError$ = this.actions.pipe(ofType(importExportActions.exportEntitiesError));

  public previewImport(payload: { entityType: ImportEntityType; file: File; requestId: string }): void {
    this.store.dispatch(importExportActions.previewImport({ payload }));
  }

  public confirmImport(payload: { entityType: ImportEntityType; file: File; requestId: string }): void {
    this.store.dispatch(importExportActions.confirmImport({ payload }));
  }

  public exportEntities(payload: { entityType: ImportEntityType; ids?: string[] }): void {
    this.store.dispatch(importExportActions.exportEntities({ payload }));
  }
}
