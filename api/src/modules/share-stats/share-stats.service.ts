import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShareStats } from '@modules/share-stats/share-stat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '@modules/offer/offer.entity';
import { LogService } from '@modules/log/log.service';

@Injectable()
export class ShareStatsService {
  constructor(
    @InjectRepository(ShareStats)
    private readonly shareStatsRepository: Repository<ShareStats>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly logService: LogService,
  ) {}

  async findOneById(sharedStatId: string): Promise<ShareStats> {
    return this.shareStatsRepository.findOne({ where: { id: sharedStatId } });
  }

  async save(shareStats: ShareStats): Promise<ShareStats> {
    return this.shareStatsRepository.save(shareStats);
  }

  async createForOffer(offer: Offer): Promise<ShareStats> {
    const shareStats = new ShareStats();
    shareStats.offerId = offer.id;
    shareStats.facebookClicks = 0;
    shareStats.instagramClicks = 0;
    shareStats.tiktokClicks = 0;

    return await this.save(shareStats);
  }

  async update(platform: string, offerId: string): Promise<boolean> {
    const offer = await this.offerRepository.findOneBy({ id: offerId });
    if (!offer || !offer.shareStatsId) {
      throw new NotFoundException('Oferta lub statystyki nie istnieją');
    }

    const shareStats = await this.findOneById(offer.shareStatsId);
    if (!shareStats) {
      throw new NotFoundException('Statystyki udostępniania nie istnieją');
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
        throw new BadRequestException('Nieobsługiwana platforma');
    }

    await this.logService.createLog(
      'Skorzystano z reflinka: ' +
        offer.name +
        ' (' +
        offer.id +
        ') (' +
        platform.toUpperCase() +
        ')',
      'SYSTEM',
    );

    await this.save(shareStats);

    return true;
  }
}
