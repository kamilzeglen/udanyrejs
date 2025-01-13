import { Injectable } from '@nestjs/common';
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

@Injectable()
export class PdfFileService {
  constructor(
    @InjectRepository(PdfFile)
    private pdfFileRepository: Repository<PdfFile>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
  ) {}

  async createImageFile(
    targetId: string,
    pdfFileType: PdfFileType,
    file: Express.Multer.File,
    requestUser: User,
  ): Promise<PdfFile> {
    const uploadDir: string = process.env.OFFERS_PDFS_PATH || './uploads/pdfs';

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    if (!file) {
      throw new Error('No file provided for updating');
    }

    const extname = path.extname(file.originalname).toLowerCase();
    if (!extname) {
      throw new Error('Unable to determine file extension');
    }

    const fileName = `${targetId}${extname}`;
    const filePath = path.join(uploadDir, fileName);

    writeFileSync(filePath, file.buffer);

    const target = await this.offerRepository.findOneBy({ id: targetId });
    const pdfFileEntity = this.pdfFileRepository.create({
      name: fileName,
      originalName: file.originalname,
      path: filePath,
      offer: target,
      createdBy: requestUser,
    });

    return this.pdfFileRepository.save(pdfFileEntity);
  }

  async updateImageFile(
    targetId: string,
    pdfFileType: PdfFileType,
    file: Express.Multer.File,
    requestUser: User,
  ): Promise<PdfFile> {
    const uploadDir: string = process.env.OFFERS_PDFS_PATH || './uploads/pdfs';
    const target = await this.offerRepository.findOneBy({ id: targetId });

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    if (!file) {
      throw new Error('No file provided for updating');
    }

    const extname = path.extname(file.originalname).toLowerCase();
    if (!extname) {
      throw new Error('Unable to determine file extension');
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
      existingFile.updatedBy = requestUser;

      await this.pdfFileRepository.save(existingFile);
    } else {
      newImageFile = this.pdfFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        offer: target,
        createdBy: requestUser,
      });

      await this.pdfFileRepository.save(newImageFile); // Tworzymy nowy rekord
    }

    writeFileSync(filePath, file.buffer);

    return existingFile || newImageFile;
  }

  async removePdfFile(filePath: string): Promise<boolean> {
    if (!filePath) {
      throw new Error('Path not found');
    }

    try {
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
      } else {
        console.error(`File does not exist: ${filePath}`);
      }
    } catch (err) {
      console.error(`Failed to delete file: ${err.message}`);
      throw new Error('Failed to delete the physical file');
    }

    return true;
  }
}
