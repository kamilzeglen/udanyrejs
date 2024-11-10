import { IsString, IsNumber } from 'class-validator';

export class ItineraryDayDto {
  @IsNumber()
  day: number;

  @IsString()
  date: string;

  @IsString()
  port: string;

  @IsString()
  arrivalTime: string;

  @IsString()
  departureTime: string;
}
