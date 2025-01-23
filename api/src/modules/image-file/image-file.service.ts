import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageFile } from '@modules/image-file/image-file.entity';
import * as fs from 'fs/promises';
import { ImageFileType } from '../../interfaces/save-update-file-types';
import { User } from '@modules/user/user.entity';
import { Offer } from '@modules/offer/offer.entity';
import { Ship } from '@modules/ship/ship.entity';
import { Company } from '@modules/company/company.entity';
import axios from 'axios';

@Injectable()
export class ImageFileService {
  constructor(
    @InjectRepository(ImageFile)
    private imageFileRepository: Repository<ImageFile>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Ship)
    private shipRepository: Repository<Ship>,
  ) {}

  async createImageFile(
    targetId: string,
    imageFileType: ImageFileType,
    file: Express.Multer.File,
    requestUser: User,
  ): Promise<ImageFile> {
    let uploadDir: string = './uploads/images';
    if (imageFileType === ImageFileType.OFFER) {
      uploadDir = process.env.OFFERS_IMAGES_PATH;
    }

    if (imageFileType === ImageFileType.COMPANY) {
      uploadDir = process.env.COMPANIES_IMAGES_PATH;
    }

    if (imageFileType === ImageFileType.SHIP) {
      uploadDir = process.env.SHIPS_IMAGES_PATH;
    }

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

    let imageFileEntity: ImageFile;
    if (imageFileType === ImageFileType.OFFER) {
      const target = await this.offerRepository.findOneBy({ id: targetId });
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        offer: target,
        createdBy: requestUser,
      });
    }

    if (imageFileType === ImageFileType.COMPANY) {
      const target = await this.companyRepository.findOneBy({ id: targetId });
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        company: target,
        createdBy: requestUser,
      });
    }

    if (imageFileType === ImageFileType.SHIP) {
      const target = await this.shipRepository.findOneBy({ id: targetId });
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        ship: target,
        createdBy: requestUser,
      });
    }

    return this.imageFileRepository.save(imageFileEntity);
  }

  async updateImageFile(
    targetId: string,
    imageFileType: ImageFileType,
    file: Express.Multer.File,
    requestUser: User,
  ): Promise<ImageFile> {
    let uploadDir: string = './uploads/images';
    let target: any;
    if (imageFileType === ImageFileType.OFFER) {
      target = await this.offerRepository.findOneBy({ id: targetId });
      uploadDir = process.env.OFFERS_IMAGES_PATH;
    }

    if (imageFileType === ImageFileType.COMPANY) {
      target = await this.companyRepository.findOneBy({ id: targetId });
      uploadDir = process.env.COMPANIES_IMAGES_PATH;
    }

    if (imageFileType === ImageFileType.SHIP) {
      target = await this.shipRepository.findOneBy({ id: targetId });
      uploadDir = process.env.SHIPS_IMAGES_PATH;
    }

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

    const fileName = `${targetId}${extname}`; // Zachowujemy nazwę pliku opartą na ID oferty
    const filePath = path.join(uploadDir, fileName);

    const existingFile: ImageFile = target.imageFile;

    let newImageFile: ImageFile;
    if (existingFile) {
      // Krok 1: Usunięcie starego pliku z dysku (jeśli istnieje)
      if (existsSync(existingFile.path)) {
        unlinkSync(existingFile.path);
      }

      // Krok 2: Uaktualnienie danych w bazie
      existingFile.name = fileName;
      existingFile.originalName = file.originalname;
      existingFile.path = filePath;
      existingFile.updatedBy = requestUser;

      // Krok 3: Zapisanie zmienionego rekordu w bazie
      await this.imageFileRepository.save(existingFile); // Zamiast 'update', używamy 'save' do zaktualizowania istniejącego rekordu
    } else {
      if (imageFileType === ImageFileType.OFFER) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          offer: target,
          createdBy: requestUser,
        });
      }

      if (imageFileType === ImageFileType.COMPANY) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          company: target,
          createdBy: requestUser,
        });
      }

      if (imageFileType === ImageFileType.SHIP) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          ship: target,
          createdBy: requestUser,
        });
      }

      await this.imageFileRepository.save(newImageFile); // Tworzymy nowy rekord
    }

    writeFileSync(filePath, file.buffer);

    return existingFile || newImageFile;
  }

  async removeImageFile(filePath: string): Promise<boolean> {
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

  async downloadImageFromUrl(url: string): Promise<Express.Multer.File> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(response.data, 'binary');
      const extname = path.extname(url).toLowerCase() || '.jpg'; // Zakładając, że URL kończy się rozszerzeniem pliku
      const fileName = `${Date.now()}${extname}`; // Generowanie unikalnej nazwy pliku

      return {
        originalname: fileName,
        buffer: fileBuffer,
        mimetype: response.headers['content-type'],
      } as Express.Multer.File;
    } catch {
      throw new BadRequestException('Failed to download image from URL');
    }
  }
}
