import {Company} from './company';
import {Offer} from './offer';
import {ImageFile} from './file';
import {FileUpload} from './file-upload';
import {User} from './user';

export interface Ship {
  id: string;
  name: string;
  description: string;
  yearBuilt: number;
  length: number;
  width: number;
  tonnage: number;
  passengersDecks: number;
  passengers: number;
  crew: number;
  currency: string;
  offers: Offer[];
  company: Company;
  companyId: string;
  imageFile: ImageFile | FileUpload;
  imageFileId: string;
  createdBy: User,
  createdById: string
  updatedBy: User,
  updatedById: string
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
