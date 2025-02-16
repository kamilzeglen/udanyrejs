import { IsString } from 'class-validator';

export class CreateDestinationDto {
  @IsString()
  name: string;
}
