import { resolveMissingDestinationIds } from './import-missing-destinations.util';

describe('resolveMissingDestinationIds', () => {
  const cities = [
    { id: 'city-1', name: 'Barcelona', destinations: [{ id: 'dest-med' }] },
    { id: 'city-2', name: 'Ateny', destinations: [{ id: 'dest-med' }, { id: 'dest-greece' }] },
    { id: 'city-3', name: 'Bez regionu', destinations: [] },
  ];

  it('returns the destination ids of matched cities', () => {
    const result = resolveMissingDestinationIds(['Barcelona'], cities, []);

    expect(result).toEqual(['dest-med']);
  });

  it('merges destinations from multiple matched cities without duplicates', () => {
    const result = resolveMissingDestinationIds(['Barcelona', 'Ateny'], cities, []);

    expect(result.sort()).toEqual(['dest-greece', 'dest-med'].sort());
  });

  it('excludes destination ids already present in currentDestinationIds', () => {
    const result = resolveMissingDestinationIds(['Barcelona', 'Ateny'], cities, ['dest-med']);

    expect(result).toEqual(['dest-greece']);
  });

  it('ignores city names with no match', () => {
    const result = resolveMissingDestinationIds(['Nieznane Miasto'], cities, []);

    expect(result).toEqual([]);
  });

  it('ignores matched cities with no assigned region', () => {
    const result = resolveMissingDestinationIds(['Bez regionu'], cities, []);

    expect(result).toEqual([]);
  });

  it('returns an empty array when there are no city names', () => {
    const result = resolveMissingDestinationIds([], cities, []);

    expect(result).toEqual([]);
  });
});
