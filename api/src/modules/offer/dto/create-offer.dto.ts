import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItineraryDayDto } from './itinerary-day.dto';

export class CreateOfferDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  offerUrl?: string;

  @IsBoolean()
  @IsOptional()
  syncData?: boolean;

  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;

  @IsUUID()
  companyId: string;

  @IsUUID('all', { each: true })
  @IsOptional()
  destinations?: string[];

  @IsUUID('all', { each: true })
  @IsOptional()
  categories?: string[];

  // Cena w groszach (najmniejsza jednostka waluty), nie w złotych.
  @IsInt()
  @Min(0)
  price: number;

  @IsUUID()
  shipId: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsString()
  @IsOptional()
  image?: any;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDayDto)
  itinerary?: ItineraryDayDto[];
}
