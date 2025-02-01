import {Offer} from './offer';
import {User} from './user';

export interface Category {
  id: string;
  name: string;
  url: string;
  position: number;
  isActive: boolean;
  isVisible: boolean;
  offers: Offer[];
  createdBy: User,
  createdById: string
  updatedBy: User,
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
