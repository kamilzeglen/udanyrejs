import {Offer} from '@interfaces';


export type OfferState = Readonly<{
  offers: Offer[];
  loading: boolean;
  errorMessage: string;
}>;

export const initialState: OfferState = {
  offers: null,
  loading: false,
  errorMessage: null,
};
