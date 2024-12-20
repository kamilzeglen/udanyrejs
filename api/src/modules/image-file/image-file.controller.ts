import { Controller } from '@nestjs/common';
import { ImageFileService } from './image-file.service';

@Controller('image-file')
export class ImageFileController {
  constructor(private readonly imageFileService: ImageFileService) {}
}
