import { QueryRunner } from 'typeorm';
import {
  BackfillMissingShipData1789360000000,
  SHIP_DATA_CORRECTIONS,
} from './1789360000000-BackfillMissingShipData';

describe('BackfillMissingShipData1789360000000', () => {
  it('includes every ship with missing technical data', () => {
    expect(SHIP_DATA_CORRECTIONS.map(({ name }) => name)).toEqual([
      'AIDAdiva',
      'AIDAluna',
      'AIDAmar',
      'AIDAsol',
      'Adventure of the Seas',
      'Allure of the Seas',
      'Brilliance of the Seas',
      'Enchantment of the Seas',
      'Explorer of the Seas',
      'Freedom of the Seas',
      'Grandeur of the Seas',
      'Harmony of the Seas',
      'Independence of the Seas',
      'Jewel of the Seas',
      'Liberty of the Seas',
      'MEIN SCHIFF 1',
      'MEIN SCHIFF 5',
      'MEIN SCHIFF 6',
      'MSC Sinfonia',
      'MSC World America',
      'Mariner of the Seas',
      'Navigator of the Seas',
      'Norwegian Luna',
      'Norwegian Prima',
      'Oasis of the Seas',
      'Quantum of the Seas',
      'Radiance of the Seas',
      'Rhapsody of the Seas',
      'Serenade of the Seas',
      'Spectrum of the Seas',
      'Symphony of the Seas',
      'Vision of the Seas',
      'Voyager of the Seas',
      'Wonder of the Seas',
    ]);
  });

  it('adds Wonder of the Seas description and technical data without overwriting filled fields', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new BackfillMissingShipData1789360000000().up({
      query,
    } as unknown as QueryRunner);

    const wonder = SHIP_DATA_CORRECTIONS.find(
      ({ name }) => name === 'Wonder of the Seas',
    );
    const wonderCall = query.mock.calls.find(([, parameters]) =>
      parameters.includes('Wonder of the Seas'),
    );

    expect(wonder?.description).toBeTruthy();
    expect(wonder?.yearBuilt).toBe(2022);
    expect(wonder?.length).toBe(362);
    expect(wonder?.width).toBe(65);
    expect(wonder?.tonnage).toBe(235600);
    expect(wonder?.passengers).toBe(5734);
    expect(wonder?.crew).toBe(2204);
    expect(wonder?.passengersDecks).toBe(16);
    expect(wonderCall[0]).toContain('"description" IS NULL');
    expect(wonderCall[0]).toContain('$2::text');
    expect(wonderCall[0]).toContain('"yearBuilt" IS NULL');
  });
});
