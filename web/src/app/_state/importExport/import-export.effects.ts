import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ImportExportHttpService } from '@core/_http/import-export.http.service';
import { catchError, map, of, switchMap } from 'rxjs';
import * as importExportActions from './import-export.actions';

@Injectable()
export class ImportExportEffects {
  private readonly actions = inject(Actions);
  private readonly http = inject(ImportExportHttpService);

  public readonly previewImport$ = createEffect(() =>
    this.actions.pipe(
      ofType(importExportActions.previewImport),
      switchMap(({ payload }) =>
        this.http.previewImport(payload.entityType, payload.file).pipe(
          map((result) =>
            importExportActions.previewImportSuccess({
              entityType: payload.entityType,
              requestId: payload.requestId,
              result,
            }),
          ),
          catchError((error: unknown) =>
            of(
              importExportActions.previewImportError({
                entityType: payload.entityType,
                requestId: payload.requestId,
                errorMessage: this.toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  public readonly confirmImport$ = createEffect(() =>
    this.actions.pipe(
      ofType(importExportActions.confirmImport),
      switchMap(({ payload }) =>
        this.http.confirmImport(payload.entityType, payload.file).pipe(
          map((result) =>
            importExportActions.confirmImportSuccess({
              entityType: payload.entityType,
              requestId: payload.requestId,
              result,
            }),
          ),
          catchError((error: unknown) =>
            of(
              importExportActions.confirmImportError({
                entityType: payload.entityType,
                requestId: payload.requestId,
                errorMessage: this.toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  public readonly exportEntities$ = createEffect(() =>
    this.actions.pipe(
      ofType(importExportActions.exportEntities),
      switchMap(({ payload }) =>
        this.http.exportEntities(payload.entityType, payload.ids).pipe(
          map(({ blob, filename }) =>
            importExportActions.exportEntitiesSuccess({ entityType: payload.entityType, blob, filename }),
          ),
          catchError((error: unknown) =>
            of(
              importExportActions.exportEntitiesError({
                entityType: payload.entityType,
                errorMessage: this.toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  private toErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (typeof error !== 'object' || error === null) {
      return 'Nieznany błąd';
    }

    const typedError = error as { message?: string; error?: { message?: string } };
    return typedError.error?.message ?? typedError.message ?? 'Nieznany błąd';
  }
}
