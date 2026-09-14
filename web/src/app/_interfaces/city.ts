import { Destination } from './destination';

export interface City {
  id: string;
  name: string;
  isActive: boolean;
  destinations: Destination[];
  createdAt: string;
  updatedAt: string;
}
