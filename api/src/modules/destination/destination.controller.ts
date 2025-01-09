import {Controller, Get} from '@nestjs/common';
import {DestinationService} from './destination.service';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {
  }

  @Get('/')
  async findAll() {
    return this.destinationService.findAll();
  }
}
