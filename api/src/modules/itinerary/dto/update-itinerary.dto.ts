import { PartialType } from '@nestjs/mapped-types';
import {CreateItineraryDto} from "@modules/itinerary/dto/create-itinerary.dto";

export class UpdateItineraryDto extends PartialType(CreateItineraryDto) {}
