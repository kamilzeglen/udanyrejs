import {Company} from './company';

export interface Ship {
  id: string;
  name: string;
  company: Company;
  companyId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
