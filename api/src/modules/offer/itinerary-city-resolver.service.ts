import { Injectable } from '@nestjs/common';
import { CityService } from '@modules/city/city.service';

@Injectable()
export class ItineraryCityResolverService {
  constructor(private readonly cityService: CityService) {}

  async resolve<T extends { city: string }>(
    itinerary: T[] | undefined,
    actorEmail: string,
  ): Promise<(T & { cityId: string })[] | undefined> {
    if (!itinerary?.length) {
      return itinerary as (T & { cityId: string })[] | undefined;
    }

    const resolvedDays: (T & { cityId: string })[] = [];

    for (const day of itinerary) {
      const city = await this.cityService.findOrCreateByName(
        day.city,
        actorEmail,
      );

      resolvedDays.push({ ...day, city: city.name, cityId: city.id });
    }

    return resolvedDays;
  }
}
