import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from '@modules/company/dto/create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
