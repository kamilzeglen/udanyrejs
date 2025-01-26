import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
  @IsOptional()
  departureTime?: string;
}
