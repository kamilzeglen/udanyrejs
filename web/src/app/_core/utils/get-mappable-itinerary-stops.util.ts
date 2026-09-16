interface StopWithOptionalCoordinates {
  latitude?: number;
  longitude?: number;
}

interface StopWithCoordinates {
  latitude: number;
  longitude: number;
}

export function getMappableItineraryStops<T extends StopWithOptionalCoordinates>(
  stops: T[],
): (T & StopWithCoordinates)[] {
  return stops.filter(
    (stop): stop is T & StopWithCoordinates => typeof stop.latitude === 'number' && typeof stop.longitude === 'number',
  );
}
