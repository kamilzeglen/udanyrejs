import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CityService } from './city.service';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { CreateCityDto } from './dto/create-city.dto';
import { CreateCitiesDto } from './dto/create-cities.dto';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('/')
  getAllCities() {
    return this.cityService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post('/')
  createCity(@Body() createCityDto: CreateCityDto, @Req() req: { user: any }) {
    return this.cityService.createCity(createCityDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/many')
  createCities(
    @Body() createCitiesDto: CreateCitiesDto,
    @Req() req: { user: any },
  ) {
    return this.cityService.createCities(createCitiesDto, req.user);
  }
}
