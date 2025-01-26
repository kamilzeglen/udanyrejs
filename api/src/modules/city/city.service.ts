import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/user/user.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { City } from './city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  findAll(): Promise<City[]> {
    return this.cityRepository.find();
  }

  findOneById(id: string): Promise<City> {
    return this.cityRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<City> {
    return this.cityRepository.findOneBy({ name });
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

    city.createdById = reqCreatedBy.id;
    city.updatedById = reqCreatedBy.id;

    return await this.cityRepository.save(city);
  }

  async createCities(
    createCityDto: { cities: string[] },
    reqCreatedBy: User,
  ): Promise<City[]> {
    const citiesToAdd: City[] = [];
    const existingCities: City[] = [];

    for (const cityName of createCityDto.cities) {
      // Sprawdź, czy miasto już istnieje
      const existingCity = await this.findOneByName(cityName);

      if (existingCity) {
        existingCities.push(existingCity);
        continue; // Jeśli istnieje, pomijamy je
      }

      // Utwórz nowe miasto, jeśli nie istnieje
      const city = this.cityRepository.create({ name: cityName });
      city.createdById = reqCreatedBy.id;
      city.updatedById = reqCreatedBy.id;

      citiesToAdd.push(city);
    }

    // Zapisz wszystkie nowe miasta w bazie danych
    if (citiesToAdd.length > 0) {
      await this.cityRepository.save(citiesToAdd);
    }

    // Zwróć zarówno istniejące, jak i nowo dodane miasta
    return this.cityRepository.find();
  }
}
