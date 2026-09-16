import { ImageFile } from './file';
import { User } from './user';

export interface Company {
  id: string;
  name: string;
  isActive: boolean;
  showInMenu: boolean;
  key: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  description: string;
  priceIncludes: string[];
  priceExcludes: string[];
  imageFile: ImageFile;
  imageFileId: string;
  createdBy: User;
  createdById: string;
  updatedBy: User;
  updatedById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string;
}
