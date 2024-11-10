// src/offer/offer.service.ts

import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Offer} from './offer.entity';
import * as fs from 'fs';
import {writeFileSync} from 'fs'; // Importowanie writeFileSync z fs
import * as path from 'path';
import {CreateOfferDto} from "./dto/create-offer.dto";
import axios from 'axios';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
  ) {
  }

  async findAll(): Promise<any[]> {
    const offers = await this.offerRepository.find();

    return await Promise.all(
      offers.map(async (offer) => {
        if (!offer.imageFileName) {
          return {...offer, image: null};
        }

        try {
          const imagePath = path.join(process.env.IMAGES_PATH, offer.imageFileName);

          if (!imagePath.startsWith(path.resolve(process.env.IMAGES_PATH))) {
            throw new Error('Unauthorized file path');
          }

          const image = await this.getFileContent(imagePath);
          return {...offer, image: image ? image.toString('base64') : null};
        } catch (error) {
          console.error(`Error reading file for offer ${offer.id}:`, error);
          return {...offer, image: null};
        }
      }),
    );
  }

  async findOne(id: string): Promise<any> {
    const offer = await this.offerRepository.findOneBy({id});
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const image = await this.getFileContent(process.env.IMAGES_PATH + "/" + offer.imageFileName);

    return {
      ...offer,
      image: image ? image.toString('base64') : null,
    };
  }

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
    const offer = this.offerRepository.create(createOfferDto);
    offer.pdfFileName = '';
    offer.imageFileName = '';

    const savedOffer = await this.offerRepository.save(offer);

    if (createOfferDto.image) {
      const base64Data = createOfferDto.image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imageFileName = `${savedOffer.id}.png`;
      const imagePath = path.join(process.env.IMAGES_PATH, imageFileName);
      writeFileSync(imagePath, imageBuffer);

      savedOffer.imageFileName = imageFileName;
    }

    if (createOfferDto.pdfFileURL) {
      try {
        if (!createOfferDto.pdfFileURL.includes('&agentCode=UR92JS')) {
          createOfferDto.pdfFileURL += '&agentCode=UR92JS'
        }

        const response = await axios.get(createOfferDto.pdfFileURL, {responseType: 'arraybuffer'});
        const pdfBuffer = Buffer.from(response.data, 'binary');
        const pdfFileName = `${savedOffer.id}.pdf`;
        const pdfPath = path.join(process.env.PDFS_PATH, pdfFileName);
        writeFileSync(pdfPath, pdfBuffer);

        savedOffer.pdfFileName = pdfFileName;
        console.log(pdfPath)
        console.log(pdfFileName)
      } catch (error) {
        console.error('Error downloading PDF:', error);
        throw new Error('Failed to download PDF file');
      }
    }

    return await this.offerRepository.save(savedOffer);
  }

  async removeOffer(offerID: string): Promise<boolean> {
    const result = await this.offerRepository.softDelete(offerID);
    return result.affected !== undefined && result.affected > 0;
  }


  private async getFileContent(filePath: string): Promise<Buffer | null> {
    const fullPath = path.resolve(filePath);

    try {
      if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
        return fs.promises.readFile(fullPath);
      }
    } catch (error) {
      console.error(`Failed to access file at ${fullPath}:`, error);
    }

    return null;
  }
}
