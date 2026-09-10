import { CabinType, Company, Destination, Ship, Category } from '@interfaces';
import { Log } from '../../_interfaces/log';

export type CommonState = Readonly<{
  companies: Company[];
  ships: Ship[];
  logs: Log[];
  categories: Category[];
  destinations: Destination[];
  cabinTypes: CabinType[];

  loading: boolean;
  errorMessage: string;
}>;

export const initialState: CommonState = {
  companies: null,
  ships: null,
  logs: null,
  categories: null,
  destinations: null,
  cabinTypes: null,

  loading: false,
  errorMessage: null,
};
