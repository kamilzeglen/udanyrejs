import { OfferSearchResult } from '@interfaces';

export interface GroupedOffer {
  offer: OfferSearchResult;
  terms: OfferSearchResult[];
}

export function groupOffersByOfferId(offers: OfferSearchResult[]): GroupedOffer[] {
  const groups: GroupedOffer[] = [];
  const groupByOfferId = new Map<string, GroupedOffer>();

  for (const term of offers) {
    const existingGroup = groupByOfferId.get(term.id);

    if (existingGroup) {
      existingGroup.terms.push(term);
      continue;
    }

    const newGroup: GroupedOffer = { offer: term, terms: [term] };
    groupByOfferId.set(term.id, newGroup);
    groups.push(newGroup);
  }

  return groups;
}
