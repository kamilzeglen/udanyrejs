import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import * as request from 'supertest';
import * as sharp from 'sharp';
import { OfferImagePreviewController } from './offer-image-preview.controller';
import { OfferImagePreviewService } from './offer-image-preview.service';

describe('OfferImagePreviewController', () => {
  let app: INestApplication;
  let directory: string;
  const originalDirectory = process.env.OFFERS_IMAGES_PATH;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), 'offer-preview-http-'));
    process.env.OFFERS_IMAGES_PATH = directory;
    await sharp({
      create: { width: 900, height: 600, channels: 3, background: '#247cab' },
    })
      .jpeg()
      .toFile(join(directory, 'offer.jpg'));
    const module = await Test.createTestingModule({
      controllers: [OfferImagePreviewController],
      providers: [OfferImagePreviewService],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    if (originalDirectory === undefined) {
      delete process.env.OFFERS_IMAGES_PATH;
    }
    if (originalDirectory !== undefined) {
      process.env.OFFERS_IMAGES_PATH = originalDirectory;
    }
    if (directory) {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('serves public WebP images with bounded caching and conditional 304 responses', async () => {
    const url = '/image-file/offer-preview/offer.jpg?width=480&v=2026-09-14';
    const response = await request(app.getHttpServer())
      .get(url)
      .expect(200)
      .expect('Content-Type', 'image/webp')
      .expect('Cache-Control', 'public, max-age=3600, must-revalidate');
    expect(await sharp(response.body).metadata()).toMatchObject({
      format: 'webp',
      width: 480,
      height: 320,
    });
    await request(app.getHttpServer())
      .get(url)
      .set('If-None-Match', response.headers.etag)
      .expect(304);
  });

  it('rejects unsupported widths without returning image data', async () => {
    await request(app.getHttpServer())
      .get('/image-file/offer-preview/offer.jpg?width=100000')
      .expect(400);
  });

  it('returns 404 for missing originals', async () => {
    await request(app.getHttpServer())
      .get('/image-file/offer-preview/missing.jpg?width=480')
      .expect(404);
  });
});
