import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ShipService } from './ship.service';

@Controller('ship')
export class ShipController {
  constructor(private readonly shipService: ShipService) {}

  @Post(':companyId')
  async createShip(
    @Param('companyId') companyId: string,
    @Body() createShipDto: { name: string; code: string },
  ) {
    return this.shipService.createShip(companyId, createShipDto.name, createShipDto.code);
  }

  @Get(':companyId')
  async findShipsByCompany(@Param('companyId') companyId: string) {
    return this.shipService.findShipsByCompany(companyId);
  }

  @Delete(':shipId')
  async deleteShip(@Param('shipId') shipId: string) {
    return this.shipService.deleteShip(shipId);
  }
}
