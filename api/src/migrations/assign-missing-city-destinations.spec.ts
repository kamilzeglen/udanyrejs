import {
  CITY_DESTINATION_ASSIGNMENTS,
  AssignMissingCityDestinations1789320000000,
} from './1789320000000-AssignMissingCityDestinations';
import { QueryRunner } from 'typeorm';

describe('AssignMissingCityDestinations1789320000000', () => {
  it('assigns a destination to every current geographic location without one', () => {
    expect(CITY_DESTINATION_ASSIGNMENTS).toEqual(
      expect.arrayContaining([
        ['Argostoli', 'Wyspy Greckie'],
        ['Bari', 'Morze Adriatyckie'],
        ['Cagliari', 'Morze Śródziemne'],
        ['Eidfjord', 'Norweskie Fiordy'],
        ['Fredericia', 'Morze Bałtyckie'],
        ['Geiranger', 'Norweskie Fiordy'],
        ['Geirangerfjord', 'Norweskie Fiordy'],
        ['Głębia Calypso', 'Morze Śródziemne'],
        ['Haugesund', 'Norweskie Fiordy'],
        ['Hilo', 'Hawaje'],
        ['Ketchikan', 'Alaska'],
        ['Kopenhaga', 'Morze Bałtyckie'],
        ['Kristiansand', 'Norweskie Fiordy'],
        ['Lido', 'Morze Śródziemne'],
        ['Marghera', 'Morze Śródziemne'],
        ['Newport', 'Kanada i Nowa Anglia'],
        ['Puerto Plata', 'Karaiby'],
        ['Santorini', 'Wyspy Greckie'],
        ['Savona', 'Morze Śródziemne'],
        ['Seyne Sur Mer', 'Morze Śródziemne'],
        ['St. Thomas', 'Karaiby'],
        ['Tortola', 'Karaiby'],
        ['Vik', 'Norweskie Fiordy'],
        ['Warnemunde', 'Morze Bałtyckie'],
        ['Zatoka Lodowców', 'Alaska'],
        ['Zatoka Palma', 'Morze Śródziemne'],
      ]),
    );
  });

  it('creates each assignment only once', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await new AssignMissingCityDestinations1789320000000().up({
      query,
    } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledTimes(CITY_DESTINATION_ASSIGNMENTS.length);
    expect(query.mock.calls[0][0]).toContain('ON CONFLICT DO NOTHING');
  });
});
