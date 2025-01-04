import {Injectable} from '@nestjs/common';
import {Offer} from "@modules/offer/offer.entity";
import * as path from 'path';
import {existsSync, mkdirSync, unlinkSync, writeFileSync} from 'fs';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ImageFile} from "@modules/image-file/image-file.entity";

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

  async saveFile(file: Express.Multer.File, offer: Offer): Promise<ImageFile> {
    const uploadDir = process.env.IMAGES_PATH || './uploads/images';
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

    const fileName = `${offer.id}${extname}`;
    const filePath = path.join(uploadDir, fileName);

    writeFileSync(filePath, file.buffer);

    const imageFileEntity = this.imageFileRepository.create({
      name: fileName,
      originalName: file.originalname,
      path: filePath,
      offer
    });

    return this.imageFileRepository.save(imageFileEntity);
  }

  async updateFile(file: Express.Multer.File, offer: Offer): Promise<ImageFile> {
    const uploadDir = process.env.IMAGES_PATH || './uploads/images';

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

    const fileName = `${offer.id}${extname}`; // Zachowujemy nazwę pliku opartą na ID oferty
    const filePath = path.join(uploadDir, fileName);

    const existingFile = offer.imageFile;

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
      // Jeśli nie istnieje rekord, tworzymy nowy
      newImageFile = this.imageFileRepository.create({
        name: fileName, // Nazwa pliku pozostaje taka sama
        originalName: file.originalname, // Zmieniamy tylko nazwę oryginalną
        path: filePath,
        offer,
      });

      await this.imageFileRepository.save(newImageFile); // Tworzymy nowy rekord
    }

    writeFileSync(filePath, file.buffer);

    // Krok 4: Zwrócenie zaktualizowanego obiektu ImageFile
    return existingFile || newImageFile;
  }
}
