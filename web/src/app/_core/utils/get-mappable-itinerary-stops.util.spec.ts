import { getMappableItineraryStops } from './get-mappable-itinerary-stops.util';

describe('getMappableItineraryStops', () => {
  interface TestStop {
    day: number;
    city: string;
    latitude: number;
    longitude: number;
  }

  it('keeps only stops with both coordinates, in the original order', () => {
    const stops: TestStop[] = [
      { day: 1, city: 'Gdynia', latitude: 54.5, longitude: 18.5 },
      { day: 2, city: 'Nieznane', latitude: null, longitude: null },
      { day: 3, city: 'Kopenhaga', latitude: 55.6, longitude: 12.5 },
    ];

    const result = getMappableItineraryStops(stops);

    expect(result).toEqual([
      { day: 1, city: 'Gdynia', latitude: 54.5, longitude: 18.5 },
      { day: 3, city: 'Kopenhaga', latitude: 55.6, longitude: 12.5 },
    ]);
  });

  it('drops a stop missing only one of the two coordinates', () => {
    const stops: TestStop[] = [{ day: 1, city: 'Gdynia', latitude: 54.5, longitude: null }];

    const result = getMappableItineraryStops(stops);

    expect(result).toEqual([]);
  });

  it('returns an empty array when given no stops', () => {
    expect(getMappableItineraryStops([])).toEqual([]);
  });
});
