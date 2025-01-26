import {Offer} from './offer';
import {City} from './city';
import {User} from './user';

export interface Itinerary {
  id: string
  day: number;
  city: City | string;
  cityId: string;
  date: string;
  arrivalTime: string;
  departureTime: string;
  offer: Offer;
  offerId: string;
  createdBy: User,
  createdById: string
  updatedBy: User,
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
