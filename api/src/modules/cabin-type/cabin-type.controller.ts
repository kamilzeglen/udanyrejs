import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CabinTypeService } from './cabin-type.service';
import { CabinType } from './cabin-type.entity';
import { AuthGuard } from '@core/guards/auth.guard';
import { CreateCabinTypeDto } from './dto/create-cabin-type.dto';
import { UpdateCabinTypeDto } from './dto/update-cabin-type.dto';

@Controller('cabin-type')
export class CabinTypeController {
  constructor(private readonly cabinTypeService: CabinTypeService) {}

  @Get('/details/:cabinTypeId')
  async getOneCabinType(
    @Param('cabinTypeId') cabinTypeId: string,
  ): Promise<CabinType> {
    return await this.cabinTypeService.findOneById(cabinTypeId);
  }

  @Get('/:companyId')
  async getCabinTypesByCompany(
    @Param('companyId') companyId: string,
  ): Promise<CabinType[]> {
    return await this.cabinTypeService.findAllByCompany(companyId);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCabinType(
    @Body() createCabinTypeDto: CreateCabinTypeDto,
    @Req() req: { user: any },
  ): Promise<CabinType> {
    return await this.cabinTypeService.createCabinType(
      createCabinTypeDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:cabinTypeId')
  async updateCabinType(
    @Param('cabinTypeId') cabinTypeId: string,
    @Body() updateCabinTypeDto: UpdateCabinTypeDto,
    @Req() req: { user: any },
  ): Promise<CabinType> {
    return await this.cabinTypeService.updateCabinType(
      cabinTypeId,
      updateCabinTypeDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/:cabinTypeId/deactivate')
  async deactivateCabinType(
    @Param('cabinTypeId') cabinTypeId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.cabinTypeService.deactivateCabinType(
      cabinTypeId,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/:cabinTypeId/activate')
  async activateCabinType(
    @Param('cabinTypeId') cabinTypeId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.cabinTypeService.activateCabinType(cabinTypeId, req.user);
  }
}
