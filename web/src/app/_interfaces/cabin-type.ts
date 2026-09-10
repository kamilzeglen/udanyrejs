import { Company } from './company';
import { User } from './user';

export interface CabinType {
  id: string;
  name: string;
  company: Company;
  companyId: string;
  isActive: boolean;
  createdBy: User;
  createdById: string;
  updatedBy: User;
  updatedById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
