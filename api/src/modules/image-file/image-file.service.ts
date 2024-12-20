import {Injectable} from '@nestjs/common';
import {Offer} from "@modules/offer/offer.entity";
import path from "node:path";
import {writeFileSync} from "fs";
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

  async saveFile(base64Data: string, offer: Offer): Promise<ImageFile> {
    // Dekodowanie pliku z base64
    const fileData = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const fileBuffer = Buffer.from(fileData, 'base64');

    // Tworzenie unikalnej nazwy i ścieżki dla pliku
    const fileName = `${offer.id}_${Date.now()}.png`;
    const filePath = path.join(process.env.IMAGES_PATH, fileName);

    // Zapis pliku na dysku
    writeFileSync(filePath, fileBuffer);

    // Tworzenie rekordu w bazie danych
    const imageFileEntity = this.imageFileRepository.create({
      name: "brochure.pdf",
      path: "/uploads/brochure.pdf",
      offer: offer,
    });

    // Zapis encji pliku w bazie danych
    return this.imageFileRepository.save(imageFileEntity);
  }
}
