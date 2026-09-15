import { getMetadataArgsStorage } from 'typeorm';
import { Category } from '@modules/category/category.entity';
import { City } from '@modules/city/city.entity';
import { Destination } from '@modules/destination/destination.entity';
import { Offer } from './offer.entity';
import { OfferTerm } from './offer-term.entity';
import { OfferTermPrice } from './offer-term-price.entity';

describe('Offer deletion safety', () => {
  it.each([
    [Offer, 'ship'],
    [Offer, 'destinations'],
    [OfferTerm, 'categories'],
    [OfferTermPrice, 'cabinType'],
    [Destination, 'offers'],
    [Category, 'terms'],
    [City, 'destinations'],
  ])(
    'does not cascade persistence operations through %s.%s',
    (entity, propertyName) => {
      const relation = getMetadataArgsStorage().relations.find(
        (metadata) =>
          metadata.target === entity && metadata.propertyName === propertyName,
      );
      const cascade = relation?.options.cascade;
      const cascadeOperations = Array.isArray(cascade) ? cascade : [];

      expect(relation).toBeDefined();
      expect(cascade).not.toBe(true);
      expect(cascadeOperations).not.toContain('remove');
      expect(cascadeOperations).not.toContain('soft-remove');
    },
  );
});
