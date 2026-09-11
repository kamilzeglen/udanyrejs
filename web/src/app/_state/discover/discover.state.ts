import { ScrapedOfferDraft } from '@interfaces';

export type DiscoverState = Readonly<{
  starting: boolean;
  drafts: ScrapedOfferDraft[];
  errorMessage: string;
}>;

export const initialState: DiscoverState = {
  starting: false,
  drafts: [],
  errorMessage: null,
};
