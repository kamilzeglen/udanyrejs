import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { ImageFileModule } from '@modules/image-file/image-file.module';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CompanyModule } from '@modules/company/company.module';
import { ShipModule } from '@modules/ship/ship.module';
import { PdfFileModule } from '@modules/pdf-file/pdf-file.module';
import { DestinationModule } from '@modules/destination/destination.module';
import { CategoryModule } from '@modules/category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer]),
    ImageFileModule,
    PdfFileModule,
    UserModule,
    AuthModule,
    CompanyModule,
    ShipModule,
    DestinationModule,
    CategoryModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
