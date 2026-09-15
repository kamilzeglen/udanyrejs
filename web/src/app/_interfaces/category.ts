import { User } from './user';

export interface Category {
  id: string;
  name: string;
  url: string;
  position: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isVisible: boolean;
  offerCount?: number;
  createdBy: User;
  createdById: string;
  updatedBy: User;
  updatedById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
