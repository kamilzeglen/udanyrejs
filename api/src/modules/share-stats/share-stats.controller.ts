import { Controller, Get, Param } from '@nestjs/common';
import { ShareStatsService } from './share-stats.service';

@Controller('share')
export class ShareStatsController {
  constructor(private readonly shareStatsService: ShareStatsService) {}

  @Get(':platform/:offerId')
  async handleShare(
    @Param('platform') platform: string,
    @Param('offerId') offerId: string,
  ) {
    return this.shareStatsService.update(platform, offerId);
  }
}
