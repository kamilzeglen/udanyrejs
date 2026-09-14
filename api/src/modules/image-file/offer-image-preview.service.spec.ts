import {
  BadRequestException,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { copyFile, mkdtemp, rm, utimes, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import * as sharp from 'sharp';
import { OfferImagePreviewService } from './offer-image-preview.service';

describe('OfferImagePreviewService', () => {
  let directory: string;
  let service: OfferImagePreviewService;
  const originalDirectory = process.env.OFFERS_IMAGES_PATH;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'offer-preview-'));
    process.env.OFFERS_IMAGES_PATH = directory;
    service = new OfferImagePreviewService();
    await sharp({
      create: { width: 1800, height: 1200, channels: 3, background: '#247cab' },
    })
      .jpeg()
      .toFile(join(directory, 'offer.jpg'));
  });

  afterEach(async () => {
    if (originalDirectory === undefined) {
      delete process.env.OFFERS_IMAGES_PATH;
    }
    if (originalDirectory !== undefined) {
      process.env.OFFERS_IMAGES_PATH = originalDirectory;
    }
    await rm(directory, { recursive: true, force: true });
  });

  it.each([
    [480, 320],
    [960, 640],
    [1440, 960],
  ])(
    'generates a WebP at width %s preserving proportions',
    async (width, height) => {
      const preview = await service.getPreview('offer.jpg', String(width));
      expect(await sharp(preview.buffer).metadata()).toMatchObject({
        format: 'webp',
        width,
        height,
      });
      expect(preview.etag).toMatch(/^"[a-f0-9]+"$/);
    },
  );

  it('does not enlarge small originals', async () => {
    await sharp({
      create: { width: 160, height: 100, channels: 3, background: '#247cab' },
    })
      .png()
      .toFile(join(directory, 'small.png'));
    const preview = await service.getPreview('small.png', '480');
    expect(await sharp(preview.buffer).metadata()).toMatchObject({
      width: 160,
      height: 100,
    });
  });

  it('applies EXIF orientation before resizing', async () => {
    await sharp({
      create: { width: 1200, height: 600, channels: 3, background: '#247cab' },
    })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toFile(join(directory, 'rotated.jpg'));
    const preview = await service.getPreview('rotated.jpg', '480');
    expect(await sharp(preview.buffer).metadata()).toMatchObject({
      width: 480,
      height: 960,
    });
  });

  it('reuses the generated result across parallel and later requests', async () => {
    const previews = await Promise.all(
      Array.from({ length: 8 }, () => service.getPreview('offer.jpg', '480')),
    );
    for (const preview of previews) {
      expect(preview).toBe(previews[0]);
    }
    expect(await service.getPreview('offer.jpg', '480')).toBe(previews[0]);
  });

  it('regenerates a preview after an existing original is overwritten', async () => {
    const original = await service.getPreview('offer.jpg', '480');
    await sharp({
      create: { width: 900, height: 900, channels: 3, background: '#c03424' },
    })
      .jpeg()
      .toFile(join(directory, 'offer.jpg'));
    const changedTime = new Date(Date.now() + 5000);
    await utimes(join(directory, 'offer.jpg'), changedTime, changedTime);
    const changed = await service.getPreview('offer.jpg', '480');
    expect(changed.etag).not.toBe(original.etag);
    expect(await sharp(changed.buffer).metadata()).toMatchObject({
      width: 480,
      height: 480,
    });
  });

  it.each([
    '../offer.jpg',
    '..\\offer.jpg',
    '/offer.jpg',
    'C:offer.jpg',
    'offer.svg',
    'offer.jpg/extra',
    'offer%2f.jpg',
    'offer.jpg\0',
  ])('rejects unsafe filename %s', async (filename) => {
    await expect(service.getPreview(filename, '480')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it.each(['0', '-480', '481', '480px', '', undefined, ['480', '960']])(
    'rejects invalid width %s',
    async (width) => {
      await expect(
        service.getPreview('offer.jpg', width),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('returns a recoverable 404 for missing originals', async () => {
    await expect(
      service.getPreview('missing.jpg', '480'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects originals larger than the upload byte limit', async () => {
    await writeFile(
      join(directory, 'large.jpg'),
      Buffer.alloc(10 * 1024 * 1024 + 1),
    );
    await expect(service.getPreview('large.jpg', '480')).rejects.toBeInstanceOf(
      PayloadTooLargeException,
    );
  });

  it('returns a recoverable error for invalid image content', async () => {
    await writeFile(join(directory, 'invalid.jpg'), 'invalid image');
    await expect(
      service.getPreview('invalid.jpg', '480'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('evicts least recently used previews once the entry limit is reached', async () => {
    const first = await service.getPreview('offer.jpg', '480');
    for (let index = 0; index < 100; index += 1) {
      const filename = `offer-${index}.jpg`;
      await copyFile(join(directory, 'offer.jpg'), join(directory, filename));
      await service.getPreview(filename, '480');
    }
    const regenerated = await service.getPreview('offer.jpg', '480');
    expect(regenerated).not.toBe(first);
    expect(regenerated.buffer).toEqual(first.buffer);
  });

  it('rejects excess distinct work without queuing transformations', async () => {
    await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        copyFile(
          join(directory, 'offer.jpg'),
          join(directory, `parallel-${index}.jpg`),
        ),
      ),
    );
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, (_, index) =>
        service.getPreview(`parallel-${index}.jpg`, '1440'),
      ),
    );
    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    expect(fulfilled).toHaveLength(2);
    expect(rejected).toHaveLength(6);
    for (const result of rejected) {
      expect(result.reason).toBeInstanceOf(ServiceUnavailableException);
    }
    await expect(
      service.getPreview('parallel-7.jpg', '1440'),
    ).resolves.toBeDefined();
  });
});
