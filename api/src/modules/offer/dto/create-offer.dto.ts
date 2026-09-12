import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItineraryDayDto } from './itinerary-day.dto';
import { OfferTermDto } from './offer-term.dto';

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

  @IsUUID()
  shipId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfferTermDto)
  terms: OfferTermDto[];

  @IsString()
  @IsOptional()
  image?: any;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDayDto)
  itinerary?: ItineraryDayDto[];
}
