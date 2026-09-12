import { computeOfferSeoData } from './compute-offer-seo-data.util';

describe('computeOfferSeoData', () => {
  const apiUrl = 'https://api.udanyrejs.pl';
  const canonicalUrl = 'https://udanyrejs.pl/offers/details/1';

  it('builds a title from the offer name', () => {
    const result = computeOfferSeoData({ name: 'Rejs po Karaibach' }, [], apiUrl, canonicalUrl);

    expect(result.title).toBe('UdanyRejs - Rejs po Karaibach');
  });

  it('builds a description mentioning the offer name', () => {
    const result = computeOfferSeoData({ name: 'Rejs po Karaibach' }, [], apiUrl, canonicalUrl);

    expect(result.description).toContain('Rejs po Karaibach');
  });

  it('builds an absolute image url from the offer image file name', () => {
    const result = computeOfferSeoData(
      { name: 'Rejs po Karaibach', imageFile: { name: 'abc.jpg' } },
      [],
      apiUrl,
      canonicalUrl,
    );

    expect(result.image).toBe('https://api.udanyrejs.pl/offers/images/abc.jpg');
  });

  it('returns null image when the offer has no image file', () => {
    const result = computeOfferSeoData({ name: 'Rejs po Karaibach' }, [], apiUrl, canonicalUrl);

    expect(result.image).toBeNull();
  });

  it('includes structured data with the offer name and type TouristTrip', () => {
    const result = computeOfferSeoData({ name: 'Rejs po Karaibach' }, [], apiUrl, canonicalUrl);

    expect(result.structuredData['@type']).toBe('TouristTrip');
    expect(result.structuredData['name']).toBe('Rejs po Karaibach');
  });

  it('includes the provider organization when the offer has a company', () => {
    const result = computeOfferSeoData(
      { name: 'Rejs po Karaibach', company: { name: 'Royal Caribbean' } },
      [],
      apiUrl,
      canonicalUrl,
    );

    expect(result.structuredData['provider']).toEqual({ '@type': 'Organization', name: 'Royal Caribbean' });
  });

  it('omits the provider when the offer has no company', () => {
    const result = computeOfferSeoData({ name: 'Rejs po Karaibach' }, [], apiUrl, canonicalUrl);

    expect(result.structuredData['provider']).toBeUndefined();
  });

  it('includes the lowest term price in structured data offers, converted from cents to EUR', () => {
    const result = computeOfferSeoData(
      { name: 'Rejs po Karaibach' },
      [{ fromPrice: 150000 }, { fromPrice: 99900 }],
      apiUrl,
      canonicalUrl,
    );

    expect(result.structuredData['offers']).toEqual({
      '@type': 'Offer',
      price: '999.00',
      priceCurrency: 'EUR',
      url: canonicalUrl,
      availability: 'https://schema.org/InStock',
    });
  });

  it('omits offers from structured data when there are no term prices', () => {
    const result = computeOfferSeoData({ name: 'Rejs po Karaibach' }, [], apiUrl, canonicalUrl);

    expect(result.structuredData['offers']).toBeUndefined();
  });

  it('ignores null term prices when finding the lowest price', () => {
    const result = computeOfferSeoData(
      { name: 'Rejs po Karaibach' },
      [{ fromPrice: null }, { fromPrice: 50000 }],
      apiUrl,
      canonicalUrl,
    );

    expect((result.structuredData['offers'] as { price: string }).price).toBe('500.00');
  });
});
