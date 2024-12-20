import { Controller } from '@nestjs/common';
import { PdfFileService } from './pdf-file.service';

@Controller('pdf-file')
export class PdfFileController {
  constructor(private readonly pdfFileService: PdfFileService) {}
}
