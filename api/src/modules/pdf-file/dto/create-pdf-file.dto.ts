import { IsString } from 'class-validator';

export class CreatePdfFileDto {
  @IsString()
  pdfFile?: string;
}
