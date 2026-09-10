import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DestinationService } from './destination.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { Destination } from '@modules/destination/destination.entity';
import { CreateDestinationDto } from '@modules/destination/dto/create-destination.dto';
import { UpdateDestinationDto } from '@modules/destination/dto/update-destination.dto';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get('/')
  async getAllCategories(): Promise<Destination[]> {
    return this.destinationService.findAll();
  }

  @Get('/details/:destinationID')
  async getOneCategory(
    @Param('destinationID') destinationID: string,
  ): Promise<Destination> {
    return await this.destinationService.findOneByID(destinationID);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCategory(
    @Body() createDestinationDto: CreateDestinationDto,
    @Req() req: { user: any },
  ): Promise<Destination> {
    return await this.destinationService.createDestination(
      createDestinationDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:destinationID')
  async updateCompany(
    @Param('destinationID') destinationID: string,
    @Body() updateDestinationDto: UpdateDestinationDto,
    @Req() req: { user: any },
  ): Promise<Destination> {
    return await this.destinationService.updateDestination(
      destinationID,
      updateDestinationDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:destinationID')
  async removeCompany(
    @Param('destinationID') destinationID: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.destinationService.removeDestination(
      destinationID,
      req.user,
    );
  }
}
