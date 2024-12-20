import { Module } from '@nestjs/common';
import { PdfFileService } from './pdf-file.service';
import { PdfFileController } from './pdf-file.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PdfFile} from "@modules/pdf-file/pdf-file.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PdfFile])],
  controllers: [PdfFileController],
  providers: [PdfFileService],
  exports: [PdfFileService],
})
export class PdfFileModule {}
