import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Company} from "@modules/company/company.entity";
import {Repository} from "typeorm";
import {City} from "@modules/city/city.entity";
import {User} from "@modules/user/user.entity";
import {CreateCityDto} from "@modules/city/dto/create-city.dto";

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {
  }

  findAll(): Promise<City[]> {
    return this.cityRepository.find();
  }

  findOneById(id: string): Promise<City> {
    return this.cityRepository.findOneBy({id});
  }

  findOneByName(name: string): Promise<City> {
    return this.cityRepository.findOneBy({name});
  }

  async createCity(
    createCityDto: CreateCityDto,
    reqCreatedBy: User,
  ): Promise<City> {

    const existingCity = await this.findOneByName(createCityDto.name);

    if (existingCity) {
      throw new NotFoundException(`City exist`);
    }

    const city = this.cityRepository.create(createCityDto);

    city.createdById = reqCreatedBy.id
    city.updatedById = reqCreatedBy.id

    return await this.cityRepository.save(city);
  }


}
