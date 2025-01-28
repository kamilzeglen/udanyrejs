import { PartialType } from '@nestjs/mapped-types';
import {CreateCompanyDto} from './create-offer.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
}
