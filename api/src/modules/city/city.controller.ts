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
import { CityService } from './city.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { City } from '@modules/city/city.entity';
import { CreateCityDto } from '@modules/city/dto/create-city.dto';
import { UpdateCityDto } from '@modules/city/dto/update-city.dto';
import { BulkIdsDto } from '@core/dto/bulk-ids.dto';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('/')
  async getAllCities(): Promise<City[]> {
    return this.cityService.findAll();
  }

  @Get('/details/:cityId')
  async getOneCity(@Param('cityId') cityId: string): Promise<City> {
    return await this.cityService.findOneByID(cityId);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCity(
    @Body() createCityDto: CreateCityDto,
    @Req() req: { user: any },
  ): Promise<City> {
    return await this.cityService.createCity(createCityDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('/:cityId')
  async updateCity(
    @Param('cityId') cityId: string,
    @Body() updateCityDto: UpdateCityDto,
    @Req() req: { user: any },
  ): Promise<City> {
    return await this.cityService.updateCity(cityId, updateCityDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete('/:cityId')
  async removeCity(
    @Param('cityId') cityId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.cityService.removeCity(cityId, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-delete')
  async removeCities(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    return await this.cityService.removeCities(bulkIdsDto.ids, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-activate')
  async bulkActivateCities(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.cityService.bulkActivateCities(bulkIdsDto.ids, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-deactivate')
  async bulkDeactivateCities(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.cityService.bulkDeactivateCities(
      bulkIdsDto.ids,
      req.user,
    );
  }
}
