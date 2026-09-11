import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '@modules/city/city.entity';
import { User } from '@modules/user/user.entity';
import { CreateCityDto } from '@modules/city/dto/create-city.dto';
import { UpdateCityDto } from '@modules/city/dto/update-city.dto';
import { UserService } from '@modules/user/user.service';
import { DestinationService } from '@modules/destination/destination.service';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly userService: UserService,
    private readonly destinationService: DestinationService,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<City[]> {
    return await this.cityRepository
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.destinations', 'destinations')
      .getMany();
  }

  async findOneByID(id: string): Promise<City> {
    return await this.cityRepository
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.destinations', 'destinations')
      .where('city.id = :id', { id })
      .getOne();
  }

  async createCity(
    createCityDto: CreateCityDto,
    reqCreatedBy: User,
  ): Promise<City> {
    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    const destinations = createCityDto.destinations?.length
      ? await this.destinationService.findByIds(createCityDto.destinations)
      : [];

    const city = this.cityRepository.create({
      name: createCityDto.name,
      destinations,
      createdBy,
    });

    await this.logService.createLog(
      'Dodano miasto: ' + city.name,
      reqCreatedBy.email,
    );

    return await this.cityRepository.save(city);
  }

  async updateCity(
    id: string,
    updateCityDto: UpdateCityDto,
    reqCreatedBy: User,
  ): Promise<City> {
    const city = await this.cityRepository
      .createQueryBuilder('city')
      .where('city.id = :id', { id })
      .getOne();

    if (!city) {
      throw new AppException(API_ERRORS.CITY_NOT_FOUND, { id });
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    if (updateCityDto.name !== undefined) {
      city.name = updateCityDto.name;
    }

    if (updateCityDto.destinations !== undefined) {
      city.destinations = updateCityDto.destinations.length
        ? await this.destinationService.findByIds(updateCityDto.destinations)
        : [];
    }

    city.updatedBy = updatedBy;

    await this.logService.createLog(
      'Zaktualizowano miasto: ' + city.name + ' (' + city.id + ')',
      reqCreatedBy.email,
    );

    return await this.cityRepository.save(city);
  }

  async findOrCreateByName(name: string, actorEmail: string): Promise<City> {
    const trimmedName = name.trim();

    const existing = await this.cityRepository
      .createQueryBuilder('city')
      .where('LOWER(city.name) = LOWER(:name)', { name: trimmedName })
      .getOne();

    if (existing) {
      return existing;
    }

    const createdBy = await this.userService.findOneByEmail(actorEmail);
    const city = this.cityRepository.create({
      name: trimmedName,
      destinations: [],
      createdBy,
    });

    await this.logService.createLog(
      'Automatycznie dodano miasto: ' + trimmedName,
      actorEmail,
    );

    try {
      return await this.cityRepository.save(city);
    } catch (error) {
      const raceWinner = await this.cityRepository
        .createQueryBuilder('city')
        .where('LOWER(city.name) = LOWER(:name)', { name: trimmedName })
        .getOne();

      if (raceWinner) {
        return raceWinner;
      }

      throw error;
    }
  }

  async removeCity(cityId: string, reqCreatedBy: User): Promise<boolean> {
    const city = await this.cityRepository
      .createQueryBuilder('city')
      .where('city.id = :cityId', { cityId })
      .getOne();

    if (!city) {
      throw new AppException(API_ERRORS.CITY_NOT_FOUND, { id: cityId });
    }

    await this.logService.createLog(
      'Usunięto miasto: ' + city.name + ' (' + city.id + ')',
      reqCreatedBy.email,
    );

    await this.cityRepository
      .createQueryBuilder()
      .delete()
      .from(City)
      .where('id = :cityId', { cityId })
      .execute();

    return true;
  }
}
