import { Offer } from './offer';

export interface Destination {
  id: string;
  name: string;
  isActive: boolean;
  offers: Offer[];
}
