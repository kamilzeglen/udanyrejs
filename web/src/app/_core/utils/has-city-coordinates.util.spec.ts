import { hasCityCoordinates } from './has-city-coordinates.util';

describe('hasCityCoordinates', () => {
  it('returns true when latitude and longitude are provided', () => {
    expect(hasCityCoordinates({ latitude: 54.5189, longitude: 18.5305 })).toBeTrue();
  });

  it('returns false when one of the coordinates is missing', () => {
    expect(hasCityCoordinates({ latitude: 54.5189, longitude: null })).toBeFalse();
  });
});
