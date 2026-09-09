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
    url?: string,
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
      const target = await this.offerRepository
        .createQueryBuilder('offer')
        .where('offer.id = :targetId', { targetId })
        .getOne();
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        offer: target,
        url: url || null,
        createdBy: requestUser,
      });
    }

    if (imageFileType === ImageFileType.COMPANY) {
      const target = await this.companyRepository
        .createQueryBuilder('company')
        .where('company.id = :targetId', { targetId })
        .getOne();
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        company: target,
        url: url || null,
        createdBy: requestUser,
      });
    }

    if (imageFileType === ImageFileType.SHIP) {
      const target = await this.shipRepository
        .createQueryBuilder('ship')
        .where('ship.id = :targetId', { targetId })
        .getOne();
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        ship: target,
        url: url || null,
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
    url?: string,
  ): Promise<ImageFile> {
    let uploadDir: string = './uploads/images';
    let target: any;
    if (imageFileType === ImageFileType.OFFER) {
      target = await this.offerRepository
        .createQueryBuilder('offer')
        .leftJoinAndSelect('offer.imageFile', 'imageFile')
        .where('offer.id = :targetId', { targetId })
        .getOne();
      uploadDir = process.env.OFFERS_IMAGES_PATH;
    }

    if (imageFileType === ImageFileType.COMPANY) {
      target = await this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.imageFile', 'imageFile')
        .where('company.id = :targetId', { targetId })
        .getOne();
      uploadDir = process.env.COMPANIES_IMAGES_PATH;
    }

    if (imageFileType === ImageFileType.SHIP) {
      target = await this.shipRepository
        .createQueryBuilder('ship')
        .leftJoinAndSelect('ship.imageFile', 'imageFile')
        .where('ship.id = :targetId', { targetId })
        .getOne();
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

    const existingFile: ImageFile = target.imageFile;

    let newImageFile: ImageFile;
    if (existingFile) {
      if (existsSync(existingFile.path)) {
        unlinkSync(existingFile.path);
      }

      existingFile.name = fileName;
      existingFile.originalName = file.originalname;
      existingFile.path = filePath;
      existingFile.url = url || null;
      existingFile.updatedBy = requestUser;

      await this.imageFileRepository.save(existingFile);
    } else {
      if (imageFileType === ImageFileType.OFFER) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          offer: target,
          url: url || null,
          createdBy: requestUser,
        });
      }

      if (imageFileType === ImageFileType.COMPANY) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          company: target,
          url: url || null,
          createdBy: requestUser,
        });
      }

      if (imageFileType === ImageFileType.SHIP) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          ship: target,
          url: url || null,
          createdBy: requestUser,
        });
      }

      await this.imageFileRepository.save(newImageFile);
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
      const extname = path.extname(url).toLowerCase() || '.jpg';
      const fileName = `${Date.now()}${extname}`;

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
