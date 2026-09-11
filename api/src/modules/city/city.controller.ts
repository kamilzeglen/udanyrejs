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
}
