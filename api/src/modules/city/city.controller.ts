import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {CityService} from './city.service';
import {AuthGuard} from "@modules/auth/guards/auth.guard";
import {CreateCompanyDto} from "@modules/company/dto/create-offer.dto";
import {CreateCityDto} from "@modules/city/dto/create-city.dto";

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {
  }


  @Get('/')
  getAllCities() {
    return this.cityService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post('/')
  createCity(
    @Body() createCityDto: CreateCityDto,
    @Req() req: { user: any },
  ) {
    return this.cityService.createCity(createCityDto, req.user);
  }
}
