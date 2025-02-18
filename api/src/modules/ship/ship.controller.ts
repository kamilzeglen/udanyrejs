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
import { ShipService } from './ship.service';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { UpdateShipDto } from '@modules/ship/dto/update-ship.dto';
import { CreateShipDto } from '@modules/ship/dto/create-ship.dto';
import { Ship } from '@modules/ship/ship.entity';

@Controller('ship')
export class ShipController {
  constructor(private readonly shipService: ShipService) {}

  @Get('/details/id/:shipId')
  async getOneOfferById(@Param('shipId') shipId: string): Promise<Ship> {
    return await this.shipService.findOneById(shipId);
  }
  @Get('/details/name/:shipName')
  async getOneOfferByName(@Param('shipName') shipName: string): Promise<Ship> {
    return await this.shipService.findOneByName(shipName);
  }

  @Get('/:companyId')
  async findShipsByCompany(@Param('companyId') companyId: string) {
    return this.shipService.findShipsByCompany(companyId);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createShip(
    @Body() createShipDto: CreateShipDto,
    @Req() req: { user: any },
  ): Promise<Ship> {
    return await this.shipService.createShip(createShipDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('/:shipId')
  async updateShip(
    @Param('shipId') shipId: string,
    @Body() updateShipDto: UpdateShipDto,
    @Req() req: { user: any },
  ): Promise<Ship> {
    return await this.shipService.updateShip(shipId, updateShipDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete('/:shipId')
  async removeCompany(
    @Param('shipId') shipId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.shipService.removeShip(shipId, req.user);
  }
}
