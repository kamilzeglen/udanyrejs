import { isUUID } from 'class-validator';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import {
  detectImageExtension,
  IMAGE_MAX_BYTES,
} from '@core/files/file-validation.util';
import { parseBooleanColumn, parseCsv } from './csv.util';
import { ZipEntry } from './zip.util';

export function archiveCsvRows(entries: ZipEntry[]): Record<string, string>[] {
  const dataEntry = entries.find((entry) => entry.name === 'data.csv');
  if (dataEntry === undefined) {
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
  return parseCsv(dataEntry.data);
}

export function resolveArchiveImage(
  name: string | undefined,
  entries: ZipEntry[],
  errors: string[],
): ZipEntry | undefined {
  if (name === undefined || name === '') {
    return undefined;
  }
  const entry = entries.find((file) => file.name === name);
  if (entry === undefined) {
    errors.push(`Nie znaleziono pliku obrazu '${name}' w archiwum`);
    return undefined;
  }
  if (
    name.startsWith('images/') === false ||
    detectImageExtension(entry.data) === null
  ) {
    errors.push(`Nieprawidłowy plik obrazu '${name}'`);
    return undefined;
  }
  if (entry.data.length > IMAGE_MAX_BYTES) {
    errors.push(`Plik obrazu '${name}' przekracza limit rozmiaru`);
    return undefined;
  }
  return entry;
}

export async function resolveImportId<T extends { id: string }>(
  value: string | undefined,
  findById: (id: string) => Promise<T | null>,
  errors: string[],
): Promise<string | undefined> {
  const id = value?.trim();
  if (id === undefined || id === '') {
    return undefined;
  }
  if (isUUID(id) === false) {
    errors.push('Nieprawidłowy identyfikator UUID');
    return undefined;
  }
  const existing = await findById(id);
  if (existing === null || existing === undefined) {
    errors.push('Rekord o podanym id nie istnieje');
    return undefined;
  }
  return existing.id;
}

export function rowActiveState(
  value: string | undefined,
  errors: string[],
): boolean {
  try {
    return parseBooleanColumn(value, true);
  } catch {
    errors.push('Nieprawidłowe pole isActive: użyj true lub false');
    return true;
  }
}

export function assertActivationSucceeded(result: {
  updatedIds: string[];
  failedIds: string[];
}): void {
  if (result.failedIds.length > 0 || result.updatedIds.length === 0) {
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
}
