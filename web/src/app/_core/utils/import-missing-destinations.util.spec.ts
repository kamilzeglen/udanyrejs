import { matchDestinationIdsForCities } from './import-missing-destinations.util';

describe('matchDestinationIdsForCities', () => {
  const cities = [
    { id: 'city-1', name: 'Barcelona', destinations: [{ id: 'dest-med' }] },
    { id: 'city-2', name: 'Ateny', destinations: [{ id: 'dest-med' }, { id: 'dest-greece' }] },
    { id: 'city-3', name: 'Bez regionu', destinations: [] },
  ];

  it('returns the destination ids of matched cities', () => {
    const result = matchDestinationIdsForCities(['Barcelona'], cities);

    expect(result).toEqual(['dest-med']);
  });

  it('merges destinations from multiple matched cities without duplicates', () => {
    const result = matchDestinationIdsForCities(['Barcelona', 'Ateny'], cities);

    expect(result.sort()).toEqual(['dest-greece', 'dest-med'].sort());
  });

  it('ignores city names with no match', () => {
    const result = matchDestinationIdsForCities(['Nieznane Miasto'], cities);

    expect(result).toEqual([]);
  });

  it('ignores matched cities with no assigned region', () => {
    const result = matchDestinationIdsForCities(['Bez regionu'], cities);

    expect(result).toEqual([]);
  });

  it('returns an empty array when there are no city names', () => {
    const result = matchDestinationIdsForCities([], cities);

    expect(result).toEqual([]);
  });
});
