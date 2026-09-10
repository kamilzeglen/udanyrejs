import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ImageFileService } from './image-file.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileType } from '../../interfaces/save-update-file-types';
import { ImageFile } from '@modules/image-file/image-file.entity';
import { CreateImageFileDto } from '@modules/image-file/dto/create-image-file.dto';
import { UpdateImageFileDto } from '@modules/image-file/dto/update-image-file.dto';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_MAX_BYTES,
} from '@core/files/file-validation.util';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

const imageUploadInterceptorOptions = {
  limits: { fileSize: IMAGE_MAX_BYTES },
  fileFilter: (
    req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      callback(new AppException(API_ERRORS.UNSUPPORTED_IMAGE_TYPE), false);
      return;
    }
    callback(null, true);
  },
};

@Controller('image-file')
export class ImageFileController {
  constructor(private readonly imageFileService: ImageFileService) {}

  @UseGuards(AuthGuard)
  @Post('/:imageFileType/:targetId')
  @UseInterceptors(FileInterceptor('imageFile', imageUploadInterceptorOptions))
  async createOfferImageFile(
    @Param('imageFileType') imageFileType: ImageFileType,
    @Param('targetId') targetId: string,
    @Body() createImageFileDto: CreateImageFileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: any },
  ): Promise<ImageFile> {
    if (!file && !createImageFileDto.imageUrl) {
      throw new AppException(API_ERRORS.FILE_NOT_PROVIDED);
    }

    let imageFile: Express.Multer.File | string;

    if (createImageFileDto.imageUrl) {
      imageFile = await this.imageFileService.downloadImageFromUrl(
        createImageFileDto.imageUrl,
      );
    } else {
      imageFile = file;
    }

    return this.imageFileService.createImageFile(
      targetId,
      imageFileType,
      imageFile,
      req.user,
      createImageFileDto.imageUrl,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:imageFileType/:targetId')
  @UseInterceptors(FileInterceptor('imageFile', imageUploadInterceptorOptions))
  async updateOfferImageFile(
    @Param('imageFileType') imageFileType: ImageFileType,
    @Param('targetId') targetId: string,
    @Body() updateImageFileDto: UpdateImageFileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: any },
  ): Promise<ImageFile> {
    if (!file && !updateImageFileDto.imageUrl) {
      throw new AppException(API_ERRORS.FILE_NOT_PROVIDED);
    }

    let imageFile: Express.Multer.File | string;

    if (updateImageFileDto.imageUrl) {
      imageFile = await this.imageFileService.downloadImageFromUrl(
        updateImageFileDto.imageUrl,
      );
    } else {
      imageFile = file;
    }

    return this.imageFileService.updateImageFile(
      targetId,
      imageFileType,
      imageFile,
      req.user,
      updateImageFileDto.imageUrl,
    );
  }
}
