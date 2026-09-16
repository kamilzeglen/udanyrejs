export interface CityCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export function hasCityCoordinates(city: CityCoordinates): boolean {
  return city.latitude !== null && city.longitude !== null;
}
