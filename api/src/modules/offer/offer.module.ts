import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { OfferTermPrice } from './offer-term-price.entity';
import { OfferSyncService } from './offer-sync.service';
import { OfferSyncCron } from './offer-sync.cron';
import { ImageFileModule } from '@modules/image-file/image-file.module';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CompanyModule } from '@modules/company/company.module';
import { ShipModule } from '@modules/ship/ship.module';
import { PdfFileModule } from '@modules/pdf-file/pdf-file.module';
import { DestinationModule } from '@modules/destination/destination.module';
import { CategoryModule } from '@modules/category/category.module';
import { ShareStatsModule } from '@modules/share-stats/share-stats.module';
import { CabinTypeModule } from '@modules/cabin-type/cabin-type.module';
import { HttpModule } from '@nestjs/axios';
import { ScraperClientModule } from '@core/scraper-client/scraper-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, OfferTerm, OfferTermPrice]),
    ImageFileModule,
    PdfFileModule,
    UserModule,
    AuthModule,
    CompanyModule,
    ShipModule,
    DestinationModule,
    CategoryModule,
    ShareStatsModule,
    CabinTypeModule,
    HttpModule,
    ScraperClientModule,
  ],
  controllers: [OfferController],
  providers: [OfferService, OfferSyncService, OfferSyncCron],
  exports: [OfferService],
})
export class OfferModule {}
