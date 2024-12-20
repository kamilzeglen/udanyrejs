import { Module } from '@nestjs/common';
import { ImageFileService } from './image-file.service';
import { ImageFileController } from './image-file.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ImageFile} from "@modules/image-file/image-file.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ImageFile])],
  controllers: [ImageFileController],
  providers: [ImageFileService],
  exports: [ImageFileService],
})
export class ImageFileModule {}
