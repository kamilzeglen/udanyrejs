import { PartialType } from '@nestjs/mapped-types';
import { CreateCabinTypeDto } from './create-cabin-type.dto';

export class UpdateCabinTypeDto extends PartialType(CreateCabinTypeDto) {}
