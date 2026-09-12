import { OfferSearchResult } from '@interfaces';
import { groupOffersByOfferId } from './group-offers-by-offer';

function buildTerm(offerId: string, termId: string): OfferSearchResult {
  return {
    id: offerId,
    termId,
    name: `Offer ${offerId}`,
    startDate: '2026-01-01',
    endDate: '2026-01-10',
    fromPrice: 1000,
  } as OfferSearchResult;
}

describe('groupOffersByOfferId', () => {
  it('groups terms belonging to the same offer into a single entry', () => {
    const rows = [buildTerm('offer-1', 'term-1'), buildTerm('offer-1', 'term-2'), buildTerm('offer-2', 'term-3')];

    const groups = groupOffersByOfferId(rows);

    expect(groups.length).toBe(2);
    expect(groups[0].terms.map((term) => term.termId)).toEqual(['term-1', 'term-2']);
    expect(groups[1].terms.map((term) => term.termId)).toEqual(['term-3']);
  });

  it('uses the first encountered row as the group header', () => {
    const rows = [buildTerm('offer-1', 'term-1'), buildTerm('offer-1', 'term-2')];

    const groups = groupOffersByOfferId(rows);

    expect(groups[0].offer.termId).toBe('term-1');
  });

  it('preserves the order offers first appear in', () => {
    const rows = [buildTerm('offer-2', 'term-1'), buildTerm('offer-1', 'term-2'), buildTerm('offer-2', 'term-3')];

    const groups = groupOffersByOfferId(rows);

    expect(groups.map((group) => group.offer.id)).toEqual(['offer-2', 'offer-1']);
  });

  it('returns an empty array for an empty input', () => {
    expect(groupOffersByOfferId([])).toEqual([]);
  });
});
