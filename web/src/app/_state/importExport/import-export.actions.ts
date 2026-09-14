import { createAction, props } from '@ngrx/store';
import { ImportConfirmResult, ImportEntityType, ImportPreviewResult } from '@interfaces';

export interface CorrelatedImportPayload {
  entityType: ImportEntityType;
  file: File;
  requestId: string;
}

export const previewImport = createAction(
  '[ImportExport] Preview Import',
  props<{ payload: CorrelatedImportPayload }>(),
);
export const previewImportSuccess = createAction(
  '[ImportExport] Preview Import Success',
  props<{ entityType: ImportEntityType; requestId: string; result: ImportPreviewResult }>(),
);
export const previewImportError = createAction(
  '[ImportExport] Preview Import Error',
  props<{ entityType: ImportEntityType; requestId: string; errorMessage: string }>(),
);

export const confirmImport = createAction(
  '[ImportExport] Confirm Import',
  props<{ payload: CorrelatedImportPayload }>(),
);
export const confirmImportSuccess = createAction(
  '[ImportExport] Confirm Import Success',
  props<{ entityType: ImportEntityType; requestId: string; result: ImportConfirmResult }>(),
);
export const confirmImportError = createAction(
  '[ImportExport] Confirm Import Error',
  props<{ entityType: ImportEntityType; requestId: string; errorMessage: string }>(),
);

export const exportEntities = createAction(
  '[ImportExport] Export Entities',
  props<{ payload: { entityType: ImportEntityType; ids?: string[] } }>(),
);
export const exportEntitiesSuccess = createAction(
  '[ImportExport] Export Entities Success',
  props<{ entityType: ImportEntityType; blob: Blob; filename: string }>(),
);
export const exportEntitiesError = createAction(
  '[ImportExport] Export Entities Error',
  props<{ entityType: ImportEntityType; errorMessage: string }>(),
);
