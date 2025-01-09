import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {ShipService} from './ship.service';
import {AuthGuard} from "@modules/auth/guards/auth.guard";
import {AnyFilesInterceptor} from "@nestjs/platform-express";
import {UpdateShipDto} from "@modules/ship/dto/update-ship.dto";
import {CreateShipDto} from "@modules/ship/dto/create-ship.dto";
import {Ship} from "@modules/ship/ship.entity";

@Controller('ship')
export class ShipController {
  constructor(private readonly shipService: ShipService) {}

  @Get('/details/:shipId')
  async getOneOffer(@Param('shipId') shipId: string): Promise<any[]> {
    return await this.shipService.findOne(shipId);
  }

  @Get(':companyId')
  async findShipsByCompany(@Param('companyId') companyId: string) {
    return this.shipService.findShipsByCompany(companyId);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  @UseInterceptors(AnyFilesInterceptor())
  async createShip(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createShipDto: CreateShipDto,
    @Req() req: { user: any },
  ): Promise<Ship> {
    const imageFile = files.find((file) => file.fieldname === 'image');

    return await this.shipService.createShip(createShipDto, req.user, imageFile);
  }

  @UseGuards(AuthGuard)
  @Post('/:shipId')
  @UseInterceptors(AnyFilesInterceptor())
  async updateShip(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('shipId') shipId: string,
    @Body() updateShipDto: UpdateShipDto,
    @Req() req: { user: any },
  ): Promise<Ship> {
    const imageFile = files.find((file) => file.fieldname === 'image');

    return await this.shipService.updateShip(shipId, updateShipDto, req.user, imageFile);
  }

  @UseGuards(AuthGuard)
  @Delete('/:shipId')
  async removeCompany(@Param('shipId') shipId: string): Promise<boolean> {
    return await this.shipService.removeShip(shipId);
  }
}
