import {IsArray, IsDateString, IsDecimal, IsEnum, IsInt, IsOptional, IsString, ValidateNested} from "class-validator";
import {Company} from "../../../interfaces/company";
import {Type} from "class-transformer";
import {ItineraryDayDto} from "./itinerary-day.dto";

export class CreateOfferDto {

  @IsString()
  name: string;

  @IsEnum(Company)
  company: Company;

  @IsDecimal()
  price: number;

  @IsString()
  shipName: string

  @IsInt()
  nights: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsString()
  image: string;

  @IsString()
  pdfFileURL: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => ItineraryDayDto)
  itinerary?: ItineraryDayDto[];
}
