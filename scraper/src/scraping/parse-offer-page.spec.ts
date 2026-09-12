import {
  mapCabinGroupRows,
  mapRawToFullScrap,
  mapRawToPriceCheck,
  parseDdMmYyyy,
  parseEuroPrice,
  slugToTitleCase,
} from './parse-offer-page';
import { RawOfferPage, RawPriceCheckPage } from './raw-types';

describe('parseDdMmYyyy', () => {
  it('converts dd.mm.yyyy to yyyy-mm-dd', () => {
    expect(parseDdMmYyyy('04.10.2026')).toBe('2026-10-04');
  });
});

describe('parseEuroPrice', () => {
  it('parses a plain euro amount', () => {
    expect(parseEuroPrice('€1619.5')).toBe(1619.5);
  });

  it('parses an amount prefixed with "od "', () => {
    expect(parseEuroPrice('od €614.43')).toBe(614.43);
  });

  it('returns null when there is no numeric amount', () => {
    expect(parseEuroPrice('–')).toBeNull();
  });
});

describe('slugToTitleCase', () => {
  it('turns a hyphenated slug into a title-cased name', () => {
    expect(slugToTitleCase('norwegian-cruise-line')).toBe(
      'Norwegian Cruise Line',
    );
  });
});

describe('mapCabinGroupRows', () => {
  it('maps group rows to cabin prices, stripping the chevron glyph', () => {
    const result = mapCabinGroupRows([
      { labelText: '▸ wewnętrzna', minPriceText: 'od €614.43' },
      { labelText: '▸Suite (apartament)', minPriceText: 'od €1674.5' },
    ]);

    expect(result).toEqual([
      { label: 'wewnętrzna', price: 614.43 },
      { label: 'Suite (apartament)', price: 1674.5 },
    ]);
  });

  it('skips a group whose price is unavailable', () => {
    const result = mapCabinGroupRows([
      { labelText: '▸ wewnętrzna', minPriceText: '–' },
    ]);
    expect(result).toEqual([]);
  });
});

describe('mapRawToFullScrap', () => {
  const raw: RawOfferPage = {
    titleText: 'Rejs Hiszpania, Francja, Włochy',
    shipNameText: 'Norwegian Epic',
    companyHrefSlug: 'norwegian-cruise-line',
    ogImageContent:
      'https://rejsy4you.pl/public/upload/2021/10/20/holland_rzym_wlochy_6.jpg',
    pdfHref:
      'https://rejsy4you.pl/api/Itineraries/offerPdf?itineraryId=93096&scheduleId=208990',
    itineraryRows: [
      {
        dayText: '1',
        dateText: '04.10.2026',
        cityText: 'Barcelona',
        arrivalText: '',
        departureText: '17:00',
      },
      {
        dayText: '2',
        dateText: '05.10.2026',
        cityText: 'Marsylia',
        arrivalText: '07:00',
        departureText: '17:00',
      },
    ],
    cabinGroupRows: [
      { labelText: '▸ wewnętrzna', minPriceText: 'od €614.43' },
      { labelText: '▸ zewnętrzna z balkonem', minPriceText: 'od €1619.5' },
    ],
    otherTermLinks: [
      {
        href: 'https://rejsy4you.pl/rejs/93098_hiszpania-francja-wlochy_208992',
        startDateText: '2026-10-18',
        endDateText: '2026-10-25',
        isDifferentRoute: false,
      },
      {
        href: 'https://rejsy4you.pl/rejs/93124_hiszpania-malta-tunezja_209018',
        startDateText: '2027-05-02',
        endDateText: '2027-05-09',
        isDifferentRoute: true,
      },
    ],
  };

  it('maps the primary term from the itinerary dates and cabin rows', () => {
    const result = mapRawToFullScrap(
      raw,
      'https://rejsy4you.pl/rejs/93096_hiszpania-francja-wlochy_208990',
      100,
    );

    expect(result.name).toBe('Rejs Hiszpania, Francja, Włochy');
    expect(result.shipName).toBe('Norwegian Epic');
    expect(result.companyName).toBe('Norwegian Cruise Line');
    expect(result.imageUrl).toBe(
      'https://rejsy4you.pl/public/upload/2021/10/20/holland_rzym_wlochy_6.jpg',
    );
    expect(result.pdfUrl).toBe(
      'https://rejsy4you.pl/api/Itineraries/offerPdf?itineraryId=93096&scheduleId=208990',
    );
    expect(result.itinerary).toEqual([
      {
        day: 1,
        date: '2026-10-04',
        city: 'Barcelona',
        arrivalTime: '',
        departureTime: '17:00',
      },
      {
        day: 2,
        date: '2026-10-05',
        city: 'Marsylia',
        arrivalTime: '07:00',
        departureTime: '17:00',
      },
    ]);
    expect(result.terms[0]).toEqual({
      startDate: '2026-10-04',
      endDate: '2026-10-05',
      sourceUrl:
        'https://rejsy4you.pl/rejs/93096_hiszpania-francja-wlochy_208990',
      cabinPrices: [
        { label: 'wewnętrzna', price: 614.43 },
        { label: 'zewnętrzna z balkonem', price: 1619.5 },
      ],
    });
  });

  it('lists same-route other terms but excludes different-route ones', () => {
    const result = mapRawToFullScrap(
      raw,
      'https://rejsy4you.pl/rejs/93096_hiszpania-francja-wlochy_208990',
      100,
    );

    expect(result.terms).toHaveLength(2);
    expect(result.terms[1].sourceUrl).toBe(
      'https://rejsy4you.pl/rejs/93098_hiszpania-francja-wlochy_208992',
    );
    expect(result.terms[1].startDate).toBe('2026-10-18');
    expect(result.terms[1].endDate).toBe('2026-10-25');
    expect(result.terms[1].cabinPrices).toEqual([]);
  });

  it('caps the number of other terms at maxTerms', () => {
    const result = mapRawToFullScrap(
      raw,
      'https://rejsy4you.pl/rejs/93096_hiszpania-francja-wlochy_208990',
      1,
    );
    expect(result.terms).toHaveLength(1);
  });
});

describe('mapRawToPriceCheck', () => {
  it('maps a found page to available with its cabin prices', () => {
    const raw: RawPriceCheckPage = {
      pageFound: true,
      cabinGroupRows: [{ labelText: '▸ wewnętrzna', minPriceText: 'od €620' }],
    };
    expect(mapRawToPriceCheck(raw)).toEqual({
      available: true,
      cabinPrices: [{ label: 'wewnętrzna', price: 620 }],
    });
  });

  it('maps a missing page to unavailable with no prices', () => {
    const raw: RawPriceCheckPage = { pageFound: false, cabinGroupRows: [] };
    expect(mapRawToPriceCheck(raw)).toEqual({
      available: false,
      cabinPrices: [],
    });
  });
});
