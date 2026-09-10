import { HttpStatus } from '@nestjs/common';

export interface ApiErrorDefinition {
  key: string;
  status: HttpStatus;
  message: string;
}

function defineError(
  key: string,
  status: HttpStatus,
  message: string,
): ApiErrorDefinition {
  return { key, status, message };
}

export const API_ERRORS = {
  UNAUTHORIZED: defineError(
    'UNAUTHORIZED',
    HttpStatus.UNAUTHORIZED,
    'Unauthorized',
  ),
  USER_ALREADY_EXISTS: defineError(
    'USER_ALREADY_EXISTS',
    HttpStatus.NOT_ACCEPTABLE,
    'User already exists',
  ),
  PASSWORD_REQUIRED: defineError(
    'PASSWORD_REQUIRED',
    HttpStatus.NOT_ACCEPTABLE,
    'Password is required',
  ),
  USER_NOT_EXIST: defineError(
    'USER_NOT_EXIST',
    HttpStatus.UNAUTHORIZED,
    'User does not exist',
  ),
  PASSWORD_NOT_MATCH: defineError(
    'PASSWORD_NOT_MATCH',
    HttpStatus.UNAUTHORIZED,
    'Password does not match',
  ),
  USER_IS_NOT_ACTIVE: defineError(
    'USER_IS_NOT_ACTIVE',
    HttpStatus.UNAUTHORIZED,
    'User is not active',
  ),
  TOKEN_GENERATION_FAILED: defineError(
    'TOKEN_GENERATION_FAILED',
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Failed to generate security token',
  ),
  REFRESH_TOKEN_INVALID: defineError(
    'REFRESH_TOKEN_INVALID',
    HttpStatus.UNAUTHORIZED,
    'Refresh token is missing, invalid or expired',
  ),

  OFFER_NOT_FOUND: defineError(
    'OFFER_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Offer not found',
  ),
  OFFER_DUPLICATE: defineError(
    'OFFER_DUPLICATE',
    HttpStatus.BAD_REQUEST,
    'An offer with this company, ship and dates already exists',
  ),
  CABIN_TYPE_NOT_FOUND: defineError(
    'CABIN_TYPE_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Cabin type not found',
  ),
  OFFER_TERM_DUPLICATE: defineError(
    'OFFER_TERM_DUPLICATE',
    HttpStatus.BAD_REQUEST,
    'This offer already has a term with the same dates',
  ),

  COMPANY_NOT_FOUND: defineError(
    'COMPANY_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Company not found',
  ),
  SHIP_NOT_FOUND: defineError(
    'SHIP_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Ship not found',
  ),
  CATEGORY_NOT_FOUND: defineError(
    'CATEGORY_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Category not found',
  ),
  DESTINATION_NOT_FOUND: defineError(
    'DESTINATION_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Destination not found',
  ),

  OFFER_OR_SHARE_STATS_NOT_FOUND: defineError(
    'OFFER_OR_SHARE_STATS_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Offer or its share statistics not found',
  ),
  SHARE_STATS_NOT_FOUND: defineError(
    'SHARE_STATS_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Share statistics not found',
  ),
  SHARE_STATS_UNSUPPORTED_PLATFORM: defineError(
    'SHARE_STATS_UNSUPPORTED_PLATFORM',
    HttpStatus.BAD_REQUEST,
    'Unsupported platform',
  ),

  FILE_NOT_PROVIDED: defineError(
    'FILE_NOT_PROVIDED',
    HttpStatus.BAD_REQUEST,
    'No file was provided. Upload a file or supply a URL.',
  ),
  FILE_TOO_LARGE_IMAGE: defineError(
    'FILE_TOO_LARGE_IMAGE',
    HttpStatus.BAD_REQUEST,
    'Image file is too large',
  ),
  FILE_TOO_LARGE_PDF: defineError(
    'FILE_TOO_LARGE_PDF',
    HttpStatus.BAD_REQUEST,
    'PDF file is too large',
  ),
  UNSUPPORTED_IMAGE_TYPE: defineError(
    'UNSUPPORTED_IMAGE_TYPE',
    HttpStatus.BAD_REQUEST,
    'File content does not match a supported image type (jpg, png, webp)',
  ),
  UNSUPPORTED_PDF_TYPE: defineError(
    'UNSUPPORTED_PDF_TYPE',
    HttpStatus.BAD_REQUEST,
    'File content does not match a supported PDF type',
  ),
  FILE_PATH_MISSING: defineError(
    'FILE_PATH_MISSING',
    HttpStatus.INTERNAL_SERVER_ERROR,
    'File path not found',
  ),
  FILE_DELETE_FAILED: defineError(
    'FILE_DELETE_FAILED',
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Failed to delete the physical file',
  ),
  FILE_NOT_FOUND: defineError(
    'FILE_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'File not found',
  ),
  FILE_DOWNLOAD_FAILED: defineError(
    'FILE_DOWNLOAD_FAILED',
    HttpStatus.BAD_REQUEST,
    'Failed to download the file from the provided URL',
  ),

  LOG_AUTHOR_MISSING: defineError(
    'LOG_AUTHOR_MISSING',
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Missing user for audit log entry',
  ),
  LOG_WRITE_FAILED: defineError(
    'LOG_WRITE_FAILED',
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Failed to write audit log entry',
  ),
} as const;

export type ApiErrorKey = keyof typeof API_ERRORS;
