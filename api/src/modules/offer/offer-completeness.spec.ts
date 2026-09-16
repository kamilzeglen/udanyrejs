import { City } from '@modules/city/city.entity';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { getOfferCompletenessIssues } from './offer-completeness';

describe('getOfferCompletenessIssues', () => {
  it('reports missing public assets and incomplete itinerary cities', () => {
    const offer = {
      itinerary: [
        {
          day: 1,
          city: 'Barcelona',
          cityId: 'city-1',
          arrivalTime: '',
          departureTime: '',
        },
        {
          day: 2,
          city: 'Marsylia',
          cityId: 'city-2',
          arrivalTime: '',
          departureTime: '',
        },
      ],
      company: { imageFile: null },
      ship: { imageFile: null, description: '   ' },
      imageFile: null,
    } as Offer;
    const terms = [
      {
        isActive: true,
        pdfFile: null,
        startDate: new Date('2027-05-12'),
        endDate: new Date('2027-05-19'),
      },
      {
        isActive: false,
        pdfFile: null,
        startDate: new Date('2027-06-12'),
        endDate: new Date('2027-06-19'),
      },
    ] as OfferTerm[];
    const cityById = new Map<string, City>([
      [
        'city-1',
        {
          id: 'city-1',
          name: 'Barcelona',
          latitude: null,
          longitude: 2.17,
          destinations: [],
        } as City,
      ],
      [
        'city-2',
        {
          id: 'city-2',
          name: 'Marsylia',
          latitude: 43.29,
          longitude: 5.37,
          destinations: [],
        } as City,
      ],
    ]);

    const issues = getOfferCompletenessIssues(offer, terms, cityById);

    expect(issues).toEqual([
      { code: 'offer-image', label: 'Brak zdjęcia oferty' },
      { code: 'company-image', label: 'Brak zdjęcia armatora' },
      { code: 'ship-image', label: 'Brak zdjęcia statku' },
      { code: 'ship-description', label: 'Brak opisu statku' },
      { code: 'term-pdf', label: 'Brak PDF: 12.05.2027–19.05.2027' },
      { code: 'city-coordinates', label: 'Barcelona: brak współrzędnych' },
      { code: 'city-destinations', label: 'Barcelona: brak regionów' },
      { code: 'city-destinations', label: 'Marsylia: brak regionów' },
    ]);
  });

  it('does not report issues for a complete offer', () => {
    const offer = {
      itinerary: [
        {
          day: 1,
          city: 'Barcelona',
          cityId: 'city-1',
          arrivalTime: '',
          departureTime: '',
        },
      ],
      company: { imageFile: { id: 'company-image' } },
      ship: { imageFile: { id: 'ship-image' }, description: 'Opis statku' },
      imageFile: { id: 'offer-image' },
    } as Offer;
    const terms = [{ isActive: true, pdfFile: { id: 'pdf-1' } }] as OfferTerm[];
    const cityById = new Map<string, City>([
      [
        'city-1',
        {
          id: 'city-1',
          name: 'Barcelona',
          latitude: 41.38,
          longitude: 2.17,
          destinations: [{ id: 'region-1' }],
        } as City,
      ],
    ]);

    expect(getOfferCompletenessIssues(offer, terms, cityById)).toEqual([]);
  });

  it('reports an itinerary stop that is not linked to a city', () => {
    const offer = {
      itinerary: [
        { day: 1, city: 'Nieznany port', arrivalTime: '', departureTime: '' },
      ],
      company: { imageFile: { id: 'company-image' } },
      ship: { imageFile: { id: 'ship-image' }, description: 'Opis statku' },
      imageFile: { id: 'offer-image' },
    } as Offer;

    const issues = getOfferCompletenessIssues(offer, [], new Map());

    expect(issues).toEqual([
      {
        code: 'city-not-found',
        label: 'Nieznany port: brak powiązanego miasta',
      },
    ]);
  });

  it('does not require a city or coordinates for a sea day', () => {
    const offer = {
      itinerary: [
        { day: 2, city: 'Dzień na morzu', arrivalTime: '', departureTime: '' },
      ],
      company: { imageFile: { id: 'company-image' } },
      ship: { imageFile: { id: 'ship-image' }, description: 'Opis statku' },
      imageFile: { id: 'offer-image' },
    } as Offer;

    expect(getOfferCompletenessIssues(offer, [], new Map())).toEqual([]);
  });
});
