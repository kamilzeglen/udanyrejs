import { Destination } from './destination';

export interface City {
  id: string;
  name: string;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  destinations: Destination[];
  createdAt: string;
  updatedAt: string;
}
