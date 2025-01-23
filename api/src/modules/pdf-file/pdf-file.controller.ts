import {
  BadRequestException,
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
import { PdfFileService } from './pdf-file.service';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfFileType } from '../../interfaces/save-update-file-types';
import { PdfFile } from '@modules/pdf-file/pdf-file.entity';
import { CreatePdfFileDto } from '@modules/pdf-file/dto/create-pdf-file.dto';

@Controller('pdf-file')
export class PdfFileController {
  constructor(private readonly pdfFileService: PdfFileService) {}

  @UseGuards(AuthGuard)
  @Post('/:pdfFileType/:targetId')
  @UseInterceptors(FileInterceptor('pdfFile'))
  async createOfferImageFile(
    @Param('pdfFileType') pdfFileType: PdfFileType,
    @Param('targetId') targetId: string,
    @Body() createPdfFileDto: CreatePdfFileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: any },
  ): Promise<PdfFile> {
    if (!file && !createPdfFileDto.pdfFile) {
      throw new BadRequestException(
        'No file provided. Please upload a valid file or url.',
      );
    }

    let pdfFile: Express.Multer.File | string;

    if (createPdfFileDto.pdfFile) {
      // Jeśli przesłano URL, pobieramy obraz
      pdfFile = await this.pdfFileService.downloadPdfFromUrl(
        createPdfFileDto.pdfFile,
      );
    } else {
      pdfFile = file; // Jeśli przesłano plik, używamy go
    }

    return this.pdfFileService.createPdfFile(
      targetId,
      pdfFileType,
      pdfFile,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:pdfFileType/:targetId')
  @UseInterceptors(FileInterceptor('pdfFile'))
  async updateOfferImageFile(
    @Param('pdfFileType') pdfFileType: PdfFileType,
    @Param('targetId') targetId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: any },
  ): Promise<PdfFile> {
    if (!file) {
      throw new BadRequestException(
        'No file provided. Please upload a valid file.',
      );
    }

    return this.pdfFileService.updateImageFile(
      targetId,
      pdfFileType,
      file,
      req.user,
    );
  }
}
