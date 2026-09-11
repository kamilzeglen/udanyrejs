import { findBestMatch } from './fuzzy-match.util';

describe('findBestMatch', () => {
  const candidates = [
    { id: '1', name: 'Norwegian Cruise Line' },
    { id: '2', name: 'MSC Cruises' },
    { id: '3', name: 'wewnętrzna' },
    { id: '4', name: 'zewnętrzna z balkonem' },
  ];

  it('returns the id of an exact, case-insensitive match', () => {
    expect(findBestMatch('norwegian cruise line', candidates)).toBe('1');
  });

  it('returns the id of the single candidate that contains the query', () => {
    expect(findBestMatch('wewnętrzna', candidates)).toBe('3');
  });

  it('returns the id of the single candidate whose name is contained in the query', () => {
    expect(findBestMatch('wewnętrzna (IA)', candidates)).toBe('3');
  });

  it('returns null when nothing matches', () => {
    expect(findBestMatch('Royal Caribbean', candidates)).toBeNull();
  });

  it('returns null when the query is empty', () => {
    expect(findBestMatch('', candidates)).toBeNull();
  });

  it('returns null when more than one candidate contains the query ambiguously', () => {
    const ambiguous = [
      { id: '1', name: 'zewnętrzna' },
      { id: '2', name: 'zewnętrzna z balkonem' },
    ];
    expect(findBestMatch('zewnętrzna', ambiguous)).toBe('1');
  });
});
