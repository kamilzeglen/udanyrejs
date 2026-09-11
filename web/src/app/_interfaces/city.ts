import { Destination } from './destination';

export interface City {
  id: string;
  name: string;
  destinations: Destination[];
  createdAt: string;
  updatedAt: string;
}
