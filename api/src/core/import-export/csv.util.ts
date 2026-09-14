import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import { CSV_MAX_BYTES } from '@core/files/file-validation.util';

export function parseCsv(buffer: Buffer): Record<string, string>[] {
  if (buffer.length > CSV_MAX_BYTES) {
    throw new AppException(API_ERRORS.IMPORT_FILE_TOO_LARGE);
  }
  if (buffer.length === 0 || buffer.includes(0)) {
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
  try {
    return parse(buffer, {
      bom: true,
      columns: (headers: string[]) => {
        if (
          headers.some((header) => header.length === 0) ||
          new Set(headers).size !== headers.length
        ) {
          throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
        }
        return headers;
      },
      skip_empty_lines: true,
      trim: true,
    });
  } catch {
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
}

export function stringifyCsv(
  rows: Record<string, unknown>[],
  columns: string[],
): string {
  return stringify(rows, { header: true, columns });
}

export function parseBooleanColumn(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined || value === null || value.trim() === '') {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
}
