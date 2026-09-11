import { CabinType, City, Company, Destination, Ship, Category } from '@interfaces';
import { Log } from '../../_interfaces/log';

export type CommonState = Readonly<{
  companies: Company[];
  ships: Ship[];
  logs: Log[];
  categories: Category[];
  destinations: Destination[];
  cities: City[];
  cabinTypes: CabinType[];
  allCabinTypes: CabinType[];

  loading: boolean;
  errorMessage: string;
}>;

export const initialState: CommonState = {
  companies: null,
  ships: null,
  logs: null,
  categories: null,
  destinations: null,
  cities: null,
  cabinTypes: null,
  allCabinTypes: null,

  loading: false,
  errorMessage: null,
};
