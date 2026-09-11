import { filterCitiesByFragment } from './filter-cities-by-fragment.util';

describe('filterCitiesByFragment', () => {
  const cities = [
    { id: 'city-1', name: 'Barcelona' },
    { id: 'city-2', name: 'Bergen' },
    { id: 'city-3', name: 'Alesund' },
  ];

  it('returns all cities when the fragment is empty', () => {
    expect(filterCitiesByFragment(cities, '')).toEqual(cities);
  });

  it('returns all cities when the fragment is only whitespace', () => {
    expect(filterCitiesByFragment(cities, '   ')).toEqual(cities);
  });

  it('matches a fragment at the start of the name, case-insensitively', () => {
    expect(filterCitiesByFragment(cities, 'ber')).toEqual([{ id: 'city-2', name: 'Bergen' }]);
  });

  it('matches a fragment anywhere in the name', () => {
    expect(filterCitiesByFragment(cities, 'lona')).toEqual([{ id: 'city-1', name: 'Barcelona' }]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterCitiesByFragment(cities, 'zzz')).toEqual([]);
  });

  it('matches multiple cities sharing the same fragment', () => {
    expect(filterCitiesByFragment(cities, 'B')).toEqual([
      { id: 'city-1', name: 'Barcelona' },
      { id: 'city-2', name: 'Bergen' },
    ]);
  });
});
