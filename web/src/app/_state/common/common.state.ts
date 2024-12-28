import {Company, Ship} from '@interfaces';


export type CommonState = Readonly<{
  companies: Company[];
  ships: Ship[];

  loading: boolean;
  errorMessage: string;

}>;

export const initialState: CommonState = {
  companies: null,
  ships: null,

  loading: false,
  errorMessage: null,
};
