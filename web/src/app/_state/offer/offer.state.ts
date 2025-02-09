import {Offer} from '@interfaces';


export type OfferState = Readonly<{
  offers: Offer[];
  offersAmount: number;
  loading: boolean;
  errorMessage: string;
}>;

export const initialState: OfferState = {
  offers: null,
  offersAmount: 0,
  loading: false,
  errorMessage: null,
};
