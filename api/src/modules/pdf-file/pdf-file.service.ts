import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PdfFile } from '@modules/pdf-file/pdf-file.entity';
import { Offer } from '@modules/offer/offer.entity';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import { PdfFileType } from '../../interfaces/save-update-file-types';
import { User } from '@modules/user/user.entity';
import * as process from 'node:process';
import axios from 'axios';
import {
  detectPdfExtension,
  PDF_MAX_BYTES,
} from '@core/files/file-validation.util';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class PdfFileService {
  private readonly logger = new Logger(PdfFileService.name);

  constructor(
    @InjectRepository(PdfFile)
    private pdfFileRepository: Repository<PdfFile>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createPdfFile(
    targetId: string,
    pdfFileType: PdfFileType,
    file: Express.Multer.File,
    requestUser: User,
    url?: string,
  ): Promise<PdfFile> {
    const uploadDir: string = process.env.OFFERS_PDFS_PATH || './uploads/pdfs';

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    if (!file) {
      throw new AppException(API_ERRORS.FILE_NOT_PROVIDED);
    }

    if (file.buffer.length > PDF_MAX_BYTES) {
      throw new AppException(API_ERRORS.FILE_TOO_LARGE_PDF);
    }

    const extname = detectPdfExtension(file.buffer);
    if (!extname) {
      throw new AppException(API_ERRORS.UNSUPPORTED_PDF_TYPE);
    }

    const fileName = `${targetId}${extname}`;
    const filePath = path.join(uploadDir, fileName);

    writeFileSync(filePath, file.buffer);

    const target = await this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.id = :targetId', { targetId })
      .getOne();
    const pdfFileEntity = this.pdfFileRepository.create({
      name: fileName,
      originalName: file.originalname,
      path: filePath,
      offer: target,
      url: url || null,
      createdBy: requestUser,
    });

    return this.pdfFileRepository.save(pdfFileEntity);
  }

  async updatePdfFile(
    targetId: string,
    pdfFileType: PdfFileType,
    file: Express.Multer.File,
    requestUser: User | 'SYSTEM',
    url?: string,
  ): Promise<PdfFile> {
    const uploadDir: string = process.env.OFFERS_PDFS_PATH || './uploads/pdfs';
    const target = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.pdfFile', 'pdfFile')
      .where('offer.id = :targetId', { targetId })
      .getOne();

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    if (!file) {
      throw new AppException(API_ERRORS.FILE_NOT_PROVIDED);
    }

    if (requestUser === 'SYSTEM') {
      requestUser = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email: 'system@udanyrejs.pl' })
        .getOne();
    }

    if (file.buffer.length > PDF_MAX_BYTES) {
      throw new AppException(API_ERRORS.FILE_TOO_LARGE_PDF);
    }

    const extname = detectPdfExtension(file.buffer);
    if (!extname) {
      throw new AppException(API_ERRORS.UNSUPPORTED_PDF_TYPE);
    }

    const fileName = `${targetId}${extname}`;
    const filePath = path.join(uploadDir, fileName);

    const existingFile: PdfFile = target.pdfFile;

    let newImageFile: PdfFile;
    if (existingFile) {
      if (existsSync(existingFile.path)) {
        unlinkSync(existingFile.path);
      }

      existingFile.name = fileName;
      existingFile.originalName = file.originalname;
      existingFile.path = filePath;
      existingFile.url = url || null;
      existingFile.updatedBy = requestUser;

      await this.pdfFileRepository.save(existingFile);
    } else {
      newImageFile = this.pdfFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        offer: target,
        url: url || null,
        createdBy: requestUser,
      });

      await this.pdfFileRepository.save(newImageFile);
    }

    writeFileSync(filePath, file.buffer);

    return existingFile || newImageFile;
  }

  async removePdfFile(filePath: string): Promise<boolean> {
    if (!filePath) {
      throw new AppException(API_ERRORS.FILE_PATH_MISSING);
    }

    try {
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
      } else {
        this.logger.error(`File does not exist: ${filePath}`);
      }
    } catch (err) {
      this.logger.error(`Failed to delete file: ${err.message}`);
      throw new AppException(API_ERRORS.FILE_DELETE_FAILED);
    }

    return true;
  }

  async downloadPdfFromUrl(url: string): Promise<Express.Multer.File> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        maxContentLength: PDF_MAX_BYTES,
        maxBodyLength: PDF_MAX_BYTES,
      });
      const fileBuffer = Buffer.from(response.data, 'binary');
      const extname = path.extname(url).toLowerCase() || '.pdf';
      const fileName = `${Date.now()}${extname}`;

      return {
        originalname: fileName,
        buffer: fileBuffer,
        mimetype: response.headers['content-type'],
      } as Express.Multer.File;
    } catch (error) {
      this.logger.error(
        `Failed to download PDF from URL ${url}: ${error.message}`,
      );
      throw new AppException(API_ERRORS.FILE_DOWNLOAD_FAILED);
    }
  }

  getPdfPath(Id: string): string {
    const uploadDir: string = process.env.OFFERS_PDFS_PATH || './uploads/pdfs';
    const fileName = `${Id}.pdf`;

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    return path.join(uploadDir, fileName);
  }
}
