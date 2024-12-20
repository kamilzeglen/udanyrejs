import {Module} from '@nestjs/common';
import {OfferService} from './offer.service';
import {OfferController} from './offer.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Offer} from "./offer.entity";
import {ImageFileModule} from "@modules/image-file/image-file.module";

@Module({
  imports: [TypeOrmModule.forFeature([Offer]), ImageFileModule],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {
}
