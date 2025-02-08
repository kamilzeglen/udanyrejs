import {
  IsInstance,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class CreateImageFileDto {
  @ValidateIf((o) => !o.file)
  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ValidateIf((o) => !o.imageUrl)
  @IsInstance(Object)
  @IsOptional()
  file?: Express.Multer.File;
}
