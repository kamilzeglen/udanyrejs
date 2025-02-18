import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '@modules/user/user.module';
import { LogModule } from '@modules/log/log.module';
import { OfferModule } from '@modules/offer/offer.module';
import { ScrapperService } from '@modules/scrapper/scrapper.service';

@Module({
  imports: [forwardRef(() => OfferModule), UserModule, LogModule],
  providers: [ScrapperService],
  exports: [ScrapperService],
})
export class ScrapperModule {}
