import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {PdfFile} from "@modules/pdf-file/pdf-file.entity";
import {Offer} from "@modules/offer/offer.entity";
import {existsSync, mkdirSync, unlinkSync, writeFileSync} from "fs";
import * as fs from 'fs/promises';
import * as path from "node:path";

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

  async savePdf(file: Express.Multer.File, target: Offer): Promise<PdfFile> {

    let uploadDir = process.env.OFFERS_PDFS_PATH || './uploads/images'

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

    const pdfEntity = this.pdfFileRepository.create({
      name: fileName,
      originalName: file.originalname,
      path: filePath,
      offer: target
    });


    return this.pdfFileRepository.save(pdfEntity);
  }

  async updatePdf(file: Express.Multer.File, target: Offer): Promise<PdfFile> {

    let uploadDir = process.env.OFFERS_PDFS_PATH || './uploads/images'

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

    const existingFile = target.pdfFile;

    let newPdfFile: PdfFile
    if (existingFile) {
      if (existsSync(existingFile.path)) {
        unlinkSync(existingFile.path);
      }

      existingFile.name = fileName;
      existingFile.originalName = file.originalname;
      existingFile.path = filePath;

      // Krok 3: Zapisanie zmienionego rekordu w bazie
      await this.pdfFileRepository.save(existingFile); // Zamiast 'update', używamy 'save' do zaktualizowania istniejącego rekordu
    } else {


      newPdfFile = this.pdfFileRepository.create({
        name: fileName,
        originalName: file.originalname,
        path: filePath,
        offer: target,
      });

      await this.pdfFileRepository.save(newPdfFile); // Tworzymy nowy rekord
    }

    writeFileSync(filePath, file.buffer);

    return existingFile || newPdfFile;
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

