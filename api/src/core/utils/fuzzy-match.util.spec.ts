import { findBestMatch } from './fuzzy-match.util';

describe('findBestMatch', () => {
  const candidates = [
    { id: 'c1', name: 'MSC Cruises' },
    { id: 'c2', name: 'Norwegian Cruise Line' },
  ];

  it('matches an exact name, case-insensitively', () => {
    expect(findBestMatch('msc cruises', candidates)).toBe('c1');
  });

  it('matches a unique substring in either direction', () => {
    expect(findBestMatch('Norwegian Cruise Line - Karaiby', candidates)).toBe(
      'c2',
    );
  });

  it('returns null when nothing matches', () => {
    expect(findBestMatch('Costa Cruises', candidates)).toBeNull();
  });

  it('returns null for an empty query', () => {
    expect(findBestMatch('   ', candidates)).toBeNull();
  });

  it('returns null when the substring match is ambiguous', () => {
    const ambiguous = [
      { id: 'a1', name: 'Cruise Line A' },
      { id: 'a2', name: 'Cruise Line B' },
    ];
    expect(findBestMatch('Cruise Line', ambiguous)).toBeNull();
  });
});
