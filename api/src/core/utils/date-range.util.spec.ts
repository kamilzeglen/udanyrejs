import { isSameCalendarDate, isSameDateRange } from './date-range.util';

describe('isSameCalendarDate', () => {
  it('treats a bare ISO date string and a Date built from the same local calendar day as equal', () => {
    // Tak dokładnie wygląda konflikt z produkcji: Postgres ("TIMESTAMP" bez
    // strefy) zwraca lokalną północ jako Date, scraper daje gołe stringi
    // ("2026-10-04") sparsowane przez JS jako północ UTC - w strefie z
    // dodatnim przesunięciem (np. Europe/Warsaw, UTC+2) to dwie różne
    // instancje czasu, ale ten sam dzień kalendarzowy.
    const fromDatabase = new Date(2026, 9, 4); // lokalna północ 4 października
    const fromScraper = '2026-10-04';

    expect(isSameCalendarDate(fromDatabase, fromScraper)).toBe(true);
  });

  it('does not match two genuinely different calendar days', () => {
    const fromDatabase = new Date(2026, 9, 4);
    const fromScraper = '2026-10-05';

    expect(isSameCalendarDate(fromDatabase, fromScraper)).toBe(false);
  });

  it('matches two Date instances representing the same local calendar day', () => {
    const a = new Date(2026, 9, 4, 0, 0, 0);
    const b = new Date(2026, 9, 4, 13, 45, 0);

    expect(isSameCalendarDate(a, b)).toBe(true);
  });

  it('matches two bare ISO date strings that are identical', () => {
    expect(isSameCalendarDate('2026-10-04', '2026-10-04')).toBe(true);
  });
});

describe('isSameDateRange', () => {
  it('requires both start and end to match', () => {
    const existing = {
      startDate: new Date(2026, 9, 4),
      endDate: new Date(2026, 9, 11),
    };

    expect(
      isSameDateRange(existing, {
        startDate: '2026-10-04',
        endDate: '2026-10-11',
      }),
    ).toBe(true);
    expect(
      isSameDateRange(existing, {
        startDate: '2026-10-04',
        endDate: '2026-10-12',
      }),
    ).toBe(false);
  });
});
