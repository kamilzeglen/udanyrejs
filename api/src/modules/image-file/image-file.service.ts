import {Injectable} from '@nestjs/common';
import {Offer} from "@modules/offer/offer.entity";
import * as path from 'path';
import {existsSync, mkdirSync, unlinkSync, writeFileSync} from 'fs';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ImageFile} from "@modules/image-file/image-file.entity";
import {Company} from "@modules/company/company.entity";
import {Ship} from "@modules/ship/ship.entity";
import {SaveTypes, UpdateTypes} from "../../interfaces/save-update-file-types";
import * as fs from 'fs/promises';

@Injectable()
export class ImageFileService {

  constructor(
    @InjectRepository(ImageFile)
    private imageFileRepository: Repository<ImageFile>,
  ) {
  }

  findFileByName(name: string): Promise<ImageFile> {
    return this.imageFileRepository.findOneBy({name: name});
  }

  async createFile(file: Express.Multer.File, type: SaveTypes, target: Offer | Company | Ship): Promise<ImageFile> {

    let uploadDir: string = './uploads/images'
    if (type === SaveTypes.OFFER) {
      uploadDir = process.env.OFFERS_IMAGES_PATH;
    }

    if (type === SaveTypes.COMPANY) {
      uploadDir = process.env.COMPANIES_IMAGES_PATH;
    }

    if (type === SaveTypes.SHIP) {
      uploadDir = process.env.SHIPS_IMAGES_PATH;
    }

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, {recursive: true});
    }

    if (!file) {
      throw new Error('No file provided for updating');
    }

    const extname = path.extname(file.originalname).toLowerCase();
    if (!extname) {
      throw new Error('Unable to determine file extension');
    }

    const fileName = `${target.id}${extname}`;
    const filePath = path.join(uploadDir, fileName);

    writeFileSync(filePath, file.buffer);

    let imageFileEntity: ImageFile
    if (type === SaveTypes.OFFER) {
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        offer: target
      });
    }

    if (type === SaveTypes.COMPANY) {
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        company: target
      });
    }

    if (type === SaveTypes.SHIP) {
      imageFileEntity = this.imageFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        ship: target
      });
    }

    return this.imageFileRepository.save(imageFileEntity);
  }

  async updateImage(file: Express.Multer.File, type: UpdateTypes, target: Offer | Company | Ship): Promise<ImageFile> {

    let uploadDir: string = './uploads/images'
    if (type === UpdateTypes.OFFER) {
      uploadDir = process.env.OFFERS_IMAGES_PATH;
    }

    if (type === UpdateTypes.COMPANY) {
      uploadDir = process.env.COMPANIES_IMAGES_PATH;
    }

    if (type === UpdateTypes.SHIP) {
      uploadDir = process.env.SHIPS_IMAGES_PATH;
    }

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, {recursive: true});
    }

    if (!file) {
      throw new Error('No file provided for updating');
    }

    const extname = path.extname(file.originalname).toLowerCase();
    if (!extname) {
      throw new Error('Unable to determine file extension');
    }

    const fileName = `${target.id}${extname}`; // Zachowujemy nazwę pliku opartą na ID oferty
    const filePath = path.join(uploadDir, fileName);

    const existingFile = target.imageFile;

    let newImageFile: ImageFile
    if (existingFile) {
      // Krok 1: Usunięcie starego pliku z dysku (jeśli istnieje)
      if (existsSync(existingFile.path)) {
        unlinkSync(existingFile.path);
      }

      // Krok 2: Uaktualnienie danych w bazie
      existingFile.name = fileName; // Aktualizujemy tylko nazwę oryginalną
      existingFile.originalName = file.originalname; // Aktualizujemy tylko nazwę oryginalną
      existingFile.path = filePath; // Aktualizujemy ścieżkę pliku

      // Krok 3: Zapisanie zmienionego rekordu w bazie
      await this.imageFileRepository.save(existingFile); // Zamiast 'update', używamy 'save' do zaktualizowania istniejącego rekordu
    } else {

      if (type === UpdateTypes.OFFER) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          offer: target,
        });
      }

      if (type === UpdateTypes.COMPANY) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          company: target,
        });
      }

      if (type === UpdateTypes.SHIP) {
        newImageFile = this.imageFileRepository.create({
          name: fileName,
          originalName: file.originalname,
          path: filePath,
          ship: target,
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
}
