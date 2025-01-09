import {IsOptional, IsString,} from "class-validator";


export class CreateCompanyDto {

  @IsString()
  name: string;

  @IsString()
  key: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  image?: any;
}
