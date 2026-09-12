export interface OfferSeoInput {
  name: string;
  imageFile?: { name: string };
  company?: { name: string };
}

export interface OfferTermPriceInput {
  fromPrice: number;
}

export interface OfferSeoData {
  title: string;
  description: string;
  image: string;
  structuredData: Record<string, unknown>;
}

export function computeOfferSeoData(
  offer: OfferSeoInput,
  terms: OfferTermPriceInput[],
  apiUrl: string,
  canonicalUrl: string,
): OfferSeoData {
  const description = `Sprawdź szczegóły rejsu: ${offer.name}. Wspaniała przygoda czeka! Rezerwuj swój rejs z UdanyRejs.`;
  const image = offer.imageFile?.name ? `${apiUrl}/offers/images/${offer.imageFile.name}` : null;

  return {
    title: `UdanyRejs - ${offer.name}`,
    description,
    image,
    structuredData: buildStructuredData(offer, terms, description, image, canonicalUrl),
  };
}

function buildStructuredData(
  offer: OfferSeoInput,
  terms: OfferTermPriceInput[],
  description: string,
  image: string,
  canonicalUrl: string,
): Record<string, unknown> {
  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: offer.name,
    description,
  };

  if (image) {
    structuredData['image'] = image;
  }

  if (offer.company?.name) {
    structuredData['provider'] = { '@type': 'Organization', name: offer.company.name };
  }

  const lowestPrice = findLowestPrice(terms);

  if (lowestPrice !== null) {
    structuredData['offers'] = {
      '@type': 'Offer',
      price: (lowestPrice / 100).toFixed(2),
      priceCurrency: 'EUR',
      url: canonicalUrl,
      availability: 'https://schema.org/InStock',
    };
  }

  return structuredData;
}

function findLowestPrice(terms: OfferTermPriceInput[]): number | null {
  const prices = terms.map((term) => term.fromPrice).filter((price) => price !== null && price !== undefined);

  if (!prices.length) {
    return null;
  }

  return Math.min(...prices);
}
