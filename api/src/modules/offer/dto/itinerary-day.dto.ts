import {IsString, IsNumber, IsOptional, IsDateString} from 'class-validator';

export class ItineraryDayDto {
  @IsNumber()
  day: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  port?: string;

  @IsString()
  @IsOptional()
  arrivalTime?: string;

  @IsString()
  @IsOptional()
  departureTime?: string;
}
