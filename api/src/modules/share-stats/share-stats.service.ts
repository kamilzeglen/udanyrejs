import { Injectable } from '@nestjs/common';
import { ShareStats } from '@modules/share-stats/share-stat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferTerm } from '@modules/offer/offer-term.entity';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class ShareStatsService {
  constructor(
    @InjectRepository(ShareStats)
    private readonly shareStatsRepository: Repository<ShareStats>,
    @InjectRepository(OfferTerm)
    private readonly offerTermRepository: Repository<OfferTerm>,
    private readonly logService: LogService,
  ) {}

  async findOneById(sharedStatId: string): Promise<ShareStats> {
    return this.shareStatsRepository
      .createQueryBuilder('shareStats')
      .where('shareStats.id = :sharedStatId', { sharedStatId })
      .getOne();
  }

  async save(shareStats: ShareStats): Promise<ShareStats> {
    return this.shareStatsRepository.save(shareStats);
  }

  async update(platform: string, termId: string): Promise<boolean> {
    const term = await this.offerTermRepository
      .createQueryBuilder('term')
      .leftJoinAndSelect('term.offer', 'offer')
      .where('term.id = :termId', { termId })
      .getOne();
    if (!term || !term.shareStatsId) {
      throw new AppException(API_ERRORS.OFFER_OR_SHARE_STATS_NOT_FOUND, {
        termId,
      });
    }

    const shareStats = await this.findOneById(term.shareStatsId);
    if (!shareStats) {
      throw new AppException(API_ERRORS.SHARE_STATS_NOT_FOUND, { termId });
    }

    switch (platform) {
      case 'web':
        shareStats.webClicks++;
        break;
      case 'fb':
        shareStats.facebookClicks++;
        break;
      case 'ig':
        shareStats.instagramClicks++;
        break;
      case 'tt':
        shareStats.tiktokClicks++;
        break;
      default:
        throw new AppException(API_ERRORS.SHARE_STATS_UNSUPPORTED_PLATFORM, {
          platform,
        });
    }

    if (platform === 'web') {
      await this.logService.createLog(
        'Odwiedzono ogłoszenie: ' + term.offer.name + ' (' + term.offerId + ')',
        'SYSTEM',
      );
    } else {
      await this.logService.createLog(
        'Skorzystano z reflinka: ' +
          term.offer.name +
          ' (' +
          term.offerId +
          ') (' +
          platform.toUpperCase() +
          ')',
        'SYSTEM',
      );
    }

    await this.save(shareStats);

    return true;
  }
}
