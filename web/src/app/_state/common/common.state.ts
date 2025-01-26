import {Company, Destination, Ship, Category} from '@interfaces';
import {City} from '../../_interfaces/city';


export type CommonState = Readonly<{
  companies: Company[];
  ships: Ship[];
  cities: City[];
  categories: Category[];
  destinations: Destination[];

  loading: boolean;
  errorMessage: string;

}>;

export const initialState: CommonState = {
  companies: null,
  ships: null,
  cities: null,
  categories: null,
  destinations: null,

  loading: false,
  errorMessage: null,
};
