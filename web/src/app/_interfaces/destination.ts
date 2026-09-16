import { Offer } from './offer';
import { ImageFile } from './file';

export interface Destination {
  id: string;
  name: string;
  isActive: boolean;
  showInMenu: boolean;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  description?: string;
  imageFile?: ImageFile;
  imageFileId?: string;
  offers: Offer[];
}
