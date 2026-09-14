import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { ScrapedOfferDraft } from './scraped-offer-draft.entity';
import { OfferSyncService } from './offer-sync.service';
import { OfferSyncCron } from './offer-sync.cron';
import { OfferTermCleanupCron } from './offer-term-cleanup.cron';
import { OfferDiscoveryService } from './offer-discovery.service';
import { ItineraryCityResolverService } from './itinerary-city-resolver.service';
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
import { CityModule } from '@modules/city/city.module';
import { SettingsModule } from '@modules/settings/settings.module';
import { OfferImportExportService } from './offer-import-export.service';
import { Destination } from '@modules/destination/destination.entity';
import { Category } from '@modules/category/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      OfferTerm,
      ScrapedOfferDraft,
      Destination,
      Category,
    ]),
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
    CityModule,
    SettingsModule,
  ],
  controllers: [OfferController],
  providers: [
    OfferService,
    OfferSyncService,
    OfferSyncCron,
    OfferTermCleanupCron,
    OfferDiscoveryService,
    ItineraryCityResolverService,
    OfferImportExportService,
  ],
  exports: [OfferService],
})
export class OfferModule {}
