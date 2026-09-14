export type ImportEntityType = 'offer' | 'ship' | 'company' | 'category' | 'destination' | 'city' | 'cabinType';

export type ImportRowAction = 'create' | 'update' | 'error';

export interface ImportRowResult {
  rowRef: string;
  action: ImportRowAction;
  label: string;
  errors: string[];
}

export interface ImportPreviewResult {
  toCreate: number;
  toUpdate: number;
  errors: number;
  rows: ImportRowResult[];
}

export interface ImportConfirmResult {
  created: string[];
  updated: string[];
  failed: { rowRef: string; error: string }[];
}
