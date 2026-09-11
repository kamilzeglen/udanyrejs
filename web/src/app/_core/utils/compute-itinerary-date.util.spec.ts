import { computeItineraryDate } from './compute-itinerary-date.util';

describe('computeItineraryDate', () => {
  it('returns the term start date itself for day 1', () => {
    const result = computeItineraryDate('2027-01-10', 1);

    expect(result?.toISOString().slice(0, 10)).toBe('2027-01-10');
  });

  it('adds (dayNumber - 1) days to the term start date', () => {
    const result = computeItineraryDate('2027-01-10', 5);

    expect(result?.toISOString().slice(0, 10)).toBe('2027-01-14');
  });

  it('rolls over into the next month correctly', () => {
    const result = computeItineraryDate('2027-01-30', 3);

    expect(result?.toISOString().slice(0, 10)).toBe('2027-02-01');
  });

  it('returns null when the term start date is missing', () => {
    expect(computeItineraryDate(null, 1)).toBeNull();
  });

  it('returns null when the term start date is invalid', () => {
    expect(computeItineraryDate('not-a-date', 1)).toBeNull();
  });

  it('returns null when the day number is missing', () => {
    expect(computeItineraryDate('2027-01-10', null)).toBeNull();
  });
});
