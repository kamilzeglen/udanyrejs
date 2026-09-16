import { groupRouteMapStopsByLocation } from './group-route-map-stops-by-location.util';

describe('groupRouteMapStopsByLocation', () => {
  it('merges consecutive stops sharing the same coordinates into one location with both days', () => {
    const stops = [
      { day: 10, city: 'Stambuł', latitude: 41.00824, longitude: 28.97836 },
      { day: 11, city: 'Stambuł', latitude: 41.00824, longitude: 28.97836 },
    ];

    const result = groupRouteMapStopsByLocation(stops);

    expect(result).toEqual([{ city: 'Stambuł', latitude: 41.00824, longitude: 28.97836, days: [10, 11] }]);
  });

  it('keeps stops at different coordinates as separate locations, in first-seen order', () => {
    const stops = [
      { day: 1, city: 'Civitavecchia', latitude: 42.09325, longitude: 11.79674 },
      { day: 2, city: 'Livorno', latitude: 43.54427, longitude: 10.32615 },
    ];

    const result = groupRouteMapStopsByLocation(stops);

    expect(result).toEqual([
      { city: 'Civitavecchia', latitude: 42.09325, longitude: 11.79674, days: [1] },
      { city: 'Livorno', latitude: 43.54427, longitude: 10.32615, days: [2] },
    ]);
  });

  it('groups revisits of the same coordinates even when not adjacent in the itinerary', () => {
    const stops = [
      { day: 1, city: 'Barcelona', latitude: 41.38879, longitude: 2.15899 },
      { day: 2, city: 'Livorno', latitude: 43.54427, longitude: 10.32615 },
      { day: 8, city: 'Barcelona', latitude: 41.38879, longitude: 2.15899 },
    ];

    const result = groupRouteMapStopsByLocation(stops);

    expect(result).toEqual([
      { city: 'Barcelona', latitude: 41.38879, longitude: 2.15899, days: [1, 8] },
      { city: 'Livorno', latitude: 43.54427, longitude: 10.32615, days: [2] },
    ]);
  });
});
