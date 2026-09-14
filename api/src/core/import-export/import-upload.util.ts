import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';
import { isUUID } from 'class-validator';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import {
  ALLOWED_CSV_MIME_TYPES,
  ALLOWED_ZIP_MIME_TYPES,
  CSV_MAX_BYTES,
  ZIP_MAX_BYTES,
} from '@core/files/file-validation.util';

function uploadOptions(mimeTypes: string[], maxBytes: number): MulterOptions {
  return {
    storage: memoryStorage(),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_request, file, callback) => {
      if (mimeTypes.includes(file.mimetype)) {
        callback(null, true);
        return;
      }
      callback(new AppException(API_ERRORS.IMPORT_FILE_INVALID), false);
    },
  };
}

export const csvUploadOptions = uploadOptions(
  ALLOWED_CSV_MIME_TYPES,
  CSV_MAX_BYTES,
);
export const zipUploadOptions = uploadOptions(
  ALLOWED_ZIP_MIME_TYPES,
  ZIP_MAX_BYTES,
);

export function requireImportFile(
  file: Express.Multer.File | undefined,
): Buffer {
  if (
    file === undefined ||
    Buffer.isBuffer(file.buffer) === false ||
    file.buffer.length === 0
  ) {
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
  return file.buffer;
}

export function parseExportIds(value?: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
  const ids = value.split(',').map((id) => id.trim());
  if (ids.length > 10000 || ids.some((id) => isUUID(id) === false)) {
    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }
  return [...new Set(ids)];
}
