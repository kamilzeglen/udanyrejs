import { Module } from '@nestjs/common';
import { ImageFileService } from './image-file.service';
import { ImageFileController } from './image-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageFile } from '@modules/image-file/image-file.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { Offer } from '@modules/offer/offer.entity';
import { Company } from '@modules/company/company.entity';
import { Ship } from '@modules/ship/ship.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageFile, Offer, Company, Ship]),
    AuthModule,
  ],
  controllers: [ImageFileController],
  providers: [ImageFileService],
  exports: [ImageFileService],
})
export class ImageFileModule {}
