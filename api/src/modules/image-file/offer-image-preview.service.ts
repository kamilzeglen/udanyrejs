import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IMAGE_MAX_BYTES } from '@core/files/file-validation.util';
import { createHash } from 'crypto';
import { lstat, open } from 'fs/promises';
import { join } from 'path';
import * as sharp from 'sharp';

interface OfferImagePreview {
  buffer: Buffer;
  etag: string;
}

@Injectable()
export class OfferImagePreviewService {
  private readonly cache = new Map<string, OfferImagePreview>();
  private readonly pending = new Map<string, Promise<OfferImagePreview>>();
  private readonly maxCacheBytes = 32 * 1024 * 1024;
  private readonly maxCacheEntries = 100;
  private readonly maxConcurrentTransforms = 2;
  private cacheBytes = 0;

  async getPreview(
    filename: string,
    width: unknown,
  ): Promise<OfferImagePreview> {
    if (
      typeof filename !== 'string' ||
      filename.length > 200 ||
      /^[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|gif)$/i.test(filename) === false
    ) {
      throw new BadRequestException('Invalid offer image filename');
    }

    if (
      typeof width !== 'string' ||
      ['480', '960', '1440'].includes(width) === false
    ) {
      throw new BadRequestException('Image width must be 480, 960 or 1440');
    }

    const directory = process.env.OFFERS_IMAGES_PATH;
    if (typeof directory !== 'string' || directory.length === 0) {
      throw new ServiceUnavailableException('Offer images are unavailable');
    }

    const filePath = join(directory, filename);
    const source = await lstat(filePath).catch(() => {
      throw new NotFoundException('Offer image not found');
    });
    if (source.isFile() === false) {
      throw new NotFoundException('Offer image not found');
    }
    if (source.size > IMAGE_MAX_BYTES) {
      throw new PayloadTooLargeException('Offer image is too large');
    }

    const key = JSON.stringify([
      filePath,
      width,
      source.mtimeMs,
      source.ctimeMs,
      source.size,
    ]);
    const cached = this.cache.get(key);
    if (cached) {
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }

    const pending = this.pending.get(key);
    if (pending) {
      return pending;
    }

    if (this.pending.size >= this.maxConcurrentTransforms) {
      throw new ServiceUnavailableException('Offer image previews are busy');
    }

    const generated = this.generatePreview(
      filePath,
      Number(width),
      source.size,
    );
    this.pending.set(key, generated);
    try {
      const preview = await generated;
      this.cachePreview(key, preview);
      return preview;
    } finally {
      this.pending.delete(key);
    }
  }

  private async generatePreview(
    filePath: string,
    width: number,
    sourceSize: number,
  ): Promise<OfferImagePreview> {
    const file = await open(filePath, 'r').catch(() => {
      throw new NotFoundException('Offer image not found');
    });
    let input: Buffer;
    try {
      const buffer = Buffer.alloc(sourceSize + 1);
      let totalBytes = 0;
      while (totalBytes < buffer.length) {
        const { bytesRead } = await file.read(
          buffer,
          totalBytes,
          buffer.length - totalBytes,
          totalBytes,
        );
        if (bytesRead === 0) {
          break;
        }
        totalBytes += bytesRead;
      }
      if (totalBytes > sourceSize) {
        throw new ServiceUnavailableException(
          'Offer image changed during preview generation',
        );
      }
      input = buffer.subarray(0, totalBytes);
    } finally {
      await file.close();
    }

    const buffer = await sharp(input, { limitInputPixels: 40_000_000 })
      .autoOrient()
      .resize({ width, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer()
      .catch(() => {
        throw new BadRequestException('Offer image cannot be converted');
      });
    return {
      buffer,
      etag: `"${createHash('sha256').update(buffer).digest('hex')}"`,
    };
  }

  private cachePreview(key: string, preview: OfferImagePreview): void {
    if (preview.buffer.length > this.maxCacheBytes) {
      return;
    }

    while (
      this.cache.size >= this.maxCacheEntries ||
      this.cacheBytes + preview.buffer.length > this.maxCacheBytes
    ) {
      const oldestKey = this.cache.keys().next().value;
      this.cacheBytes -= this.cache.get(oldestKey).buffer.length;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, preview);
    this.cacheBytes += preview.buffer.length;
  }
}
