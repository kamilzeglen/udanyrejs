import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  key: string;

  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  priceIncludes: string[];

  @IsArray()
  @ArrayNotEmpty()
  priceExcludes: string[];
}
