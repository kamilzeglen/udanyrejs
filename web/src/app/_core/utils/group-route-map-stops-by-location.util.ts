interface StopAtLocation {
  day: number;
  city: string;
  latitude: number;
  longitude: number;
}

export interface RouteMapLocation {
  city: string;
  latitude: number;
  longitude: number;
  days: number[];
}

export function groupRouteMapStopsByLocation(stops: StopAtLocation[]): RouteMapLocation[] {
  const locationsByKey = new Map<string, RouteMapLocation>();

  for (const stop of stops) {
    const key = `${stop.latitude},${stop.longitude}`;
    const existingLocation = locationsByKey.get(key);

    if (existingLocation) {
      existingLocation.days.push(stop.day);
      continue;
    }

    locationsByKey.set(key, {
      city: stop.city,
      latitude: stop.latitude,
      longitude: stop.longitude,
      days: [stop.day],
    });
  }

  return [...locationsByKey.values()];
}
