import {IsOptional, IsString} from "class-validator";

export class SearchOffersDto {
  @IsOptional()
  @IsString()
  category?: string;
}
