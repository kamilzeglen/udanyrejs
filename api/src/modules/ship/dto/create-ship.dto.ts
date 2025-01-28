import {IsNumber, IsOptional, IsString, IsUUID} from "class-validator";

export class CreateShipDto {

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  yearBuilt: number;

  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  tonnage: number;

  @IsNumber()
  passengersDecks: number;

  @IsNumber()
  passengers: number;

  @IsNumber()
  crew: number;

  @IsString()
  currency: string;

  @IsUUID()
  companyId: string;

  @IsString()
  @IsOptional()
  image?: any;
}
