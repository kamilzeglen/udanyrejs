import { Test } from '@nestjs/testing';
import { ItineraryCityResolverService } from './itinerary-city-resolver.service';
import { CityService } from '@modules/city/city.service';

describe('ItineraryCityResolverService', () => {
  let service: ItineraryCityResolverService;
  let cityService: { findOrCreateByName: jest.Mock };

  beforeEach(async () => {
    cityService = { findOrCreateByName: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ItineraryCityResolverService,
        { provide: CityService, useValue: cityService },
      ],
    }).compile();

    service = moduleRef.get(ItineraryCityResolverService);
  });

  it('returns an undefined itinerary unchanged', async () => {
    const result = await service.resolve(undefined, 'admin@udanyrejs.pl');

    expect(result).toBeUndefined();
    expect(cityService.findOrCreateByName).not.toHaveBeenCalled();
  });

  it('returns an empty itinerary unchanged', async () => {
    const result = await service.resolve([], 'admin@udanyrejs.pl');

    expect(result).toEqual([]);
    expect(cityService.findOrCreateByName).not.toHaveBeenCalled();
  });

  it('attaches the resolved city id and canonical name to each day', async () => {
    cityService.findOrCreateByName.mockResolvedValueOnce({
      id: 'city-1',
      name: 'Gdynia',
    });

    const result = await service.resolve(
      [
        {
          day: 1,
          date: '2027-01-01',
          city: '  gdynia  ',
          arrivalTime: '',
          departureTime: '10:00',
        },
      ],
      'admin@udanyrejs.pl',
    );

    expect(cityService.findOrCreateByName).toHaveBeenCalledWith(
      '  gdynia  ',
      'admin@udanyrejs.pl',
    );
    expect(result).toEqual([
      {
        day: 1,
        date: '2027-01-01',
        city: 'Gdynia',
        arrivalTime: '',
        departureTime: '10:00',
        cityId: 'city-1',
      },
    ]);
  });

  it('resolves each day independently, preserving order', async () => {
    cityService.findOrCreateByName
      .mockResolvedValueOnce({ id: 'city-1', name: 'Gdynia' })
      .mockResolvedValueOnce({ id: 'city-2', name: 'Helsinki' });

    const result = await service.resolve(
      [
        {
          day: 1,
          date: '2027-01-01',
          city: 'Gdynia',
          arrivalTime: '',
          departureTime: '',
        },
        {
          day: 2,
          date: '2027-01-02',
          city: 'Helsinki',
          arrivalTime: '',
          departureTime: '',
        },
      ],
      'admin@udanyrejs.pl',
    );

    expect(result?.map((day) => day.cityId)).toEqual(['city-1', 'city-2']);
  });
});
