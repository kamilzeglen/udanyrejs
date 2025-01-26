import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Itinerary } from '@modules/itinerary/itinerary.entity';
import { DataSource, Repository } from 'typeorm';
import { Offer } from '@modules/offer/offer.entity';
import { CityService } from '@modules/city/city.service';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class ItineraryService {
  constructor(
    @InjectRepository(Itinerary)
    private itineraryRepository: Repository<Itinerary>,
    private readonly cityService: CityService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async createItineraries(
    itineraryData: any[],
    offer: Offer,
    createdById: string,
  ): Promise<Itinerary[]> {
    const itineraries = [];

    for (const itineraryItem of itineraryData) {
      const { day, date, port, arrivalTime, departureTime } = itineraryItem;

      if (!offer.id) {
        throw new NotFoundException(`Offer with ID ${offer.id} not found`);
      }

      // Pobranie miasta na podstawie UUID portu
      const city = await this.cityService.findOneById(port);

      // Tworzenie nowej trasy
      const itinerary = new Itinerary();
      itinerary.day = day;
      itinerary.date = date;
      itinerary.city = city;
      itinerary.cityId = city ? city.id : null;
      itinerary.arrivalTime = arrivalTime;
      itinerary.departureTime = departureTime;
      itinerary.offerId = offer.id;
      itinerary.offer = offer;
      itinerary.createdById = createdById;
      itinerary.createdBy = await this.userService.findOneById(createdById);
      itinerary.updatedById = createdById;
      itinerary.updatedBy = await this.userService.findOneById(createdById);
      itinerary.createdAt = new Date();
      itinerary.updatedAt = new Date();

      itineraries.push(itinerary);
    }

    // Zapisanie wszystkich tras do bazy danych
    return await this.itineraryRepository.save(itineraries);
  }

  async updateItineraries(
    itineraryData: any[],
    offer: Offer,
    createdById: string,
  ): Promise<Itinerary[]> {
    const itineraries = [];

    // Użycie transakcji
    await this.dataSource.transaction(async (manager) => {
      // Usuń istniejące trasy w ramach transakcji
      await manager.delete(Itinerary, { offerId: offer.id });

      for (const itineraryItem of itineraryData) {
        const { day, date, port, arrivalTime, departureTime } = itineraryItem;

        if (!offer.id) {
          throw new Error(`Offer with ID ${offer.id} not found`);
        }

        // Pobranie miasta na podstawie UUID portu
        const city = await this.cityService.findOneById(port);

        // Tworzenie nowej trasy
        const itinerary = new Itinerary();
        itinerary.day = day;
        itinerary.date = date;
        itinerary.city = city;
        itinerary.cityId = city ? city.id : null;
        itinerary.arrivalTime = arrivalTime;
        itinerary.departureTime = departureTime;
        itinerary.offerId = offer.id;
        itinerary.offer = offer;
        itinerary.createdById = createdById;
        itinerary.createdBy = await this.userService.findOneById(createdById);
        itinerary.updatedById = createdById;
        itinerary.updatedBy = await this.userService.findOneById(createdById);
        itinerary.createdAt = new Date();
        itinerary.updatedAt = new Date();

        if (!itinerary.offerId) {
          throw new Error(
            `offerId is missing for itinerary item with day ${itinerary.day}`,
          );
        }

        // Dodajemy trasę do tablicy, aby potem zapisać je w ramach jednej transakcji
        itineraries.push(itinerary);
      }

      // Zapisanie wszystkich tras do bazy danych w ramach tej samej transakcji
      await manager.save(Itinerary, itineraries);
    });

    return itineraries;
  }

  async deleteItineraries(offer: Offer): Promise<void> {
    await this.itineraryRepository
      .createQueryBuilder()
      .delete()
      .where('offerId = :offerId', { offerId: offer.id })
      .execute();
  }
}
