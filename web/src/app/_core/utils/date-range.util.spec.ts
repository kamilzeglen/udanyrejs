import { isSameCalendarDate } from './date-range.util';

describe('isSameCalendarDate', () => {
  it('treats a bare date string and the UTC-shifted ISO datetime the API returns for it as the same day', () => {
    // API zwraca lokalną północ (tak zapisaną w Postgresie) zserializowaną
    // przez JSON.stringify/toISOString - dokładnie to symuluje poniższe
    // new Date(2026, 9, 4).toISOString(), niezależnie od strefy czasowej,
    // w której akurat działa ten test.
    const asReturnedByApi = new Date(2026, 9, 4).toISOString();
    expect(isSameCalendarDate(asReturnedByApi, '2026-10-04')).toBe(true);
  });

  it('returns false for genuinely different days', () => {
    expect(isSameCalendarDate('2026-10-04', '2026-10-05')).toBe(false);
  });
});
