import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ImageFile} from "@modules/image-file/image-file.entity";
import {Repository} from "typeorm";
import {PdfFile} from "@modules/pdf-file/pdf-file.entity";
import {Offer} from "@modules/offer/offer.entity";
import {existsSync, mkdirSync, unlinkSync, writeFileSync} from "fs";
import * as path from 'path';

@Injectable()
export class PdfFileService {

  constructor(
    @InjectRepository(PdfFile)
    private pdfFileRepository: Repository<PdfFile>,
  ) {
  }

  findFileByName(name: string): Promise<PdfFile> {
    return this.pdfFileRepository.findOneBy({name: name});
  }

  async saveFile(file: Express.Multer.File, offer: Offer): Promise<ImageFile> {
    const uploadDir = process.env.PDFS_PATH || './uploads/pdfs';
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

    const pdfFileEntity = this.pdfFileRepository.create({
      name: fileName,
      originalName: file.originalname,
      path: filePath,
      offer
    });

    return this.pdfFileRepository.save(pdfFileEntity);
  }

async updateFile(file: Express.Multer.File, offer: Offer): Promise<PdfFile> {
  const uploadDir = process.env.PDFS_PATH || './uploads/pdfs';

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

  const fileName = `${offer.id}${extname}`; // Zachowujemy nazwę pliku opartą na ID oferty
  const filePath = path.join(uploadDir, fileName);

  const existingFile = offer.pdfFile;

  let newImageFile: PdfFile
  if (existingFile) {
    // Krok 1: Usunięcie starego pliku z dysku (jeśli istnieje)
    if (existsSync(existingFile.path)) {
      unlinkSync(existingFile.path);
    }

    // Krok 2: Uaktualnienie danych w bazie
    existingFile.originalName = file.originalname; // Aktualizujemy tylko nazwę oryginalną
    existingFile.path = filePath; // Aktualizujemy ścieżkę pliku

    // Krok 3: Zapisanie zmienionego rekordu w bazie
    await this.pdfFileRepository.save(existingFile); // Zamiast 'update', używamy 'save' do zaktualizowania istniejącego rekordu
  } else {
    // Jeśli nie istnieje rekord, tworzymy nowy
     newImageFile = this.pdfFileRepository.create({
      name: fileName, // Nazwa pliku pozostaje taka sama
      originalName: file.originalname, // Zmieniamy tylko nazwę oryginalną
      path: filePath,
      offer,
    });

    await this.pdfFileRepository.save(newImageFile); // Tworzymy nowy rekord
  }

  // Krok 4: Zwrócenie zaktualizowanego obiektu ImageFile
  return existingFile || newImageFile;
}
}
