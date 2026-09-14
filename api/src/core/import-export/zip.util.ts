import * as AdmZip from 'adm-zip';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import { ZIP_MAX_BYTES } from '@core/files/file-validation.util';

export interface ZipEntry {
  name: string;
  data: Buffer;
}

function validateEntryName(name: string): void {
  if (
    name.startsWith('/') ||
    name.includes('\\') ||
    name.includes(':') ||
    name.includes('\0') ||
    name.split('/').includes('..')
  ) {
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
}

export function readZip(buffer: Buffer): ZipEntry[] {
  if (buffer.length > ZIP_MAX_BYTES) {
    throw new AppException(API_ERRORS.IMPORT_FILE_TOO_LARGE);
  }
  try {
    const entries = new AdmZip(buffer)
      .getEntries()
      .filter((entry) => entry.isDirectory === false);
    if (entries.length === 0 || entries.length > 10000) {
      throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
    }
    const names = new Set<string>();
    let totalBytes = 0;
    for (const entry of entries) {
      validateEntryName(entry.entryName);
      totalBytes += entry.header.size;
      if (totalBytes > ZIP_MAX_BYTES) {
        throw new AppException(API_ERRORS.IMPORT_FILE_TOO_LARGE);
      }
      if (names.has(entry.entryName)) {
        throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
      }
      names.add(entry.entryName);
    }
    return entries.map((entry) => ({
      name: entry.entryName,
      data: entry.getData(),
    }));
  } catch (error) {
    if (error instanceof AppException) {
      throw error;
    }
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
}

export function buildZip(
  files: { name: string; data: Buffer | string }[],
): Buffer {
  const zip = new AdmZip();
  let totalBytes = 0;
  for (const file of files) {
    validateEntryName(file.name);
    const data =
      typeof file.data === 'string'
        ? Buffer.from(file.data, 'utf-8')
        : file.data;
    totalBytes += data.length;
    if (totalBytes > ZIP_MAX_BYTES) {
      throw new AppException(API_ERRORS.IMPORT_FILE_TOO_LARGE);
    }
    zip.addFile(file.name, data);
  }
  return zip.toBuffer();
}
