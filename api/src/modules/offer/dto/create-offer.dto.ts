import {
  IsArray,
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

  @IsUUID()
  companyId: string;

  @IsDecimal()
  price: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsString()
  @IsOptional()
  imageFile?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => ItineraryDayDto)
  itinerary?: ItineraryDayDto[];

  @IsUUID()
  createdById?: string
}
