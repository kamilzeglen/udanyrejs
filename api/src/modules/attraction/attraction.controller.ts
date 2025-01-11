import { Controller } from '@nestjs/common';
import { AttractionService } from './attraction.service';


@Controller('attraction')
export class AttractionController {
  constructor(private readonly attractionService: AttractionService) {}
}
