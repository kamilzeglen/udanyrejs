import { findShipownerId, Rejsy4youShipowner } from './rejsy4you-shipowners';

const shipowners: Rejsy4youShipowner[] = [
  { id: 6, name: 'MSC Cruises' },
  { id: 1, name: 'Norwegian Cruise Line' },
  { id: 11, name: 'Royal Caribbean Cruise Line' },
];

describe('findShipownerId', () => {
  it('matches an exact name, case-insensitively', () => {
    expect(findShipownerId('msc cruises', shipowners)).toBe(6);
  });

  it('matches a unique substring', () => {
    expect(findShipownerId('Royal Caribbean', shipowners)).toBe(11);
  });

  it('returns null when nothing matches', () => {
    expect(findShipownerId('Costa Cruises', shipowners)).toBeNull();
  });

  it('returns null for an empty name', () => {
    expect(findShipownerId('   ', shipowners)).toBeNull();
  });

  it('returns null when the substring is ambiguous', () => {
    const ambiguous: Rejsy4youShipowner[] = [
      { id: 1, name: 'Cruise Line A' },
      { id: 2, name: 'Cruise Line B' },
    ];
    expect(findShipownerId('Cruise Line', ambiguous)).toBeNull();
  });

  it('defaults to the full REJSY4YOU_SHIPOWNERS list when none is passed', () => {
    expect(findShipownerId('MSC Cruises')).toBe(6);
  });
});
