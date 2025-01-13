import {
  BadRequestException,
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
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileType } from '../../interfaces/save-update-file-types';
import { ImageFile } from '@modules/image-file/image-file.entity';

@Controller('image-file')
export class ImageFileController {
  constructor(private readonly imageFileService: ImageFileService) {}

  @UseGuards(AuthGuard)
  @Post('/:imageFileType/:targetId')
  @UseInterceptors(FileInterceptor('imageFile'))
  async createOfferImageFile(
    @Param('imageFileType') imageFileType: ImageFileType,
    @Param('targetId') targetId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: any },
  ): Promise<ImageFile> {
    if (!file) {
      throw new BadRequestException(
        'No file provided. Please upload a valid file.',
      );
    }

    return this.imageFileService.createImageFile(
      targetId,
      imageFileType,
      file,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:imageFileType/:targetId')
  @UseInterceptors(FileInterceptor('imageFile'))
  async updateOfferImageFile(
    @Param('imageFileType') imageFileType: ImageFileType,
    @Param('targetId') targetId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: any },
  ): Promise<ImageFile> {
    if (!file) {
      throw new BadRequestException(
        'No file provided. Please upload a valid file.',
      );
    }

    return this.imageFileService.updateImageFile(
      targetId,
      imageFileType,
      file,
      req.user,
    );
  }
}
