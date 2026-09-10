import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PdfFileService } from './pdf-file.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfFileType } from '../../interfaces/save-update-file-types';
import { PdfFile } from '@modules/pdf-file/pdf-file.entity';
import { CreatePdfFileDto } from '@modules/pdf-file/dto/create-pdf-file.dto';
import { Response } from 'express';
import * as fs from 'node:fs';
import { UpdatePdfFileDto } from '@modules/pdf-file/dto/update-pdf-file.dto';
import { LogService } from '@modules/log/log.service';
import {
  ALLOWED_PDF_MIME_TYPES,
  PDF_MAX_BYTES,
} from '@core/files/file-validation.util';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

const pdfUploadInterceptorOptions = {
  limits: { fileSize: PDF_MAX_BYTES },
  fileFilter: (
    req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_PDF_MIME_TYPES.includes(file.mimetype)) {
      callback(new AppException(API_ERRORS.UNSUPPORTED_PDF_TYPE), false);
      return;
    }
    callback(null, true);
  },
};

@Controller('pdf-file')
export class PdfFileController {
  constructor(
    private readonly pdfFileService: PdfFileService,
    private readonly logService: LogService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('/:pdfFileType/:targetId')
  @UseInterceptors(FileInterceptor('pdfFile', pdfUploadInterceptorOptions))
  async createOfferImageFile(
    @Param('pdfFileType') pdfFileType: PdfFileType,
    @Param('targetId') targetId: string,
    @Body() createPdfFileDto: CreatePdfFileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: any },
  ): Promise<PdfFile> {
    if (!file && !createPdfFileDto.pdfUrl) {
      throw new AppException(API_ERRORS.FILE_NOT_PROVIDED);
    }

    let pdfFile: Express.Multer.File | string;

    if (createPdfFileDto.pdfUrl) {
      pdfFile = await this.pdfFileService.downloadPdfFromUrl(
        createPdfFileDto.pdfUrl,
      );
    } else {
      pdfFile = file;
    }

    return this.pdfFileService.createPdfFile(
      targetId,
      pdfFileType,
      pdfFile,
      req.user,
      createPdfFileDto.pdfUrl,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:pdfFileType/:targetId')
  @UseInterceptors(FileInterceptor('pdfFile', pdfUploadInterceptorOptions))
  async updateOfferImageFile(
    @Param('pdfFileType') pdfFileType: PdfFileType,
    @Param('targetId') targetId: string,
    @Body() updatePdfFileDto: UpdatePdfFileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: any },
  ): Promise<PdfFile> {
    if (!file && !updatePdfFileDto.pdfUrl) {
      throw new AppException(API_ERRORS.FILE_NOT_PROVIDED);
    }

    let pdfFile: Express.Multer.File | string;

    if (updatePdfFileDto.pdfUrl) {
      pdfFile = await this.pdfFileService.downloadPdfFromUrl(
        updatePdfFileDto.pdfUrl,
      );
    } else {
      pdfFile = file;
    }

    return this.pdfFileService.updatePdfFile(
      targetId,
      pdfFileType,
      pdfFile,
      req.user,
      updatePdfFileDto.pdfUrl,
    );
  }

  @Get(':id')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const filePath = this.pdfFileService.getPdfPath(id);

    if (!fs.existsSync(filePath)) {
      throw new AppException(API_ERRORS.FILE_NOT_FOUND, { id });
    }

    await this.logService.createLog('Pobrano PDF (' + id + ')', 'SYSTEM');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="file-${id}.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
