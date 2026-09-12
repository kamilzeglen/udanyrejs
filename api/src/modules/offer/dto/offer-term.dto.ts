import {
  ArrayMinSize,
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

export class OfferTermPriceDto {
  @IsUUID()
  @IsOptional()
  cabinTypeId?: string;

  // Gdy cabinTypeId nie jest podane, rodzaj kabiny o tej nazwie zostaje
  // znaleziony (dopasowanie bez rozróżniania wielkości liter) albo utworzony
  // dla danej firmy - używane przy imporcie ze scrapera, gdy strona źródłowa
  // ma kabinę, której jeszcze nie ma w systemie.
  @IsString()
  @IsOptional()
  cabinTypeName?: string;

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

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID('all', { each: true })
  @IsOptional()
  categories?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfferTermPriceDto)
  prices: OfferTermPriceDto[];
}
