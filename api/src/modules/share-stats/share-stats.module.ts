import { Module } from '@nestjs/common';
import { ShareStatsService } from './share-stats.service';
import { ShareStatsController } from './share-stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareStats } from '@modules/share-stats/share-stat.entity';
import { Offer } from '@modules/offer/offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShareStats, Offer])],
  controllers: [ShareStatsController],
  providers: [ShareStatsService],
  exports: [ShareStatsService],
})
export class ShareStatsModule {}
