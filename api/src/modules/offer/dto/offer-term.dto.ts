import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OfferTermPriceDto {
  @IsUUID()
  cabinTypeId: string;

  // Cena w groszach (najmniejsza jednostka waluty), nie w złotych.
  @IsInt()
  @Min(0)
  price: number;
}

export class OfferTermDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfferTermPriceDto)
  prices: OfferTermPriceDto[];
}
