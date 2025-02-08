import {
  IsInstance,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class CreatePdfFileDto {
  @ValidateIf((o) => !o.file)
  @IsString()
  @IsUrl()
  @IsOptional()
  pdfUrl?: string;

  @ValidateIf((o) => !o.pdfUrl)
  @IsInstance(Object)
  @IsOptional()
  file?: Express.Multer.File;
}
