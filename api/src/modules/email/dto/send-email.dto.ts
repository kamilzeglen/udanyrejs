import { IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  offerURL?: string;

  @IsString()
  message: string;
}
