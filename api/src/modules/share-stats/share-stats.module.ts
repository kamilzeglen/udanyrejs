import { Module } from '@nestjs/common';
import { ShareStatsService } from './share-stats.service';
import { ShareStatsController } from './share-stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareStats } from '@modules/share-stats/share-stat.entity';
import { OfferTerm } from '@modules/offer/offer-term.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShareStats, OfferTerm])],
  controllers: [ShareStatsController],
  providers: [ShareStatsService],
  exports: [ShareStatsService],
})
export class ShareStatsModule {}
