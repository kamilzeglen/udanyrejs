import { Module } from '@nestjs/common';
import { ImageFileService } from './image-file.service';
import { ImageFileController } from './image-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageFile } from '@modules/image-file/image-file.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { Offer } from '@modules/offer/offer.entity';
import { Company } from '@modules/company/company.entity';
import { Ship } from '@modules/ship/ship.entity';
import { Destination } from '@modules/destination/destination.entity';
import { OfferImagePreviewController } from './offer-image-preview.controller';
import { OfferImagePreviewService } from './offer-image-preview.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageFile, Offer, Company, Ship, Destination]),
    AuthModule,
  ],
  controllers: [ImageFileController, OfferImagePreviewController],
  providers: [ImageFileService, OfferImagePreviewService],
  exports: [ImageFileService],
})
export class ImageFileModule {}
