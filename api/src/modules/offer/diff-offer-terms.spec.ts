import { diffOfferTerms } from './diff-offer-terms';
import { OfferTerm } from './offer-term.entity';
import { OfferTermDto } from './dto/offer-term.dto';

function existingTerm(overrides: Partial<OfferTerm>): OfferTerm {
  return {
    id: 'term-id',
    offerId: 'offer-1',
    startDate: new Date('2027-01-10'),
    endDate: new Date('2027-01-17'),
    sourceUrl: null,
    prices: [],
    categories: [],
    shareStats: null,
    shareStatsId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as OfferTerm;
}

function incomingTerm(overrides: Partial<OfferTermDto>): OfferTermDto {
  return {
    startDate: '2027-01-10',
    endDate: '2027-01-17',
    prices: [{ cabinTypeId: 'cabin-1', price: 100000 }],
    ...overrides,
  } as OfferTermDto;
}

describe('diffOfferTerms', () => {
  it('matches an unchanged term by its date range and puts it in toUpdate', () => {
    const existing = existingTerm({ id: 'term-1' });
    const dto = incomingTerm({});

    const result = diffOfferTerms([existing], [dto]);

    expect(result.toUpdate).toEqual([{ existing, dto }]);
    expect(result.toCreate).toEqual([]);
    expect(result.toDelete).toEqual([]);
  });

  it('treats a term with a changed date range as delete-old plus create-new', () => {
    const existing = existingTerm({ id: 'term-1' });
    const dto = incomingTerm({
      startDate: '2027-03-01',
      endDate: '2027-03-08',
    });

    const result = diffOfferTerms([existing], [dto]);

    expect(result.toDelete).toEqual([existing]);
    expect(result.toCreate).toEqual([dto]);
    expect(result.toUpdate).toEqual([]);
  });

  it('puts a brand new term (no existing terms at all) in toCreate', () => {
    const dto = incomingTerm({});

    const result = diffOfferTerms([], [dto]);

    expect(result.toCreate).toEqual([dto]);
    expect(result.toUpdate).toEqual([]);
    expect(result.toDelete).toEqual([]);
  });

  it('puts an existing term missing from the incoming list in toDelete', () => {
    const existing = existingTerm({ id: 'term-1' });

    const result = diffOfferTerms([existing], []);

    expect(result.toDelete).toEqual([existing]);
    expect(result.toCreate).toEqual([]);
    expect(result.toUpdate).toEqual([]);
  });

  it('handles a mix: one unchanged, one new, one removed', () => {
    const unchanged = existingTerm({
      id: 'term-unchanged',
      startDate: new Date('2027-01-10'),
      endDate: new Date('2027-01-17'),
    });
    const removed = existingTerm({
      id: 'term-removed',
      startDate: new Date('2027-02-10'),
      endDate: new Date('2027-02-17'),
    });
    const unchangedDto = incomingTerm({
      startDate: '2027-01-10',
      endDate: '2027-01-17',
    });
    const newDto = incomingTerm({
      startDate: '2027-06-10',
      endDate: '2027-06-17',
    });

    const result = diffOfferTerms([unchanged, removed], [unchangedDto, newDto]);

    expect(result.toUpdate).toEqual([
      { existing: unchanged, dto: unchangedDto },
    ]);
    expect(result.toCreate).toEqual([newDto]);
    expect(result.toDelete).toEqual([removed]);
  });

  it('matches by date value, not by string/Date object identity', () => {
    const existing = existingTerm({
      id: 'term-1',
      startDate: new Date('2027-01-10T00:00:00.000Z'),
      endDate: new Date('2027-01-17T00:00:00.000Z'),
    });
    const dto = incomingTerm({
      startDate: '2027-01-10T00:00:00.000Z',
      endDate: '2027-01-17T00:00:00.000Z',
    });

    const result = diffOfferTerms([existing], [dto]);

    expect(result.toUpdate).toEqual([{ existing, dto }]);
  });
});
