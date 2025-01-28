import { IsString } from 'class-validator';

export class CreateImageFileDto {
  @IsString()
  imageFile?: string;
}
