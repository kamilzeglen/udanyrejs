import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { OfferImagePreviewService } from './offer-image-preview.service';

@Controller('image-file/offer-preview')
export class OfferImagePreviewController {
  constructor(
    private readonly offerImagePreviewService: OfferImagePreviewService,
  ) {}

  @Get(':filename')
  async getPreview(
    @Param('filename') filename: string,
    @Query('width') width: unknown,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const preview = await this.offerImagePreviewService.getPreview(
      filename,
      width,
    );
    response.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      ETag: preview.etag,
    });
    if (request.fresh) {
      response.status(304).end();
      return;
    }
    response.send(preview.buffer);
  }
}
