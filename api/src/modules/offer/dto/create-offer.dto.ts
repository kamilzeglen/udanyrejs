import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from "class-validator";
import {Type} from "class-transformer";
import {CreateItineraryDto} from "@modules/itinerary/dto/create-itinerary.dto";

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

  @IsUUID('all', { each: true })
  @IsOptional()
  destinations?: string[];

  @IsUUID('all', { each: true })
  @IsOptional()
  categories?: string[];

  @IsNumber()
  price: number;

  @IsUUID()
  shipId: string

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItineraryDto)
  itinerary?: CreateItineraryDto[];
}
