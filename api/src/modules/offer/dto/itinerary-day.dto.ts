import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class ItineraryDayDto {
  @IsNumber()
  day: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  arrivalTime?: string;

  @IsString()
  @IsOptional()
  departureTime?: string;
}
