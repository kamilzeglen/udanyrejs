import { OfferSearchResult } from '@interfaces';

export interface ShareStatsTotal {
  webClicks: number;
  facebookClicks: number;
  instagramClicks: number;
  tiktokClicks: number;
}

export interface GroupedOffer {
  offer: OfferSearchResult;
  terms: OfferSearchResult[];
  totalShareStats: ShareStatsTotal;
  // Liczba terminów tej oferty z własnym linkiem źródłowym - offer.offerUrl
  // służy już tylko do pierwszego zaimportowania, każdy termin synchronizuje
  // się dalej niezależnie przez własny sourceUrl (patrz admin-offer-list.html).
  termsWithSourceCount: number;
  // Oferta nie ma własnej flagi aktywności w bazie - liczymy ją tu z jej
  // terminów (ma choć jeden aktywny), żeby uniknąć jej wywoływania w
  // template'ach (patrz admin-offer-list.html - klasa "inactive-group").
  hasActiveTerm: boolean;
}

export function groupOffersByOfferId(offers: OfferSearchResult[]): GroupedOffer[] {
  const groups: GroupedOffer[] = [];
  const groupByOfferId = new Map<string, GroupedOffer>();

  for (const term of offers) {
    const existingGroup = groupByOfferId.get(term.id);

    if (existingGroup) {
      existingGroup.terms.push(term);
      addToTotal(existingGroup.totalShareStats, term.shareStats);
      existingGroup.termsWithSourceCount += term.sourceUrl ? 1 : 0;
      existingGroup.hasActiveTerm = existingGroup.hasActiveTerm || term.termIsActive;
      continue;
    }

    const newGroup: GroupedOffer = {
      offer: term,
      terms: [term],
      totalShareStats: { webClicks: 0, facebookClicks: 0, instagramClicks: 0, tiktokClicks: 0 },
      termsWithSourceCount: term.sourceUrl ? 1 : 0,
      hasActiveTerm: term.termIsActive,
    };
    addToTotal(newGroup.totalShareStats, term.shareStats);
    groupByOfferId.set(term.id, newGroup);
    groups.push(newGroup);
  }

  return groups;
}

function addToTotal(total: ShareStatsTotal, shareStats: ShareStatsTotal | undefined): void {
  if (!shareStats) {
    return;
  }

  total.webClicks += shareStats.webClicks;
  total.facebookClicks += shareStats.facebookClicks;
  total.instagramClicks += shareStats.instagramClicks;
  total.tiktokClicks += shareStats.tiktokClicks;
}
