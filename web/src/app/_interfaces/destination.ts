import { Offer } from './offer';

export interface Destination {
  id: string;
  name: string;
  offers: Offer[];
}
