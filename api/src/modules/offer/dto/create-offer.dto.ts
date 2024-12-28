import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from "class-validator";
import {Type} from "class-transformer";
import {ItineraryDayDto} from "./itinerary-day.dto";

export class CreateOfferDto {

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  offerUrl?: string;

  @IsBoolean()
  @IsOptional()
  syncData?: boolean;

  @IsUUID()
  companyId: string;

  @IsDecimal()
  price: number;

  @IsString()
  shipId: string

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsString()
  @IsOptional()
  image?: any;

  @IsArray()
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => ItineraryDayDto)
  itinerary?: ItineraryDayDto[];
}
