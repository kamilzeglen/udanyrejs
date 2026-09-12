import { findBestMatch } from './fuzzy-match.util';

export interface CityWithDestinations {
  id: string;
  name: string;
  destinations: { id: string }[];
}

export function matchDestinationIdsForCities(cityNames: string[], cities: CityWithDestinations[]): string[] {
  const matchedDestinationIds = new Set<string>();

  cityNames.forEach((cityName) => {
    const matchedCityId = findBestMatch(cityName, cities);
    const matchedCity = cities.find((city) => city.id === matchedCityId);

    matchedCity?.destinations.forEach((destination) => {
      matchedDestinationIds.add(destination.id);
    });
  });

  return Array.from(matchedDestinationIds);
}
