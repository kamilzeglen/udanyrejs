import { IsArray, IsString } from 'class-validator';

export class CreateCitiesDto {
  @IsArray()
  @IsString({ each: true })
  cities: string[];
}
