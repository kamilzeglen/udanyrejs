import {IsDateString, IsNumber, IsOptional, IsString, IsUUID} from "class-validator";

export class CreateItineraryDto {
  @IsNumber()
  day: number;

  @IsString()
  @IsDateString()
  date: string;

  @IsUUID()
  @IsOptional()
  port: string;

  @IsString()
  @IsOptional()
  arrivalTime?: string;

  @IsString()
  @IsOptional()
  departureTime?: string;
}



