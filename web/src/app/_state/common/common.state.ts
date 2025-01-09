import {Company, Destination, Ship, Category} from '@interfaces';


export type CommonState = Readonly<{
  companies: Company[];
  ships: Ship[];
  categories: Category[];
  destinations: Destination[];

  loading: boolean;
  errorMessage: string;

}>;

export const initialState: CommonState = {
  companies: null,
  ships: null,
  categories: null,
  destinations: null,

  loading: false,
  errorMessage: null,
};
